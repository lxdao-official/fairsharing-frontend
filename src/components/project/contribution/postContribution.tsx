import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import { Button, styled, TextField, Typography } from '@mui/material';

import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

import { ethers } from 'ethers';

import axios from 'axios';

import { useAccount, useNetwork } from 'wagmi';

import { useConnectModal } from '@rainbow-me/rainbowkit';

import useSWR from 'swr';

import { StyledFlexBox } from '@/components/styledComponents';
import { IContribution, IContributor } from '@/services/types';
import MultipleContributorSelector from '@/components/project/contribution/contributorSelector';
import { closeGlobalLoading, openGlobalLoading, showToast } from '@/store/utils';
import { createContribution, getContributorList, updateContributionStatus } from '@/services';
import {
	EasSchemaContributionKey,
	EasSchemaData,
	EasSchemaMap,
	EasSchemaTemplateMap,
} from '@/constant/eas';

import { useEthersProvider, useEthersSigner } from '@/common/ether';

import { useUserStore } from '@/store/user';
import useEas from '@/hooks/useEas';

export interface IPostContributionProps {
	projectId: string;
	contribution?: IContribution;
	onCancel?: () => void;
	confirmText?: string;
	onUpdate?: (type: 'create' | 'edit') => void;
	refresh?: number;
}

export interface PostData {
	detail: string;
	proof: string;
	contributors: string[];
	credit: string;
}

const PostContribution = ({
	projectId,
	contribution,
	onUpdate,
	onCancel,
	confirmText,
}: IPostContributionProps) => {
	const [detail, setDetail] = useState(contribution?.detail || '');
	const [proof, setProof] = useState(contribution?.proof || '');
	const [contributors, setContributors] = useState<string[]>([]);
	const [credit, setCredit] = useState(String(contribution?.credit || ''));

	const { myInfo } = useUserStore();
	const signer = useEthersSigner();
	const provider = useEthersProvider();
	const { address: myAddress } = useAccount();
	const { openConnectModal } = useConnectModal();

	const { eas, getEasScanURL, submitSignedAttestation } = useEas();

	const { data: contributorList, mutate: mutateContributorList } = useSWR(
		['contributor/list', projectId],
		() => getContributorList(projectId),
		{
			fallbackData: [],
			onSuccess: (data) => console.log('getContributorList', data),
		},
	);

	useEffect(() => {
		mutateContributorList();
	}, [projectId]);

	const operatorId = useMemo(() => {
		if (contributorList.length === 0 || !myInfo) {
			return '';
		}
		return contributorList.filter((contributor) => contributor.userId === myInfo?.id)[0]?.id;
	}, [contributorList, myInfo]);

	const onClear = () => {
		setDetail('');
		setProof('');
		setContributors([]);
		setCredit('');
	};

	const handleDetailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDetail(event.target.value);
	};

	const handleProofInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setProof(event.target.value);
	};
	const handleCreditInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCredit(event.target.value);
	};

	const handleContributorChange = (values: string[]) => {
		setContributors(values);
	};

	const onSubmit = () => {
		if (!detail) {
			showToast('Contribution detail is required', 'error');
			return;
		}
		if (!proof) {
			showToast('Contribution proof is required', 'error');
			return;
		}
		if (contributors.length === 0) {
			showToast('Contributor is required', 'error');
			return;
		}
		if (!credit || Number(credit) <= 0) {
			showToast('Contribution credit should be a positive integer', 'error');
			return;
		}
		const params: PostData = { detail, proof, contributors, credit };
		if (contribution) {
			onEditContribution(params);
		} else {
			onPostContribution(params);
		}
	};

	const onPostContribution = async (postData: PostData) => {
		if (!myAddress) {
			openConnectModal?.();
			return false;
		}
		if (!operatorId) {
			console.error('operatorId not exist');
			return false;
		}
		try {
			openGlobalLoading();
			const contribution = await createContribution({
				projectId: projectId,
				operatorId: operatorId as string,
				...postData,
				credit: Number(postData.credit),
				toIds: postData.contributors,
			});
			// UNREADY 状态
			console.log('createContribution res', contribution);

			// TODO 如果用户 reject metamask 签名，DB有记录，但EAS上无数据，是否重新唤起小狐狸
			const offchain = await eas.getOffchain();
			const contributionSchemaUid = EasSchemaMap.contribution;
			const schemaEncoder = new SchemaEncoder(EasSchemaTemplateMap.contribution);
			const data: EasSchemaData<EasSchemaContributionKey>[] = [
				{ name: 'ProjectAddress', value: projectId, type: 'address' },
				{ name: 'ContributionID', value: contribution.id, type: 'uint64' },
				{ name: 'Detail', value: postData.detail, type: 'string' },
				{ name: 'Type', value: 'default contribution type', type: 'string' },
				{ name: 'Proof', value: postData.proof, type: 'string' },
				{
					name: 'Token',
					value: ethers.parseUnits(postData.credit.toString()),
					type: 'uint256',
				},
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
			const baseURL = getEasScanURL();
			// Update ENS names
			const getENSRes = await axios.get(`${baseURL}/api/getENS/${myAddress}`);
			console.log('getENSRes', getENSRes);
			// 传eas返回的uid, 更新status为ready
			const updateStatus = await updateContributionStatus(contribution.id, {
				type: 'ready',
				uId: res.data.offchainAttestationId as string,
				operatorId: operatorId,
			});
			showToast('Create contribution success', 'success');
			onClear();
			onUpdate?.('create');
		} catch (err: any) {
			console.error(err);
			if (err.message) {
				showToast(err.message, 'error');
			}
		} finally {
			closeGlobalLoading();
		}
	};

	const onEditContribution = async (postData: PostData) => {};

	return (
		<PostContainer>
			<StyledFlexBox>
				<TagLabel>#detail</TagLabel>
				<StyledInput
					variant={'standard'}
					InputProps={{ disableUnderline: true }}
					required
					value={detail}
					size={'small'}
					onChange={handleDetailInputChange}
					placeholder={'I developed sign in with [wallet] feature'}
				/>
			</StyledFlexBox>

			<StyledFlexBox sx={{ marginTop: '8px' }}>
				<TagLabel>#proof</TagLabel>
				<StyledInput
					variant={'standard'}
					InputProps={{ disableUnderline: true }}
					required
					value={proof}
					size={'small'}
					onChange={handleProofInputChange}
					placeholder={'https: //notion.so/1234'}
				/>
			</StyledFlexBox>

			<StyledFlexBox sx={{ marginTop: '8px' }}>
				<TagLabel>#to</TagLabel>
				<MultipleContributorSelector
					contributors={contributors}
					contributorList={contributorList}
					onChange={handleContributorChange}
				/>
			</StyledFlexBox>

			<CreditContainer>
				<Image src={'/images/pizza2.png'} width={24} height={24} alt={'pizza'} />
				<StyledInput
					sx={{ marginLeft: '4px', marginTop: '4px' }}
					variant={'standard'}
					InputProps={{ disableUnderline: true }}
					required
					value={credit}
					size={'small'}
					onChange={handleCreditInputChange}
					placeholder={'Pizza slices, e.g. 120'}
				/>
			</CreditContainer>

			<PostButton>
				{onCancel ? (
					<Button
						variant={'contained'}
						color={'info'}
						sx={{ marginRight: '24px' }}
						onClick={onCancel}
					>
						Cancel
					</Button>
				) : null}

				<Button variant={'contained'} onClick={onSubmit}>
					{confirmText || 'Re-Post'}
				</Button>
			</PostButton>
		</PostContainer>
	);
};

export default PostContribution;

const PostContainer = styled('div')({
	minHeight: '90px',
	backgroundColor: 'white',
	marginTop: '16px',
	padding: '12px 16px',
	borderRadius: '4px',
	position: 'relative',
	border: '1px solid rgba(18, 194, 156, 1)',
	boxShadow: '0px 4px 18px 3px #0F172A0A',
});
const PostButton = styled(StyledFlexBox)({
	position: 'absolute',
	right: '16px',
	bottom: '12px',
});
const TagLabel = styled(Typography)({
	color: '#437EF7',
	width: '60px',
});

const StyledInput = styled(TextField)({
	flex: '1',
	border: 'none',
});

const CreditContainer = styled(StyledFlexBox)({
	justifyContent: 'center',
	marginTop: '8px',
	width: '200px',
	height: '30px',
	border: '1px solid rgba(15, 23, 42, 0.16)',
	borderRadius: '5px',
	padding: '3px 8px',
});
