'use client';

import { Button, styled, TextField, Typography } from '@mui/material';
import { StyledFlexBox } from '@/components/styledComponents';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { AccountCircle } from '@mui/icons-material';
import { EAS, Offchain, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { useEthersProvider, useEthersSigner } from '@/common/ether';
import { OFFCHAIN_ATTESTATION_VERSION } from '@ethereum-attestation-service/eas-sdk/src/offchain';

export default function Page({ params }: { params: { id: string } }) {
	const [detail, setDetail] = useState('');

	const EASContractAddress = '0x4200000000000000000000000000000000000021';

	const signer = useEthersSigner();

	const eas = new EAS(EASContractAddress, { signerOrProvider: signer });

	let contributionUID: string;

	const handleDetailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDetail(event.target.value);
	};

	// useEffect(() => {
	// 	// if (!signer) {
	// 	// 	return;
	// 	// }
	// 	// @ts-ignore
	// 	// eas.connect(provider);
	// }, [eas, signer]);

	const handlePrepareContribution = async () => {
		const offchain = await eas.getOffchain();

		const contributionSchemaUid =
			'0x446a57b67cc7459c9aa55a372b1395251db4f4732fff04f76c134f57a0409fe4';

		// Initialize SchemaEncoder with the schema string
		const schemaEncoder = new SchemaEncoder(
			'uint256 pid, uint64 cid, string title, string detail, string poc, uint64 token',
		);
		const encodedData = schemaEncoder.encodeData([
			{ name: 'pid', value: 1, type: 'uint256' },
			{ name: 'cid', value: 1, type: 'uint64' },
			{ name: 'title', value: 'first contribution title', type: 'string' },
			{ name: 'detail', value: 'first contribution detail', type: 'string' },
			{ name: 'poc', value: 'the poc', type: 'string' },
			{ name: 'token', value: 2000, type: 'uint64' },
		]);

		const now = new Date();

		const offchainAttestation = await offchain.signOffchainAttestation(
			{
				recipient: '0x9324AD72F155974dfB412aB6078e1801C79A8b78',
				expirationTime: 0,
				time: now.getTime(),
				revocable: true,
				version: 1,
				nonce: 0,
				schema: contributionSchemaUid,
				refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
				data: encodedData,
			},
			signer,
		);
		contributionUID = offchainAttestation.uid;
		console.log('offchainAttestation:', offchainAttestation);
	};

	const handleVote = async (index) => {
		const values = [1, 2];

		const offchain = await eas.getOffchain();

		const voteSchemaUid = '0x82280290eeca50f5d7bf7b75bdf1241c8dbd8ae41dda1dde5d32159c00003c12';

		// Initialize SchemaEncoder with the schema string
		const schemaEncoder = new SchemaEncoder(
			'uint256 pid, uint64 cid , uint8 value, string reason',
		);
		const encodedData = schemaEncoder.encodeData([
			{ name: 'pid', value: 1, type: 'uint256' },
			{ name: 'cid', value: 1, type: 'uint64' },
			{ name: 'uint8', value: values[index], type: 'uint8' },
			{ name: 'reason', value: 'good contribution', type: 'string' },
		]);

		const now = new Date();

		const offchainAttestation = await offchain.signOffchainAttestation(
			{
				recipient: '0x0',
				expirationTime: 0,
				time: now.getTime(),
				revocable: true,
				version: 1,
				nonce: 0,
				schema: voteSchemaUid,
				refUID: contributionUID,
				data: encodedData,
			},
			signer,
		);
		console.log('offchainAttestation:', offchainAttestation);
	};

	const handleClaim = async () => {
		const claimSchemaUid = '0x0f11736c835bc2050b478961f250410274d2d6c1f821154e8fd66ef7eb61d986';

		// todo
		const signature = '';

		// Initialize SchemaEncoder with the schema string
		const schemaEncoder = new SchemaEncoder(
			'uint256 pid, uint64 cid, address[] voters, uint8[] values, uint64 token, bytes signature',
		);
		const encodedData = schemaEncoder.encodeData([
			{ name: 'pid', value: 1, type: 'uint256' },
			{ name: 'cid', value: 1, type: 'uint64' },
			{
				name: 'voters',
				value: [
					'0x9324AD72F155974dfB412aB6078e1801C79A8b78',
					'0x314eFc96F7c6eCfF50D7A75aB2cde9531D81cbe4',
				],
				type: 'address[]',
			},
			{ name: 'values', value: [1, 2], type: 'uint8[]' },
			{ name: 'token', value: 2000, type: 'uint64' },
			{ name: 'signature', value: signature, type: 'bytes' },
		]);

		const now = new Date();

		const attestation = await eas.attest({
			schema: claimSchemaUid,
			data: { recipient: '0x0', expirationTime: 0, revocable: false, data: encodedData },
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
						await handleVote(0);
					}}
				>
					Test Vote 1
				</Button>

				<Button
					variant={'contained'}
					onClick={async () => {
						await handleVote(1);
					}}
				>
					Test Vote 2
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
