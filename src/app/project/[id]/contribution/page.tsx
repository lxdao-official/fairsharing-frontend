'use client';

import { Button, styled, TextField, Typography } from '@mui/material';
import { StyledFlexBox } from '@/components/styledComponents';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import {
	AttestationShareablePackageObject,
	EAS,
	SchemaEncoder,
} from '@ethereum-attestation-service/eas-sdk';
import { useEthersProvider, useEthersSigner } from '@/common/ether';
import axios from 'axios';
import { useAccount, useNetwork } from 'wagmi';
import { ethers } from 'ethers';

import { TransactionResponse } from '@ethersproject/abstract-provider';

// @ts-ignore
import eas_abi = require('../../../../../abi/eas_abi.json');

type EASChainConfig = {
	chainId: number;
	chainName: string;
	version: string;
	contractAddress: string;
	schemaRegistryAddress: string;
	etherscanURL: string;
	/** Must contain a trailing dot (unless mainnet). */
	subdomain: string;
	rpcProvider: string;
};

const EAS_CHAIN_CONFIGS: EASChainConfig[] = [
	{
		chainId: 11155111,
		chainName: 'sepolia',
		subdomain: 'sepolia.',
		version: '0.26',
		contractAddress: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
		schemaRegistryAddress: '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0',
		etherscanURL: 'https://sepolia.etherscan.io',
		rpcProvider: `https://sepolia.infura.io/v3/`,
	},
	{
		chainId: 1,
		chainName: 'mainnet',
		subdomain: '',
		version: '0.26',
		contractAddress: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
		schemaRegistryAddress: '0xA7b39296258348C78294F95B872b282326A97BDF',
		etherscanURL: 'https://etherscan.io',
		rpcProvider: `https://mainnet.infura.io/v3/`,
	},
	{
		chainId: 420,
		chainName: 'goerli-optimism',
		subdomain: 'optimism-goerli-bedrock.',
		version: '1.0.1',
		contractAddress: '0x4200000000000000000000000000000000000021',
		schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
		etherscanURL: 'https://optimism-goerli-bedrock.easscan.org',
		rpcProvider: `https://mainnet.infura.io/v3/`,
	},
];

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
BigInt.prototype.toJSON = function () {
	return this.toString();
};

export default function Page({ params }: { params: { id: string } }) {
	const [detail, setDetail] = useState('');

	const EASContractAddress = '0x4200000000000000000000000000000000000021';

	const signer = useEthersSigner();
	const provider = useEthersProvider();
	const network = useNetwork();
	const { address: myAddress } = useAccount();

	const eas = new EAS(EASContractAddress);

	let contributionUID: string;

	useEffect(() => {
		console.log('signer:', signer);
		if (signer) {
			eas.connect(signer);
		}
	}, [signer]);

	const handleDetailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDetail(event.target.value);
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
		const offchain = await eas.getOffchain();

		const contributionSchemaUid =
			'0x446a57b67cc7459c9aa55a372b1395251db4f4732fff04f76c134f57a0409fe4';

		// Initialize SchemaEncoder with the schema string
		const schemaEncoder = new SchemaEncoder(
			'uint256 pid, uint64 cid, string title, string detail, string poc, uint64 token',
		);
		const encodedData = schemaEncoder.encodeData([
			{ name: 'pid', value: 8, type: 'uint256' },
			{ name: 'cid', value: 1, type: 'uint64' },
			{ name: 'title', value: 'first contribution title', type: 'string' },
			{ name: 'detail', value: 'first contribution detail', type: 'string' },
			{ name: 'poc', value: 'the poc', type: 'string' },
			{ name: 'token', value: 2000, type: 'uint64' },
		]);

		{
			// test onchain
			const attestation = await eas.attest({
				schema: contributionSchemaUid,
				data: {
					recipient: '0x0000000000000000000000000000000000000000',
					expirationTime: 0,
					revocable: true,
					refUID: '',
					data: encodedData,
					value: 0,
				},
			});
			console.log('onchainAttestation:', attestation);
		}

		// const block = await provider.getBlock('latest');
		// const offchainAttestation = await offchain.signOffchainAttestation(
		// 	{
		// 		recipient: '0x0000000000000000000000000000000000000000',
		// 		expirationTime: 0,
		// 		time: BigInt(block.timestamp),
		// 		revocable: true,
		// 		version: 1,
		// 		nonce: 0,
		// 		schema: contributionSchemaUid,
		// 		refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
		// 		data: encodedData,
		// 	},
		// 	signer,
		// );
		//
		// contributionUID = offchainAttestation.uid;
		//
		// const res = await submitSignedAttestation({
		// 	signer: myAddress,
		// 	sig: offchainAttestation,
		// });
		// if (!res.data.error) {
		// 	try {
		// 		const baseURL = getBASEURL();
		// 		// Update ENS names
		// 		await axios.get(`${baseURL}/api/getENS/${myAddress}`);
		// 	} catch (e) {
		// 		console.error('ens error:', e);
		// 	}
		// }
	};

	const handleVote = async (value) => {
		const offchain = await eas.getOffchain();

		const voteSchemaUid = '0x82280290eeca50f5d7bf7b75bdf1241c8dbd8ae41dda1dde5d32159c00003c12';

		// Initialize SchemaEncoder with the schema string
		const schemaEncoder = new SchemaEncoder(
			'uint256 pid, uint64 cid, uint8 value, string reason',
		);
		const encodedData = schemaEncoder.encodeData([
			{ name: 'pid', value: 1, type: 'uint256' },
			{ name: 'cid', value: 1, type: 'uint64' },
			{ name: 'value', value: value, type: 'uint8' },
			{ name: 'reason', value: 'good contribution', type: 'string' },
		]);

		const block = await provider.getBlock('latest');

		const offchainAttestation = await offchain.signOffchainAttestation(
			{
				recipient: '0x0000000000000000000000000000000000000000',
				expirationTime: 0,
				time: BigInt(block.timestamp),
				revocable: true,
				version: 1,
				nonce: 0,
				schema: voteSchemaUid,
				refUID: contributionUID,
				data: encodedData,
			},
			signer,
		);

		const res = await submitSignedAttestation({
			signer: myAddress,
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

	const handleSignMsg = async () => {
		console.log(ethers);
		const salt = ethers.randomBytes(16).toString();

		console.log(ethers.AbiCoder.defaultAbiCoder);

		const hash = ethers.keccak256(
			ethers.AbiCoder.defaultAbiCoder().encode(
				['string', 'uint256', 'uint64', 'address[]', 'uint8[]', 'uint64'],
				[
					salt,
					1,
					1,
					[
						'0x9324AD72F155974dfB412aB6078e1801C79A8b78',
						'0x314eFc96F7c6eCfF50D7A75aB2cde9531D81cbe4',
					],
					[1, 1],
					2000,
				],
			),
		);

		console.log('hash', hash);

		const signature = await signer?.signMessage(ethers.toBeArray(hash));

		// 0xda4f6497b7f4c8bb2cca0920bbed77e93e83a7c12cfc3406e76ade19065704961cb1f6711f6d979efac695e211070764d4a84c5ec98ea96d051c00f23a1c2d6b1b
		console.log('signature', signature);
	};

	const handleClaim = async () => {
		const att = await eas.getAttestation(
			'0x96ff08919e3a38f2a37d642c8074daedca4ac2c279564930d9dbea710e0aa5e2',
		);
		console.log('attestation', att);

		const claimSchemaUid = '0x0f11736c835bc2050b478961f250410274d2d6c1f821154e8fd66ef7eb61d986';

		const signature = ethers.hexlify(
			ethers.toUtf8Bytes(
				'0xda4f6497b7f4c8bb2cca0920bbed77e93e83a7c12cfc3406e76ade19065704961cb1f6711f6d979efac695e211070764d4a84c5ec98ea96d051c00f23a1c2d6b1b',
			),
		);

		// Initialize SchemaEncoder with the schema string
		const schemaEncoder = new SchemaEncoder(
			'uint256 pid, uint64 cid, address[] voters, uint8[] values, uint64 token, bytes signature',
		);

		const pid = 1;
		const cid = 1;
		const voteValue1 = 1;
		const voteValue2 = 1;
		const token = 2000;
		const encodedData = schemaEncoder.encodeData([
			{ name: 'pid', value: pid, type: 'uint256' },
			{ name: 'cid', value: cid, type: 'uint64' },
			{
				name: 'voters',
				value: [
					'0x9324AD72F155974dfB412aB6078e1801C79A8b78',
					'0x314eFc96F7c6eCfF50D7A75aB2cde9531D81cbe4',
				],
				type: 'address[]',
			},
			{ name: 'values', value: [voteValue1, voteValue2], type: 'uint8[]' },
			{ name: 'token', value: token, type: 'uint64' },
			{ name: 'signature', value: signature, type: 'bytes' },
		]);

		// const contract = new ethers.Contract(
		// 	'0x4200000000000000000000000000000000000021',
		// 	eas_abi,
		// 	signer,
		// );
		//
		// console.log('contract', contract);
		//
		// const tx: TransactionResponse = await contract.attest(claimSchemaUid, {
		// 	recipient: myAddress,
		// 	expirationTime: 0,
		// 	revocable: false,
		// 	refUID: '',
		// 	data: encodedData,
		// });
		// console.log('tx:', tx);
		// const response = await tx.wait(1);
		// console.log('response:', response);

		// const attestation = await eas.attest({
		// 	schema: claimSchemaUid,
		// 	data: {
		// 		recipient: myAddress,
		// 		expirationTime: 0,
		// 		revocable: false,
		// 		refUID: '',
		// 		data: encodedData,
		// 	},
		// });
		// console.log('onchainAttestation:', attestation);

		const attestation = await eas.attest({
			schema: claimSchemaUid,
			data: {
				recipient: myAddress,
				expirationTime: 0,
				revocable: false,
				refUID: '',
				data: encodedData,
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
						value={detail}
						size={'small'}
						onChange={handleDetailInputChange}
						placeholder={'https: //notion.so/1234'}
					/>
				</StyledFlexBox>

				<StyledFlexBox sx={{ marginTop: '8px' }}>
					<TagLabel>#to</TagLabel>
					<StyledInput
						variant={'standard'}
						InputProps={{ disableUnderline: true }}
						required
						value={detail}
						size={'small'}
						onChange={handleDetailInputChange}
						placeholder={'Type @ to select contributor'}
					/>
				</StyledFlexBox>

				<PostButton>
					<Button variant={'contained'}>Post</Button>
				</PostButton>
			</PostContainer>

			<Typography typography={'h3'} sx={{ marginTop: '16px' }}>
				contributions: {params.id}
			</Typography>

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
						await handleVote(1);
					}}
				>
					Test Vote 1
				</Button>

				<Button
					variant={'contained'}
					onClick={async () => {
						await handleVote(2);
					}}
				>
					Test Vote 2
				</Button>
			</StyledFlexBox>

			<StyledFlexBox sx={{ marginTop: '8px' }}>
				<Button
					variant={'contained'}
					onClick={async () => {
						await handleSignMsg();
					}}
				>
					Test sign msg
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
