'use client';

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	Stack,
	styled,
	TablePagination,
	Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

import { useAccount } from 'wagmi';

import useSWR from 'swr';

import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

import Image from 'next/image';

import { ethers } from 'ethers';

import { endOfYear, startOfYear } from 'date-fns';

import CustomCheckbox, { CheckboxTypeEnum } from '@/components/checkbox';
import { StyledFlexBox } from '@/components/styledComponents';
import {
	EasAttestation,
	EasAttestationData,
	EasAttestationDecodedData,
	getEASContributionList,
	getEASVoteRecord,
} from '@/services/eas';
import {
	EasSchemaClaimKey,
	EasSchemaContributionKey,
	EasSchemaData,
	EasSchemaMap,
	EasSchemaTemplateMap,
	EasSchemaVoteKey,
} from '@/constant/contract';
import { useUserStore } from '@/store/user';

import { closeGlobalLoading, openGlobalLoading, showToast } from '@/store/utils';

import {
	deleteContribution,
	getContributionList,
	getContributionTypeList,
	getContributorList,
	getProjectDetail,
	IContribution,
	prepareClaim,
	Status,
	updateContributionStatus,
} from '@/services';

import { FilterIcon } from '@/icons';

import useContributionListFilter from '@/components/project/contribution/useContributionListFilter';

import useEas from '@/hooks/useEas';

import { setContributionListParam, setContributionUids } from '@/store/project';

import ContributionItem, { IVoteData } from './contributionItem';

export enum IVoteValueEnum {
	FOR = 1,
	AGAINST = 2,
	ABSTAIN = 3,
}

export interface IVoteParams {
	contributionId: string;
	value: IVoteValueEnum;
	uId: string;
}

export interface IClaimParams {
	contributionId: string;
	uId: string;
	token: number;
	voters: string[];
	voteValues: number[];
	toIds: string[];
}

export interface IContributionListProps {
	projectId: string;
	onUpdate?: () => void;
	showHeader?: boolean;
	wallet?: string;
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

const ContributionList = ({ projectId, showHeader = true, wallet }: IContributionListProps) => {
	const { myInfo } = useUserStore();
	const { chainId } = useAccount();
	const { address: myAddress } = useAccount();
	const { eas } = useEas();

	const [showFilter, setShowFilter] = useState(false);
	const [showMultiSelect, setShowMultiSelect] = useState(false);

	const [selected, setSelected] = useState<Array<string>>([]);
	const [showDialog, setShowDialog] = useState(false);
	const [activeCid, setActiveCid] = useState<string>();
	const [activeUid, setActiveUid] = useState<string>();

	const [curPage, setCurPage] = useState(0);
	const [pageSize, setPageSize] = useState(25);
	const [total, setTotal] = useState(0);
	const [isInit, setIsInit] = useState(false);

	const [dateFrom, setDateFrom] = useState<Date>();
	const [dateTo, setDateTo] = useState<Date>();

	const { data: projectDetail, mutate: mutateProjectDetail } = useSWR(
		['project/detail', projectId],
		() => getProjectDetail(projectId),
		{
			// onSuccess: (data) => console.log('[projectDetail]', data),
		},
	);

	const {
		data: contributorList,
		mutate: mutateContributorList,
		isLoading,
	} = useSWR(['contributor/list', projectId], () => getContributorList(projectId), {
		fallbackData: [],
		onSuccess: (data) => {
			// console.log('[contributorList]', data);
		},
	});

	const { data: contributionTypeList } = useSWR(
		['project/contributionType', projectId],
		() => getContributionTypeList(projectId),
		{ fallbackData: [] },
	);

	const contributionListParam = useMemo(() => {
		return `contribution/list/wallet${projectId}${wallet}${curPage}${pageSize}${dateFrom ? dateFrom.getTime() : ''}${dateTo ? dateTo.getTime() : ''}`;
	}, [wallet, projectId, curPage, pageSize, dateFrom, dateTo]);

	const { data: contributionList, mutate: mutateContributionList } = useSWR(
		contributionListParam,
		() =>
			fetchContributionList({
				projectId,
				curPage,
				pageSize,
				wallet,
				endDateFrom: dateFrom ? dateFrom.getTime() : undefined,
				endDateTo: dateTo ? dateTo.getTime() : undefined,
			}),
		{
			fallbackData: [],
			onSuccess: (data) => {
				if (!isInit) {
					setIsInit(true);
				}
			},
			keepPreviousData: true,
		},
	);

	const contributionUIds = useMemo(() => {
		return contributionList
			.filter((contribution) => !!contribution.uId)
			.map((item) => item.uId) as string[];
	}, [contributionList]);

	const { data: easVoteList } = useSWR(
		['eas/vote/list', contributionUIds],
		() => fetchEasVoteList(contributionUIds),
		{
			fallbackData: [],
			onSuccess: (data) => {
				// console.log('[EAS:voteList]', data);
			},
			refreshInterval: 15000, // 15s刷一次
		},
	);
	/**
	 * Record<uId, Record<signer, IVoteValueEnum>>
	 */
	const easVoteNumberBySigner = useMemo(() => {
		if (easVoteList.length === 0 || contributionUIds.length === 0) {
			return {};
		}
		const easVoteMap = contributionUIds.reduce(
			(pre, cur) => {
				return {
					...pre,
					[cur]: easVoteList.filter((item) => item.refUID == cur),
				};
			},
			{} as Record<string, EasAttestation<EasSchemaVoteKey>[]>,
		);

		const map: Record<string, IVoteData> = {};
		for (const [uId, voteList] of Object.entries(easVoteMap)) {
			const signerMap: Record<string, IVoteValueEnum> = {};
			voteList.forEach((vote) => {
				const signer = (vote.data as EasAttestationData).signer;
				const decodedDataJson =
					vote.decodedDataJson as EasAttestationDecodedData<EasSchemaVoteKey>[];
				const voteValueItem = decodedDataJson.find((item) => item.name === 'VoteChoice');
				// 同一用户用最新的进行覆盖
				signerMap[signer] = voteValueItem?.value.value as IVoteValueEnum;
			});
			map[uId] = signerMap;
		}
		return map;
	}, [easVoteList, contributionUIds]);

	const operatorId = useMemo(() => {
		if (contributorList.length === 0 || !myInfo) {
			return '';
		}
		return contributorList.filter((contributor) => contributor.userId === myInfo?.id)[0]?.id;
	}, [contributorList, myInfo]);

	const [canClaimedMap, setCanClaimedMap] = useState<Record<string, IContribution>>({});

	const {
		renderFilter,
		filterContributionList,
		canClaimedContributionList,
		endDateFrom,
		endDateTo,
	} = useContributionListFilter({
		contributionList,
		contributorList,
		projectDetail,
		easVoteNumberBySigner,
		canClaimedMap,
	});

	const canClaimTotalCredit = useMemo(() => {
		return canClaimedContributionList.reduce((pre, cur) => pre + cur.credit, 0);
	}, [canClaimedContributionList]);

	useEffect(() => {
		mutateProjectDetail();
		mutateContributorList();
		mutateContributionList();
	}, [projectId]);

	useEffect(() => {
		setContributionUids(contributionUIds);
	}, [contributionUIds]);

	useEffect(() => {
		setContributionListParam(contributionListParam);
	}, [contributionListParam]);

	useEffect(() => {
		setDateFrom(endDateFrom || undefined);
	}, [endDateFrom]);

	useEffect(() => {
		setDateTo(endDateTo || undefined);
	}, [endDateTo]);

	const setCanClaimedContribution = (contribution: IContribution) => {
		setCanClaimedMap((pre) => {
			return {
				...pre,
				[contribution.id]: contribution,
			};
		});
	};

	const onPageChange = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
		setCurPage(page);
	};
	const handlePageSizeChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setPageSize(parseInt(event.target.value, 10));
		setCurPage(0);
	};

	const fetchContributionList = async (params: {
		projectId: string;
		curPage: number;
		pageSize: number;
		wallet?: string;
		endDateFrom?: number;
		endDateTo?: number;
	}) => {
		try {
			// openGlobalLoading();
			const { projectId, curPage, pageSize, wallet, endDateFrom, endDateTo } = params;
			const { list, total } = await getContributionList({
				pageSize: pageSize,
				currentPage: curPage + 1,
				projectId: projectId,
				wallet,
				endDateFrom,
				endDateTo,
			});
			const filterList = list.filter((item) => item.status !== Status.UNREADY);
			setTotal(total);
			return filterList;
		} catch (err) {
			return Promise.reject(err);
		} finally {
			// closeGlobalLoading();
		}
	};

	const fetchEasContributionList = async (uIds: string[]) => {
		try {
			// uids存在才会进行计算
			const ids = uIds.filter((id) => !!id);
			const { attestations } = await getEASContributionList(ids, chainId);
			const easList = attestations.map((item) => ({
				...item,
				decodedDataJson: JSON.parse(
					item.decodedDataJson as string,
				) as EasAttestationDecodedData<EasSchemaContributionKey>[],
				data: JSON.parse(item.data as string) as EasAttestationData,
			}));
			// console.log('EAS Data[graphql] -> ContributionList: ', easList);
		} catch (err) {
			console.error('EAS Data[graphql] -> getEASContributionList error', err);
		}
	};

	const fetchEasVoteList = async (uIds: string[]) => {
		if (uIds.length === 0) return Promise.resolve([]);
		try {
			const { attestations } = await getEASVoteRecord(uIds as string[], chainId);
			return attestations.map((item) => ({
				...item,
				decodedDataJson: JSON.parse(
					item.decodedDataJson as string,
				) as EasAttestationDecodedData<EasSchemaVoteKey>[],
				data: JSON.parse(item.data as string) as EasAttestationData,
			}));
		} catch (err) {
			console.error('EAS Data[graphql] -> getEASVoteRecord error', err);
			return Promise.reject(err);
		}
	};

	const handleHideSelect = () => {
		setShowMultiSelect(false);
	};

	const onClickFilterBtn = () => {
		setShowFilter((pre) => !pre);
		setShowMultiSelect(false);
	};

	const onClickSelectBtn = () => {
		setShowMultiSelect((pre) => !pre);
		setShowFilter((pre) => !pre);
	};

	const onClickSelectParent = (type: Exclude<CheckboxTypeEnum, 'Partial'>) => {
		if (type === 'All') {
			setSelected(contributionList.map((item, idx) => item.id));
		} else {
			setSelected([]);
		}
	};

	const onSelect = (idList: string[]) => {
		setSelected(idList);
	};

	const onCloseDialog = () => {
		setShowDialog(false);
	};
	const showDeleteDialog = useCallback((contributionId: string, uId: string) => {
		setActiveCid(contributionId);
		setActiveUid(uId);
		setShowDialog(true);
	}, []);

	const onDelete = async () => {
		try {
			openGlobalLoading();
			if (!activeCid) return false;
			await eas.revokeOffchain(activeUid!);
			await deleteContribution(activeCid, operatorId);
			setShowDialog(false);
			showToast('Revoked', 'success');
			await mutateContributionList();
		} catch (err: any) {
			showToast('Revoke failed', 'error');
			console.error('onDelete error', err);
		} finally {
			closeGlobalLoading();
		}
	};

	const getVoteResult = (uId: string) => {
		const voters: string[] = [];
		const voteValues: number[] = [];
		for (const [signer, value] of Object.entries(easVoteNumberBySigner[uId])) {
			voters.push(signer);
			voteValues.push(value);
		}
		return {
			voters: voters,
			voteValues: voteValues,
		};
	};

	const claimHandler = async () => {
		if (!canClaimedContributionList || canClaimedContributionList.length === 0) {
			return;
		}
		const own = contributorList.find((contributor) => contributor.wallet === myAddress);
		if (!own) {
			showToast(`You can't claim as you're not in the project.`);
			return false;
		}
		try {
			openGlobalLoading();
			const claimSchemaUid = EasSchemaMap.claim;

			const sortCanClaimedContributionList = canClaimedContributionList.sort(
				(c1: any, c2: any) => {
					return c1.id - c2.id;
				},
			);
			const toWallets: string[] = [];
			let contributionIds: string = '';
			for (let i = 0; i < sortCanClaimedContributionList.length; i++) {
				const contribution: IContribution = sortCanClaimedContributionList[i];
				const toUserId = contribution.toIds[0];
				const wallet = contributorList.find((item) => item.id === toUserId)?.wallet;
				wallet && toWallets.push(wallet);
				if (contributionIds.length > 0) {
					contributionIds += `,${contribution.id}`;
				} else {
					contributionIds += `${contribution.id}`;
				}
			}

			const signatures = await prepareClaim({
				wallet: myAddress as string,
				toWallets,
				chainId: chainId as number,
				contributionIds: contributionIds,
			});

			const dataList: any[] = [];
			for (let i = 0; i < sortCanClaimedContributionList.length; i++) {
				const { id, credit, uId } = sortCanClaimedContributionList[i];
				const { voters, voteValues } = getVoteResult(uId!);

				const toWallet = toWallets[i];

				const schemaEncoder = new SchemaEncoder(EasSchemaTemplateMap.claim);
				const data: EasSchemaData<EasSchemaClaimKey>[] = [
					{ name: 'ProjectAddress', value: projectDetail?.id, type: 'address' },
					{
						name: 'ContributionID',
						value: id,
						type: 'bytes32',
					},
					{ name: 'Voters', value: voters, type: 'address[]' },
					{ name: 'VoteChoices', value: voteValues, type: 'uint8[]' },
					{ name: 'Recipient', value: toWallet, type: 'address' },
					{
						name: 'TokenAmount',
						value: ethers.parseUnits(credit.toString()),
						type: 'uint256',
					},
					{ name: 'Signatures', value: signatures[i], type: 'bytes' },
				];
				const encodedData = schemaEncoder.encodeData(data);

				dataList.push({
					recipient: toWallet,
					expirationTime: BigInt(0),
					revocable: false,
					refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
					data: encodedData,
					value: BigInt(0),
				});
			}

			const tx = await eas.multiAttest([{ schema: claimSchemaUid, data: dataList }]);
			// console.log('Make multi attestation on chain:', tx);

			for (let i = 0; i < sortCanClaimedContributionList.length; i++) {
				const { id, uId } = sortCanClaimedContributionList[i];
				await updateContributionStatus(id, {
					type: 'claim',
					uId: uId,
					operatorId: operatorId,
				});
			}

			showToast('Tokens claimed', 'success');
			await mutateContributionList();
		} catch (err: any) {
			console.error('claim all error', err);
			if (err.code && err.code === 'ACTION_REJECTED') {
				showToast('Unsuccessful: Signing request rejected by you', 'error');
				return;
			}
			showToast('Unsuccessful: transaction rejected by you or insufficient gas fee', 'error');
		} finally {
			closeGlobalLoading();
		}
	};

	return (
		<>
			{showHeader ? (
				<StyledFlexBox
					sx={{
						justifyContent: 'space-between',
						marginTop: '16px',
						marginBottom: '16px',
					}}
				>
					<StyledFlexBox>
						<Typography variant={'subtitle1'} sx={{ fontWeight: 500 }}>
							Contributions
						</Typography>
						{isLoading ? (
							<UpdatingBlock>
								<Typography sx={{ color: '#0F172A' }} variant={'body2'}>
									Updating...
								</Typography>
							</UpdatingBlock>
						) : null}
					</StyledFlexBox>

					<StyledFlexBox sx={{ cursor: 'pointer' }}>
						<FilterIcon width={24} height={24} onClick={onClickFilterBtn} />
						<Button
							variant={'outlined'}
							sx={{ marginLeft: '16px' }}
							onClick={claimHandler}
						>
							Claim ({canClaimTotalCredit})
						</Button>
					</StyledFlexBox>
				</StyledFlexBox>
			) : null}
			<StyledFlexBox
				sx={{
					marginTop: '16px',
					justifyContent: 'space-between',
					display: showFilter ? 'flex' : 'none',
				}}
			>
				{renderFilter}
				{/*<TextButton onClick={onClickSelectBtn}>Select</TextButton>*/}
			</StyledFlexBox>

			{showMultiSelect ? (
				<StyledFlexBox
					sx={{
						marginTop: '16px',
						marginBottom: '16px',
						justifyContent: 'space-between',
					}}
				>
					<StyledFlexBox>
						<CustomCheckbox
							total={contributionList.length}
							selected={selected.length}
							onChange={onClickSelectParent}
						/>
						<Typography variant={'body1'}>{selected.length} have selected</Typography>
					</StyledFlexBox>
					<StyledFlexBox>
						<StyledButton
							variant="outlined"
							mainColor="#12C29C80"
							textColor="#12C29C"
							hoverColor="rgba(18, 194, 156, 1)"
							startIcon={<DoneOutlinedIcon />}
						>
							For
						</StyledButton>
						<StyledButton
							variant="outlined"
							mainColor="#D32F2F80"
							textColor="#D32F2F"
							hoverColor="rgba(211, 47, 47, 1)"
							startIcon={<ClearOutlinedIcon />}
						>
							Again
						</StyledButton>
						<StyledButton
							variant="outlined"
							mainColor="#0288D180"
							textColor="#437EF7"
							hoverColor="rgba(2, 136, 209, 1)"
							startIcon={<ArrowForwardOutlinedIcon />}
						>
							Abstain
						</StyledButton>
						<StyledButton
							variant="outlined"
							mainColor="#0F172A29"
							textColor="#0F172A"
							hoverColor="rgba(15, 23, 42, 1)"
							onClick={handleHideSelect}
						>
							Cancel
						</StyledButton>
					</StyledFlexBox>
				</StyledFlexBox>
			) : null}

			{projectDetail && filterContributionList.length > 0 ? (
				filterContributionList
					.filter((item) => item.status !== Status.UNREADY)
					.map((contribution, idx) => (
						<ContributionItem
							key={contribution.id}
							contribution={contribution}
							showSelect={showMultiSelect}
							selected={selected}
							onSelect={onSelect}
							showDeleteDialog={showDeleteDialog}
							projectDetail={projectDetail}
							contributorList={contributorList}
							contributionList={filterContributionList}
							contributionTypeList={contributionTypeList}
							voteData={easVoteNumberBySigner[contribution.uId!] || null}
							setClaimed={setCanClaimedContribution}
						/>
					))
			) : (
				<Stack
					alignItems={'center'}
					sx={{
						marginTop: '190px',
					}}
				>
					<Image
						src={'/images/contribution_empty.png'}
						alt={'empty'}
						width={96}
						height={96}
					/>
					{isInit ? (
						<Typography color={'#0F172A'} variant={'subtitle1'}>
							No contributions found. Refine the contribution end date filter.
						</Typography>
					) : null}
				</Stack>
			)}

			{projectDetail && filterContributionList.length > 0 ? (
				<Stack
					justifyContent={'flex-end'}
					sx={{
						marginTop: '100px',
					}}
				>
					<TablePagination
						component="div"
						count={total}
						page={curPage}
						onPageChange={onPageChange}
						rowsPerPage={pageSize}
						onRowsPerPageChange={handlePageSizeChange}
					/>
				</Stack>
			) : null}

			<Dialog
				open={showDialog}
				onClose={onCloseDialog}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Are you sure to revoke this contribution?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<DialogButton onClick={onCloseDialog} variant={'outlined'}>
						Cancel
					</DialogButton>
					<DialogConfirmButton onClick={onDelete} autoFocus>
						Revoke
					</DialogConfirmButton>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default ContributionList;

export const DialogButton = styled(Button)({
	minWidth: 80,
	width: 80,
	height: 34,
	borderRadius: 4,
	padding: 0,
});

export const DialogConfirmButton = styled(DialogButton)({
	backgroundColor: '#0F172A',
	color: '#fff',
	'&:hover': {
		background: 'rgba(15, 23, 42, .8)',
	},
});

const UpdatingBlock = styled('div')({
	border: '0.5px solid #BDBDBD',
	height: '24px',
	borderRadius: '4px',
	padding: '3px 8px',
	marginLeft: '8px',
});

const TextButton = styled('span')({
	cursor: 'pointer',
	fontWeight: '500',
	'&:hover': {
		opacity: '0.5',
	},
});

const StyledButton = styled(Button)<{ mainColor: string; textColor: string; hoverColor: string }>(
	({ mainColor, textColor, hoverColor }) => ({
		minWidth: '112px',
		width: '112px',
		height: '40px',
		marginLeft: '12px',
		borderColor: mainColor,
		color: textColor,
		'&:hover': {
			borderColor: hoverColor,
		},
	}),
);
