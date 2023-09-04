'use client';

import process from 'process';

import { Button, styled, TextField, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useAccount, useNetwork } from 'wagmi';

import React, { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';

import axios from 'axios';

import {
	AttestationShareablePackageObject,
	EAS,
	SchemaEncoder,
} from '@ethereum-attestation-service/eas-sdk';

import { StyledFlexBox } from '@/components/styledComponents';

import { useEthersProvider, useEthersSigner } from '@/common/ether';

import ContributionList from '@/components/project/contribution/contributionList';
import { EAS_CHAIN_CONFIGS, EasSchemaUidMap } from '@/constant/eas';
import { IProject } from '@/services/types';
import { getProjectDetail } from '@/services/project';

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
	const [detail, setDetail] = useState('');
	const [proof, setProof] = useState('');
	const [contributors, setContributors] = useState([]);
	const [credit, setCredit] = useState('');

	const signer = useEthersSigner();
	const provider = useEthersProvider();
	const network = useNetwork();
	const { address: myAddress } = useAccount();

	const pid = useMemo(() => {
		return params.id;
	}, [params]);

	const [cid, setCid] = useState(1);

	const [projectDetail, setProjectDetail] = useState<IProject>();

	useEffect(() => {
		const fetchProjectDetail = async () => {
			const res = await getProjectDetail(params.id);
			console.log('fetchProjectDetail', res);
			setProjectDetail(res);
		};
		fetchProjectDetail();
	}, []);

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

	let contributionUID: string =
		'0x0000000000000000000000000000000000000000000000000000000000000000';

	const handleDetailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDetail(event.target.value);
	};

	const handleProofInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setProof(event.target.value);
	};
	const handleCreditInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCredit(event.target.value);
	};

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

	const handlePrepareContribution = async () => {
		// TODO 调用后端创建接口，获取cid
		const offchain = await eas.getOffchain();

		const contributionSchemaUid = EasSchemaUidMap.contribution;
		// Initialize SchemaEncoder with the schema string
		const schemaEncoder = new SchemaEncoder(
			'uint256 pid, uint64 cid, string title, string detail, string poc, uint64 token',
		);
		// TODO pid：从params获取
		// TODO cid: 从后端创建后获取
		const encodedData = schemaEncoder.encodeData([
			{ name: 'pid', value: pid, type: 'uint256' },
			{ name: 'cid', value: cid, type: 'uint64' },
			{ name: 'title', value: 'first contribution title', type: 'string' },
			{ name: 'detail', value: 'first contribution detail', type: 'string' },
			{ name: 'poc', value: 'the poc', type: 'string' },
			{ name: 'token', value: 2000, type: 'uint64' },
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

		contributionUID = offchainAttestation.uid;

		const res = await submitSignedAttestation({
			signer: myAddress as string,
			sig: offchainAttestation,
		});
		console.log('submitSignedAttestation res', res);
		if (!res.data.error) {
			try {
				const baseURL = getBASEURL();
				// Update ENS names
				const getENSRes = await axios.get(`${baseURL}/api/getENS/${myAddress}`);
				console.log('getENSRes', getENSRes);
			} catch (e) {
				console.error('ens error:', e);
			}
		}
	};

	const handleRevokeContribution = async () => {
		const uid = '0x720eea3a0fb22ca36637e8faa2b66c649cf734402902cb587d9f9f5bc405e4cf';
		await eas.revokeOffchain(uid);
	};

	const handleVote = async (value: any) => {
		const offchain = await eas.getOffchain();

		const voteSchemaUid = EasSchemaUidMap.vote;

		// Initialize SchemaEncoder with the schema string
		const schemaEncoder = new SchemaEncoder(
			'uint256 pid, uint64 cid, uint8 value, string reason',
		);
		const encodedData = schemaEncoder.encodeData([
			{ name: 'pid', value: pid, type: 'uint256' },
			{ name: 'cid', value: cid, type: 'uint64' },
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
				refUID: contributionUID,
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
			} catch (e) {
				console.error('ens error:', e);
			}
		}
	};

	const handleRevokeVote = async () => {
		const uid = '0x6b26a1c579ebbe33a3e4c46756b6fee48855f11513b384c973e8c3fdbf313d6d';
		await eas.revokeOffchain(uid);
	};

	const getSignMsg = async (_attester: string, _pid: any, _cid: any) => {
		console.log(ethers);
		const salt = ethers.hexlify(ethers.randomBytes(32));

		console.log(ethers.AbiCoder.defaultAbiCoder);

		const hash = ethers.keccak256(
			ethers.AbiCoder.defaultAbiCoder().encode(
				['address', 'uint256', 'uint64'],
				[_attester, _pid, _cid],
			),
		);

		console.log('hash', hash);

		const signerWallet = new ethers.Wallet(`${process.env.NEXT_PUBLIC__KEY}`);
		const signature = await signerWallet.signMessage(ethers.getBytes(hash));

		console.log('signature', signature);

		return { signature };
	};

	const handleClaim = async () => {
		const claimSchemaUid = EasSchemaUidMap.claim;

		const { signature } = await getSignMsg(myAddress as string, pid, cid);

		// Initialize SchemaEncoder with the schema string
		const schemaEncoder = new SchemaEncoder(
			'uint256 pid, uint64 cid, address[] voters, uint8[] values, uint64 token, bytes signature',
		);

		const encodedData = schemaEncoder.encodeData([
			{ name: 'pid', value: pid, type: 'uint256' },
			{ name: 'cid', value: cid, type: 'uint64' },
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
			{ name: 'token', value: 2000, type: 'uint64' },
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
	};

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
						placeholder={'I developed sign in with wallet feature'}
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
					<StyledInput
						variant={'standard'}
						InputProps={{ disableUnderline: true }}
						required
						value={contributors}
						size={'small'}
						onChange={handleDetailInputChange}
						placeholder={'Type @ to select contributor'}
					/>
				</StyledFlexBox>

				<CreditContainer>
					<Image src={'/images/pizza2.png'} width={24} height={24} alt={'pizza'} />
					<StyledInput
						sx={{ marginLeft: '4px' }}
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
					<Button variant={'contained'}>Post</Button>
				</PostButton>
			</PostContainer>

			<StyledFlexBox sx={{ marginTop: '8px' }}>
				<Button
					variant={'contained'}
					onClick={async () => {
						await handlePrepareContribution();
					}}
				>
					Test Prepare contribution
				</Button>
			</StyledFlexBox>

			<StyledFlexBox sx={{ marginTop: '8px' }}>
				<Button
					variant={'contained'}
					onClick={async () => {
						await handleRevokeContribution();
					}}
				>
					Test Revoke contribution
				</Button>
			</StyledFlexBox>

			<StyledFlexBox sx={{ marginTop: '8px' }}>
				<Button
					variant={'contained'}
					onClick={async () => {
						await handleVote(1);
					}}
				>
					Test Vote
				</Button>
			</StyledFlexBox>

			<StyledFlexBox sx={{ marginTop: '8px' }}>
				<Button
					variant={'contained'}
					onClick={async () => {
						await handleRevokeVote();
					}}
				>
					Test Revoke Vote
				</Button>
			</StyledFlexBox>

			<StyledFlexBox sx={{ marginTop: '8px' }}>
				<Button
					variant={'contained'}
					onClick={async () => {
						await handleClaim();
					}}
				>
					Test claim
				</Button>
			</StyledFlexBox>

			<ContributionList projectId={params.id} />
		</div>
	);
}

const PostContainer = styled('div')({
	minHeight: '90px',
	backgroundColor: 'white',
	marginTop: '16px',
	padding: '12px 16px',
	border: '0.5px solid rgba(15, 23, 42, 0.16)',
	borderRadius: '4px',
	position: 'relative',
});
const PostButton = styled('div')({
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
	marginTop: '8px',
	width: '200px',
	height: '30px',
	border: '1px solid rgba(15, 23, 42, 0.16)',
	borderRadius: '5px',
	padding: '3px 8px',
});
