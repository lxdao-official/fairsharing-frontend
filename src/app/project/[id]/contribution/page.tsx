'use client';

import { Typography } from '@mui/material';
import { useAccount, useNetwork } from 'wagmi';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Image from 'next/image';

import axios from 'axios';

import {
	AttestationShareablePackageObject,
	EAS,
	SchemaEncoder,
} from '@ethereum-attestation-service/eas-sdk';

import { useParams } from 'next/navigation';

import { StyledFlexBox } from '@/components/styledComponents';

import { useEthersProvider, useEthersSigner } from '@/common/ether';

import ContributionList, {
	IClaimParams,
	IVoteParams,
} from '@/components/project/contribution/contributionList';
import { EAS_CHAIN_CONFIGS, EasSchemaUidMap } from '@/constant/eas';
import { IContribution, IContributor, IProject } from '@/services/types';
import { getProjectDetail } from '@/services/project';
import { setCurrentProjectId } from '@/store/project';
import PostContribution, { PostData } from '@/components/project/contribution/postContribution';
import {
	createContribution,
	getContributionList,
	ICreateContributionParams,
	updateContributionStatus,
} from '@/services/contribution';
import { useUserStore } from '@/store/user';
import { getContributorList } from '@/services/contributor';
import { closeGlobalLoading, openGlobalLoading } from '@/store/utils';
import {
	EasAttestation,
	EasAttestationData,
	EasAttestationDecodedData,
	getEASContributionList,
	getEasSignature,
	getEASVoteRecord,
} from '@/services/eas';

type StoreAttestationRequest = { filename: string; textJson: string };

type StoreIPFSActionReturn = {
	error: null | string;
	ipfsHash: string | null;
	offchainAttestationId: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
interface BigInt {
	/** Convert to BigInt to string form in JSON.stringify */
	toJSON: () => string;
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

export default function Page({ params }: { params: { id: string } }) {
	const { myInfo } = useUserStore();

	const signer = useEthersSigner();
	const provider = useEthersProvider();
	const network = useNetwork();
	const { address: myAddress } = useAccount();
	const queryParams = useParams();

	const pid = useMemo(() => {
		return params.id;
	}, [params]);

	const [projectDetail, setProjectDetail] = useState<IProject>();
	const [contributorList, setContributorList] = useState<IContributor[]>([]);
	const [contributionList, setContributionList] = useState<IContribution[]>([]);
	const [easContributionList, setEasContributionList] = useState<EasAttestation[]>([]);
	const [easVoteList, setEasVoteList] = useState<EasAttestation[]>([]);

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
			{} as Record<string, EasAttestation[]>,
		);
		easVoteList.forEach((item) => {
			map[item.refUID].push(item);
		});
		console.log('easVoteMap', map);
		return map;
	}, [easVoteList, contributionUIds]);

	useEffect(() => {
		setCurrentProjectId(queryParams.id as string);
		fetchProjectDetail();
		fetchContributorList();
		fetchContributionList();
	}, []);

	useEffect(() => {
		if (contributionUIds.length > 0) {
			fetchEasContributionList(contributionUIds);
			fetchEasVoteList(contributionUIds);
		}
	}, [contributionUIds]);

	const fetchEasContributionList = async (uIds: string[]) => {
		const { attestations } = await getEASContributionList(uIds, network.chain?.id);
		const easList = attestations.map((item) => ({
			...item,
			decodedDataJson: JSON.parse(
				item.decodedDataJson as string,
			) as EasAttestationDecodedData[],
			data: JSON.parse(item.data as string) as EasAttestationData,
		}));
		setEasContributionList(easList);
		console.log('graphql -> EASContributionList: ', easList);
	};
	const fetchEasVoteList = async (uIds: string[]) => {
		getEASVoteRecord(uIds as string[], network.chain?.id)
			.then(({ attestations }) => {
				const easVoteList = attestations.map((item) => ({
					...item,
					decodedDataJson: JSON.parse(
						item.decodedDataJson as string,
					) as EasAttestationDecodedData[],
					data: JSON.parse(item.data as string) as EasAttestationData,
				}));
				console.log('easVoteList', easVoteList);
				setEasVoteList(easVoteList);
			})
			.catch((e) => console.error('getEASVoteRecord error', e));
	};

	const fetchProjectDetail = async () => {
		const res = await getProjectDetail(params.id);
		console.log('fetchProjectDetail', res);
		setProjectDetail(res);
		return res;
	};
	const fetchContributorList = async () => {
		const list = await getContributorList(params.id);
		console.log('fetchContributorList list', list);
		setContributorList(list);
		return list;
	};
	const fetchContributionList = async () => {
		const { list } = await getContributionList({
			pageSize: 50,
			currentPage: 1,
			projectId: params.id,
		});
		console.log('fetchContributionList list', list);
		setContributionList(list);
		return list;
	};

	const operatorId = useMemo(() => {
		if (contributorList.length === 0 || !myInfo) {
			return '';
		}
		return contributorList.filter((contributor) => contributor.userId === myInfo?.id)[0]?.id;
	}, [contributorList, myInfo]);

	const eas = useMemo(() => {
		const activeChainConfig =
			EAS_CHAIN_CONFIGS.find((config) => config.chainId === network.chain?.id) ||
			EAS_CHAIN_CONFIGS[2];
		const EASContractAddress = activeChainConfig?.contractAddress;
		if (!signer) {
			// TODO deal with eas.connect(signer);
			return new EAS(EASContractAddress);
		}
		return new EAS(EASContractAddress, { signerOrProvider: signer });
	}, [network, signer]);

	const getBASEURL = () => {
		const activeChainConfig = EAS_CHAIN_CONFIGS.find(
			(config) => config.chainId === network.chain?.id,
		);

		return `https://${activeChainConfig!.subdomain}easscan.org`;
	};

	const submitSignedAttestation = async (pkg: AttestationShareablePackageObject) => {
		const baseURL = getBASEURL();

		console.log('baseURL:', baseURL);

		const data: StoreAttestationRequest = {
			filename: `${new Date().getTime()}_eas.txt`,
			textJson: JSON.stringify(pkg),
		};

		return await axios.post<StoreIPFSActionReturn>(`${baseURL}/offchain/store`, data);
	};

	const onPostContribution = useCallback(
		async (postData: PostData) => {
			if (!myInfo) {
				console.error('connect wallet and login');
				return false;
			}
			if (!operatorId) {
				console.error('operatorId not exist');
				return false;
			}
			try {
				openGlobalLoading();
				const contribution = await createContribution({
					projectId: pid,
					operatorId: operatorId as string,
					...postData,
					credit: Number(postData.credit),
					toIds: postData.contributors,
				});
				console.log('createContribution res', contribution);

				const offchain = await eas.getOffchain();
				const contributionSchemaUid = EasSchemaUidMap.contribution;
				// Initialize SchemaEncoder with the schema string
				const schemaEncoder = new SchemaEncoder(
					'address projectAddress, uint64 cid, string title, string detail, string poc, uint64 token',
				);
				const encodedData = schemaEncoder.encodeData([
					{ name: 'projectAddress', value: pid, type: 'address' },
					{ name: 'cid', value: contribution.id, type: 'uint64' },
					{ name: 'title', value: 'first contribution title', type: 'string' },
					{ name: 'detail', value: postData.detail, type: 'string' },
					{ name: 'poc', value: postData.proof, type: 'string' },
					{ name: 'token', value: Number(postData.credit), type: 'uint64' },
				]);

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
						schema: contributionSchemaUid,
						refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
						data: encodedData,
					},
					signer,
				);

				const res = await submitSignedAttestation({
					signer: myAddress as string,
					sig: offchainAttestation,
				});
				console.log('submitSignedAttestation res', res);
				if (res.data.error) {
					console.error('submitSignedAttestation fail', res.data);
					throw new Error(res.data.error);
				}
				const baseURL = getBASEURL();
				// Update ENS names
				const getENSRes = await axios.get(`${baseURL}/api/getENS/${myAddress}`);
				console.log('getENSRes', getENSRes);
				// 传eas返回的uid, 更新status为claim
				const updateStatus = await updateContributionStatus(contribution.id, {
					type: 'ready',
					uId: res.data.offchainAttestationId as string,
				});
				console.log('updateStatus', updateStatus);
				fetchContributionList();
			} catch (err) {
				console.error(err);
			} finally {
				closeGlobalLoading();
			}
		},
		[myInfo, pid, operatorId, signer, provider, eas],
	);

	const onVote = useCallback(
		async ({ contributionId, value, uId }: IVoteParams) => {
			console.log('vote params', contributionId, value, uId);
			if (!uId) {
				console.error('uId not exist');
				return;
			}
			try {
				openGlobalLoading();
				const offchain = await eas.getOffchain();
				const voteSchemaUid = EasSchemaUidMap.vote;

				const schemaEncoder = new SchemaEncoder(
					'address projectAddress, uint64 cid, uint8 value, string reason',
				);
				const encodedData = schemaEncoder.encodeData([
					{ name: 'projectAddress', value: pid, type: 'address' },
					{ name: 'cid', value: contributionId, type: 'uint64' },
					{ name: 'value', value: value, type: 'uint8' },
					{ name: 'reason', value: 'good contribution', type: 'string' },
				]);
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
				const baseURL = getBASEURL();
				// Update ENS names
				await axios.get(`${baseURL}/api/getENS/${myAddress}`);
				const list = await fetchContributionList();
				const cids = list
					.filter((contribution) => !!contribution.uId)
					.map((item) => item.uId);
				fetchEasContributionList(cids as string[]);
			} catch (e) {
				console.error('onVote error', e);
			} finally {
				closeGlobalLoading();
			}
		},
		[pid, signer, myAddress, eas],
	);

	const onClaim = useCallback(
		async (params: IClaimParams) => {
			const { contributionId, uId, token, voters, voteValues } = params;
			console.log('onClaim params', params);
			try {
				openGlobalLoading();
				const claimSchemaUid = EasSchemaUidMap.claim;
				const signature = await getEasSignature({
					wallet: myAddress as string,
					cId: contributionId,
					chainId: network.chain?.id as number,
				});

				const schemaEncoder = new SchemaEncoder(
					'address projectAddress, uint64 cid, address[] voters, uint8[] values, uint64 token, bytes signature',
				);
				console.log('schemaEncoder', schemaEncoder);
				const encodedData = schemaEncoder.encodeData([
					{ name: 'projectAddress', value: pid, type: 'address' },
					{ name: 'cid', value: contributionId, type: 'uint64' },
					{
						name: 'voters',
						value: voters,
						type: 'address[]',
					},
					{ name: 'values', value: voteValues, type: 'uint8[]' },
					{ name: 'token', value: token, type: 'uint64' },
					{ name: 'signature', value: signature, type: 'bytes' },
				]);

				console.log('encodedData', encodedData);

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
				});
				console.log('claim updateStatus success', updateStatus);
				fetchContributionList();
			} catch (err) {
				console.error('onClaim error', err);
			} finally {
				closeGlobalLoading();
			}
		},
		[myAddress, pid, eas, network],
	);

	return (
		<div style={{ flex: '1' }}>
			<StyledFlexBox>
				<Typography typography={'h3'}>Post your contribution</Typography>
				<Image
					src={'/images/book.png'}
					width={24}
					height={24}
					alt={'contribution'}
					style={{ marginLeft: '10px' }}
				/>
			</StyledFlexBox>

			<PostContribution onPost={onPostContribution} confirmText={'Post'} />

			{projectDetail && contributionList.length > 0 ? (
				<ContributionList
					projectId={params.id}
					contributionList={contributionList || []}
					projectDetail={projectDetail}
					onVote={onVote}
					onClaim={onClaim}
					easVoteMap={easVoteMap}
				/>
			) : null}
		</div>
	);
}
