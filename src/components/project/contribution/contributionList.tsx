'use client';

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	MenuItem,
	Select,
	SelectChangeEvent,
	Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Image from 'next/image';

import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

import { useAccount, useNetwork } from 'wagmi';

import { useConnectModal } from '@rainbow-me/rainbowkit';

import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

import axios from 'axios';

import useSWR from 'swr';

import { ethers } from 'ethers';

import Checkbox, { CheckboxTypeEnum } from '@/components/checkbox';
import { StyledFlexBox } from '@/components/styledComponents';
import ContributionItem from '@/components/project/contribution/contributionItem';
import {
	EasAttestation,
	EasAttestationData,
	EasAttestationDecodedData,
	getEASContributionList,
	getEasSignature,
	getEASVoteRecord,
} from '@/services/eas';
import {
	EasSchemaClaimKey,
	EasSchemaContributionKey,
	EasSchemaData,
	EasSchemaMap,
	EasSchemaTemplateMap,
	EasSchemaVoteKey,
} from '@/constant/eas';
import { useUserStore } from '@/store/user';
import { useEthersProvider, useEthersSigner } from '@/common/ether';

import { closeGlobalLoading, openGlobalLoading, showToast } from '@/store/utils';

import {
	deleteContribution,
	getContributionList,
	getContributorList,
	getProjectDetail,
	prepareClaim,
	updateContributionStatus,
} from '@/services';

import useEas from '@/hooks/useEas';

export enum IVoteValueEnum {
	FOR = 1,
	AGAINST = 2,
	ABSTAIN = 3,
}

export interface IVoteParams {
	contributionId: number;
	value: IVoteValueEnum;
	uId: string;
}

export interface IClaimParams {
	contributionId: number;
	uId: string;
	token: number;
	voters: string[];
	voteValues: number[];
	toIds: string[];
}

export interface IContributionListProps {
	projectId: string;
	refresh?: number;
	onUpdate?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
interface BigInt {
	/** Convert to BigInt to string form in JSON.stringify */
	toJSON: () => string;
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

const ContributionList = ({ projectId, onUpdate, refresh }: IContributionListProps) => {
	const { myInfo } = useUserStore();
	const { eas, getEasScanURL, submitSignedAttestation } = useEas();
	const signer = useEthersSigner();
	const provider = useEthersProvider();
	const network = useNetwork();
	const { address: myAddress } = useAccount();
	const { openConnectModal } = useConnectModal();

	const [claimTotal, getClaimTotal] = useState(0);
	const [showFilter, setShowFilter] = useState(false);
	const [showSelect, setShowSelect] = useState(false);
	const [period, setPeriod] = useState('ALL');
	const [voteStatus, setVoteStatus] = useState('ALL');
	const [contributor, setContributor] = useState('ALL');
	const [selected, setSelected] = useState<Array<number>>([]);
	const [showDialog, setShowDialog] = useState(false);
	const [activeCId, setActiveCId] = useState<number>();

	const [easVoteList, setEasVoteList] = useState<EasAttestation<EasSchemaVoteKey>[]>([]);

	const { data: projectDetail, mutate: mutateProjectDetail } = useSWR(
		['project/detail', projectId],
		() => getProjectDetail(projectId),
		{
			onSuccess: (data) => console.log('getProjectDetail', data),
		},
	);

	const { data: contributorList, mutate: mutateContributorList } = useSWR(
		['contributor/list', projectId],
		() => getContributorList(projectId),
		{
			fallbackData: [],
			onSuccess: (data) => console.log('getContributorList', data),
		},
	);

	const { data: contributionList, mutate: mutateContributionList } = useSWR(
		['contribution/list', projectId],
		() => fetchContributionList(),
		{
			fallbackData: [],
			onSuccess: (data) => console.log('fetchContributionList', data),
		},
	);

	const contributionUIds = useMemo(() => {
		return contributionList
			.filter((contribution) => !!contribution.uId)
			.map((item) => item.uId) as string[];
	}, [contributionList]);

	const easVoteMap = useMemo(() => {
		if (easVoteList.length === 0) return {};
		const map = contributionUIds.reduce(
			(pre, cur) => {
				return {
					...pre,
					[cur]: [],
				};
			},
			{} as Record<string, EasAttestation<EasSchemaVoteKey>[]>,
		);
		easVoteList.forEach((item) => {
			map[item.refUID].push(item);
		});
		console.log('easVoteMap', map);
		return map;
	}, [easVoteList, contributionUIds]);
	const operatorId = useMemo(() => {
		if (contributorList.length === 0 || !myInfo) {
			return '';
		}
		return contributorList.filter((contributor) => contributor.userId === myInfo?.id)[0]?.id;
	}, [contributorList, myInfo]);

	useEffect(() => {
		mutateProjectDetail();
		mutateContributorList();
		mutateContributionList();
	}, [projectId]);

	useEffect(() => {
		if (refresh) {
			console.log('refresh', refresh);
			mutateContributionList();
		}
	}, [refresh]);

	useEffect(() => {
		if (contributionUIds.length > 0) {
			fetchEasContributionList(contributionUIds);
			fetchEasVoteList(contributionUIds);
		}
	}, [contributionUIds]);

	const fetchContributionList = async () => {
		try {
			const { list } = await getContributionList({
				pageSize: 50,
				currentPage: 1,
				projectId: projectId,
			});
			console.log('getContributionList', list);
			return list;
		} catch (err) {
			return Promise.reject(err);
		}
	};

	const fetchEasContributionList = async (uIds: string[]) => {
		try {
			const { attestations } = await getEASContributionList(uIds, network.chain?.id);
			const easList = attestations.map((item) => ({
				...item,
				decodedDataJson: JSON.parse(
					item.decodedDataJson as string,
				) as EasAttestationDecodedData<EasSchemaContributionKey>[],
				data: JSON.parse(item.data as string) as EasAttestationData,
			}));
			// setEasContributionList(easList);
			console.log('EAS Data[graphql] -> ContributionList: ', easList);
		} catch (err) {
			console.error('EAS Data[graphql] -> getEASContributionList error', err);
		}
	};
	const fetchEasVoteList = async (uIds: string[]) => {
		try {
			const { attestations } = await getEASVoteRecord(uIds as string[], network.chain?.id);
			const easVoteList = attestations.map((item) => ({
				...item,
				decodedDataJson: JSON.parse(
					item.decodedDataJson as string,
				) as EasAttestationDecodedData<EasSchemaVoteKey>[],
				data: JSON.parse(item.data as string) as EasAttestationData,
			}));
			console.log('EAS Data[graphql] -> easVoteList', easVoteList);
			setEasVoteList(easVoteList);
		} catch (err) {
			console.error('EAS Data[graphql] -> getEASVoteRecord error', err);
		}
	};

	const handleHideSelect = () => {
		setShowSelect(false);
	};

	const handlePeriodChange = (event: SelectChangeEvent) => {
		setPeriod(event.target.value);
	};
	const handleVoteStatusChange = (event: SelectChangeEvent) => {
		setVoteStatus(event.target.value);
	};
	const handleContributorChange = (event: SelectChangeEvent) => {
		setContributor(event.target.value);
	};

	const onClickFilterBtn = () => {
		if (showFilter) {
			setShowSelect(false);
		}
		setShowFilter((pre) => !pre);
	};

	const onClickSelectBtn = () => {
		setShowSelect((pre) => !pre);
	};

	const handleRest = () => {
		setVoteStatus('ALL');
		setPeriod('ALL');
		setContributor('ALL');
	};

	const onClickSelectParent = (type: Exclude<CheckboxTypeEnum, 'Partial'>) => {
		console.log('type', type);
		if (type === 'All') {
			setSelected(contributionList.map((item, idx) => item.id));
		} else {
			setSelected([]);
		}
	};

	const onSelect = (idList: number[]) => {
		setSelected(idList);
	};

	const onCloseDialog = () => {
		setShowDialog(false);
	};
	const showDeleteDialog = useCallback((contributionId: number) => {
		setActiveCId(contributionId);
		setShowDialog(true);
	}, []);

	const onDelete = async () => {
		try {
			openGlobalLoading();
			if (!activeCId) return false;
			const res = await deleteContribution(activeCId);
			console.log('deleteContribution res', res);
			setShowDialog(false);
			await mutateContributionList();
		} catch (err: any) {
			if (err.message) {
				showToast(err.message, 'error');
			}
			console.error('onDelete error', err);
		} finally {
			closeGlobalLoading();
		}
	};

	const handleVote = useCallback(
		async ({ contributionId, value, uId }: IVoteParams) => {
			if (!myAddress) {
				openConnectModal?.();
				return false;
			}
			console.log('vote params', contributionId, value, uId);
			if (!uId) {
				console.error('uId not exist');
				return;
			}
			try {
				openGlobalLoading();
				const offchain = await eas.getOffchain();
				const voteSchemaUid = EasSchemaMap.vote;

				const schemaEncoder = new SchemaEncoder(EasSchemaTemplateMap.vote);
				const data: EasSchemaData<EasSchemaVoteKey>[] = [
					{ name: 'ProjectAddress', value: projectId, type: 'address' },
					{ name: 'ContributionID', value: contributionId, type: 'uint64' },
					{ name: 'VoteChoice', value: value, type: 'uint8' },
					{ name: 'Comment', value: 'Good contribution', type: 'string' },
				];
				const encodedData = schemaEncoder.encodeData(data);
				const block = await provider.getBlock('latest');
				if (!signer) {
					return;
				}
				const offchainAttestation = await offchain.signOffchainAttestation(
					{
						recipient: '0x0000000000000000000000000000000000000000',
						expirationTime: BigInt(0),
						time: BigInt(block ? block.timestamp : 0),
						revocable: true,
						version: 1,
						nonce: BigInt(0),
						schema: voteSchemaUid,
						refUID: uId, // 可用来查询vote信息
						data: encodedData,
					},
					signer,
				);
				console.log('vote offchainAttestation', offchainAttestation);

				const res = await submitSignedAttestation({
					signer: myAddress as string,
					sig: offchainAttestation,
				});
				console.log('vote submitSignedAttestation', res);
				if (res.data.error) {
					console.error('vote submitSignedAttestation fail', res.data);
					throw new Error(res.data.error);
				}
				showToast('Vote success', 'success');
				const baseURL = getEasScanURL();
				// Update ENS names
				await axios.get(`${baseURL}/api/getENS/${myAddress}`);
				const cids = contributionList
					.filter((contribution) => !!contribution.uId)
					.map((item) => item.uId);
				await fetchEasContributionList(cids as string[]);
				await fetchEasVoteList(contributionUIds);
			} catch (e) {
				console.error('onVote error', e);
			} finally {
				closeGlobalLoading();
			}
		},
		[projectId, signer, myAddress, eas],
	);

	const handleClaim = useCallback(
		async (claimParams: IClaimParams) => {
			const { contributionId, uId, token, voters, voteValues, toIds } = claimParams;
			// const claimAddress = await readProjectContract(contributionId);
			// if (claimAddress === myAddress) {
			// 	console.log('已经claim过了');
			// 	return false;
			// }
			console.log('onClaim params', claimParams);
			if (!myAddress) {
				openConnectModal?.();
				return false;
			}

			try {
				openGlobalLoading();
				const claimSchemaUid = EasSchemaMap.claim;

				const toWallet = contributorList.find((item) => item.id === toIds[0])
					?.wallet as string;
				// TODO 待确认 默认选第一个To里面的人
				const signature = await prepareClaim(contributionId, {
					wallet: myAddress as string,
					toWallet: toWallet,
					chainId: network.chain?.id as number,
				});
				console.log('signature', signature);

				const schemaEncoder = new SchemaEncoder(EasSchemaTemplateMap.claim);
				const data: EasSchemaData<EasSchemaClaimKey>[] = [
					{ name: 'ProjectAddress', value: projectId, type: 'address' },
					{ name: 'ContributionID', value: contributionId, type: 'uint64' },
					{ name: 'Voters', value: voters, type: 'address[]' },
					{ name: 'VoteChoices', value: voteValues, type: 'uint8[]' },
					{ name: 'Recipient', value: myAddress, type: 'address' },
					{ name: 'Token', value: ethers.parseUnits(token.toString()), type: 'uint256' },
					{ name: 'Signatures', value: signature, type: 'bytes' },
				];
				const encodedData = schemaEncoder.encodeData(data);

				const attestation = await eas.attest({
					schema: claimSchemaUid,
					data: {
						recipient: myAddress as string,
						expirationTime: BigInt(0),
						revocable: false,
						refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
						data: encodedData,
						value: BigInt(0),
					},
				});
				console.log('onchainAttestation:', attestation);
				const updateStatus = await updateContributionStatus(contributionId, {
					type: 'claim',
					uId: uId,
					operatorId: operatorId,
				});
				showToast('Claim success', 'success');
				console.log('claim updateStatus success', updateStatus);
				onUpdate?.();
			} catch (err: any) {
				console.error('onClaim error', err);
				if (err.message) {
					showToast(err.message, 'error');
				}
			} finally {
				closeGlobalLoading();
			}
		},
		[projectId, myAddress, eas, network],
	);

	return (
		<>
			<StyledFlexBox sx={{ justifyContent: 'space-between', marginTop: '16px' }}>
				<Typography typography={'h3'}>Contributions</Typography>
				<StyledFlexBox sx={{ cursor: 'pointer' }}>
					<Image
						src={'/images/claim.png'}
						width={24}
						height={24}
						alt={'claim'}
						onClick={onClickFilterBtn}
					/>
					{/*<Button variant={'outlined'} sx={{ marginLeft: '16px' }}>*/}
					{/*	Claim({claimTotal})*/}
					{/*</Button>*/}
				</StyledFlexBox>
			</StyledFlexBox>
			{/*TODO 更新filter条件*/}
			{showFilter ? (
				<StyledFlexBox sx={{ marginTop: '16px', justifyContent: 'space-between' }}>
					<StyledFlexBox>
						<Select
							id="period-select"
							value={period}
							onChange={handlePeriodChange}
							placeholder={'Period'}
							sx={{ width: '160px' }}
							size={'small'}
						>
							<MenuItem value={'ALL'}>All time</MenuItem>
							<MenuItem value={'2'}>This week</MenuItem>
							<MenuItem value={'3'}>This month</MenuItem>
							<MenuItem value={'4'}>This season</MenuItem>
							<MenuItem value={'5'}>This year</MenuItem>
						</Select>
						<Select
							id="vote-status"
							value={voteStatus}
							onChange={handleVoteStatusChange}
							placeholder={'Vote Status'}
							sx={{ width: '200px', margin: '0 16px' }}
							size={'small'}
						>
							<MenuItem value={'ALL'}>All status</MenuItem>
							<MenuItem value={'2'}>Voted by me</MenuItem>
							<MenuItem value={'3'}>Unvoted by me</MenuItem>
							<MenuItem value={'4'}>voted ended</MenuItem>
						</Select>
						<Select
							id="contributor"
							value={contributor}
							onChange={handleContributorChange}
							placeholder={'Contributor'}
							sx={{ width: '200px' }}
							size={'small'}
						>
							<MenuItem value={'ALL'}>All contributors</MenuItem>
							{contributorList.map((contributor) => (
								<MenuItem key={contributor.wallet} value={contributor.wallet}>
									{contributor.nickName}
								</MenuItem>
							))}
						</Select>
						<Button variant={'text'} sx={{ marginLeft: '16px' }} onClick={handleRest}>
							Reset
						</Button>
					</StyledFlexBox>
					<Button variant={'text'} onClick={onClickSelectBtn}>
						Select
					</Button>
				</StyledFlexBox>
			) : null}

			{showSelect ? (
				<StyledFlexBox
					sx={{
						marginTop: '16px',
						marginBottom: '16px',
						justifyContent: 'space-between',
					}}
				>
					<StyledFlexBox>
						{/* TODO use native checkbox */}
						<Checkbox
							total={contributionList.length}
							selected={selected.length}
							onChange={onClickSelectParent}
						/>
						<Typography variant={'body1'}>{selected.length} have selected</Typography>
					</StyledFlexBox>
					<StyledFlexBox>
						<Button
							variant="outlined"
							size={'large'}
							color={'success'}
							sx={{ width: '112px', marginLeft: '12px' }}
							startIcon={<DoneOutlinedIcon />}
						>
							For
						</Button>
						<Button
							variant="outlined"
							size={'large'}
							color={'error'}
							sx={{ width: '112px', marginLeft: '12px' }}
							startIcon={<ClearOutlinedIcon />}
						>
							Again
						</Button>
						<Button
							variant="outlined"
							size={'large'}
							color={'primary'}
							sx={{ width: '112px', marginLeft: '12px' }}
							startIcon={<ArrowForwardOutlinedIcon />}
						>
							Abstain
						</Button>
						<Button
							variant="outlined"
							size={'large'}
							color={'info'}
							sx={{ width: '112px', marginLeft: '12px' }}
							onClick={handleHideSelect}
						>
							Cancel
						</Button>
					</StyledFlexBox>
				</StyledFlexBox>
			) : null}

			{projectDetail && contributionList.length > 0
				? contributionList.map((contribution, idx) => (
						<ContributionItem
							key={contribution.id}
							contribution={contribution}
							showSelect={showSelect}
							selected={selected}
							onSelect={onSelect}
							showDeleteDialog={showDeleteDialog}
							projectDetail={projectDetail}
							onVote={handleVote}
							onClaim={handleClaim}
							easVoteList={easVoteMap[contribution.uId as string]}
							contributorList={contributorList}
						/>
				  ))
				: null}

			<Dialog
				open={showDialog}
				onClose={onCloseDialog}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				{/*<DialogTitle id="alert-dialog-title">*/}
				{/*	{"Use Google's location service?"}*/}
				{/*</DialogTitle>*/}
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Are you sure to delete this contribution?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={onCloseDialog}>Cancel</Button>
					<Button onClick={onDelete} autoFocus>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default ContributionList;
