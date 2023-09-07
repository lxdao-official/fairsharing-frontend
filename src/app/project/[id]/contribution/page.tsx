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
import { EasContribution, getEASContributionList, getEasSignature } from '@/services/eas';

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
	const [easContributionList, setEasContributionList] = useState<EasContribution[]>([]);

	useEffect(() => {
		setCurrentProjectId(queryParams.id as string);
		fetchProjectDetail();
		fetchContributorList();
		fetchContributionList();
	}, []);

	useEffect(() => {
		if (contributionList.length > 0) {
			const cids = contributionList
				.filter((contribution) => !!contribution.uId)
				.map((item) => item.uId);
			fetchContributionListFromEAS(cids as string[]);
		}
	}, [contributionList]);

	const fetchContributionListFromEAS = async (cids: string[]) => {
		const ids =
			cids.length > 0
				? cids
				: [
						'0x0004221eb330629fc5c3a57125b19ef7f4d17c79b9ecedff28f95de887a6271f',
						'0x000455010280438c14c6f53d8f562abdded6791880e4015bbc4e933dfb482622',
				  ];
		console.log(cids.length > 0 ? `真实cids` : '假cids', ids);
		const res = await getEASContributionList(ids, network.chain?.id);
		setEasContributionList(res.attestations);
		console.log('graphql -> EASContributionList: ', res.attestations);
	};
	const fetchProjectDetail = async () => {
		const res = await getProjectDetail(params.id);
		console.log('fetchProjectDetail', res);
		setProjectDetail(res);
	};
	const fetchContributorList = async () => {
		const list = await getContributorList(params.id);
		console.log('fetchContributorList list', list);
		setContributorList(list);
	};
	const fetchContributionList = async () => {
		const { list } = await getContributionList({
			pageSize: 50,
			currentPage: 1,
			projectId: params.id,
		});
		console.log('fetchContributionList list', list);
		setContributionList(list);
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
			EAS_CHAIN_CONFIGS[3];
		const EASContractAddress = activeChainConfig.contractAddress;
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
			openGlobalLoading();
			const offchain = await eas.getOffchain();
			const voteSchemaUid = EasSchemaUidMap.vote;

			const schemaEncoder = new SchemaEncoder(
				'uint256 pid, uint64 cid, uint8 value, string reason',
			);
			const encodedData = schemaEncoder.encodeData([
				{ name: 'pid', value: pid, type: 'uint256' },
				{ name: 'cid', value: contributionId, type: 'uint64' },
				{ name: 'value', value: value, type: 'uint8' },
				{ name: 'reason', value: 'good contribution', type: 'string' },
			]);
			const block = await provider.getBlock('latest');
			if (!signer) {
				return;
			}
			try {
				const offchainAttestation = await offchain.signOffchainAttestation(
					{
						recipient: '0x0000000000000000000000000000000000000000',
						expirationTime: BigInt(0),
						time: BigInt(block ? block.timestamp : 0),
						revocable: true,
						version: 1,
						nonce: BigInt(0),
						schema: voteSchemaUid,
						refUID: uId,
						data: encodedData,
					},
					signer,
				);

				const res = await submitSignedAttestation({
					signer: myAddress as string,
					sig: offchainAttestation,
				});
				if (!res.data.error) {
					try {
						const baseURL = getBASEURL();
						// Update ENS names
						await axios.get(`${baseURL}/api/getENS/${myAddress}`);
						// TODO graphql获取投票数据
					} catch (e) {
						console.error('ens error:', e);
					} finally {
						closeGlobalLoading();
					}
				}
			} catch (e) {
				console.error('onVote error', e);
				closeGlobalLoading();
			}
		},
		[pid, signer, myAddress, eas],
	);

	const onClaim = useCallback(
		async (params: IClaimParams) => {
			const { contributionId, uId, token } = params;
			console.log('onClaim params', params);
			openGlobalLoading();
			try {
				const claimSchemaUid = EasSchemaUidMap.claim;
				const signature = await getEasSignature({
					wallet: myAddress as string,
					cId: contributionId,
					chainId: network.chain?.id as number,
				});

				const schemaEncoder = new SchemaEncoder(
					'uint256 pid, uint64 cid, address[] voters, uint8[] values, uint64 token, bytes signature',
				);
				const encodedData = schemaEncoder.encodeData([
					{ name: 'pid', value: pid, type: 'uint256' },
					{ name: 'cid', value: contributionId, type: 'uint64' },
					{
						name: 'voters',
						value: [
							'0x9324AD72F155974dfB412aB6078e1801C79A8b78',
							'0x314eFc96F7c6eCfF50D7A75aB2cde9531D81cbe4',
							'0x6Aa6dC80405d10b0e1386EB34D1A68cB2934c5f3',
							'0x3E6Ee4C5846978de53d25375c94A5c5574222Bb8',
						],
						type: 'address[]',
					},
					{ name: 'values', value: [1, 1, 1, 2], type: 'uint8[]' },
					{ name: 'token', value: token, type: 'uint64' },
					{ name: 'signature', value: signature, type: 'bytes' },
				]);

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
				console.log('claim updateStatus', updateStatus);
				fetchContributionList();
				// 	TODO 修改DB状态
			} catch (e) {
				console.log('onClaim error', e);
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
				/>
			) : null}
		</div>
	);
}
