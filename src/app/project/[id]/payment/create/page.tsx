'use client';

import React, { useEffect, useState } from 'react';
import {
	Button,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	styled,
	TextField,
	Typography,
} from '@mui/material';
import { StyledFlexBox } from '@/components/styledComponents';
import { BackIcon } from '@/icons';
import { useRouter } from 'next/navigation';
import { isProd } from '@/constant/env';
import FormControl from '@mui/material/FormControl';

export default function page({ params }: { params: { id: string } }) {
	const router = useRouter();
	const [address, setAddress] = useState('');
	const [category, setCategory] = useState('');
	const [purpose, setPurpose] = useState('');
	const [amount, setAmount] = useState('');
	const [walletType, setWalletType] = useState('Multi');
	const [currency, setCurrency] = useState('USDT');
	const [network, setNetwork] = useState('ERC20');
	const [allocator, setAllocator] = useState('ProportionBased');

	const handleBack = () => {
		router.back();
	};
	const handleAddressInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setAddress(event.target.value);
	};
	const handleCategoryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCategory(event.target.value);
	};
	const handlePurposeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPurpose(event.target.value);
	};
	const handleAmountInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setAmount(event.target.value);
	};

	const handleWalletTypeChange = (event: SelectChangeEvent) => {
		setWalletType(event.target.value);
	};
	const handleCurrencyChange = (event: SelectChangeEvent) => {
		setCurrency(event.target.value);
	};
	const handleNetworkChange = (event: SelectChangeEvent) => {
		setNetwork(event.target.value);
	};
	const handleAllocatorChange = (event: SelectChangeEvent) => {
		setAllocator(event.target.value);
	};

	return (
		<>
			<StyledFlexBox
				sx={{ padding: '8px 4px', cursor: 'pointer', marginBottom: '16px' }}
				onClick={handleBack}
			>
				<BackIcon width={18} height={22} />
				<Typography variant={'body1'} sx={{ marginLeft: '8px', fontWeight: '500' }}>
					Back
				</Typography>
			</StyledFlexBox>
			<Typography variant="h3">Create Payment</Typography>

			<FormWrapper sx={{ marginTop: '16px' }}>
				<TitleLine>
					<Typography variant={'body1'} sx={{ fontWeight: '500' }}>
						Treasury for payment*
					</Typography>
				</TitleLine>

				<StyledFlexBox>
					<TextField
						label={'Address*'}
						value={address}
						onChange={handleAddressInputChange}
						sx={{ width: '440px', marginRight: '16px' }}
					/>
					<Select
						id="wallet-type-select"
						labelId="wallet-type-select-label"
						label={'Wallet Type*'}
						value={walletType}
						onChange={handleWalletTypeChange}
						sx={{ minWidth: '', width: '160px', marginRight: '16px' }}
					>
						<MenuItem value={'Multi'}>Multi-sig</MenuItem>
						<MenuItem value={'Eoa'}>EOA</MenuItem>
					</Select>
					<TextField
						value={category}
						onChange={handleCategoryInputChange}
						label={'Category*'}
						sx={{ width: '286px', marginRight: '16px' }}
					/>
					<TextField
						value={purpose}
						onChange={handlePurposeInputChange}
						label={'Purpose*'}
						sx={{ width: '286px' }}
					/>
				</StyledFlexBox>
			</FormWrapper>

			<FormWrapper sx={{ marginTop: '12px' }}>
				<TitleLine>
					<Typography variant={'body1'} sx={{ fontWeight: '500' }}>
						Total amount*
					</Typography>
				</TitleLine>
				<StyledFlexBox>
					<TextField
						value={amount}
						onChange={handleAmountInputChange}
						label={'Amount*'}
						sx={{ width: '135px', marginRight: '16px' }}
					/>
					<Select
						id="currency-select"
						labelId="currency-select-label"
						label={'currency*'}
						value={currency}
						onChange={handleCurrencyChange}
						sx={{ minWidth: '', width: '160px', marginRight: '16px' }}
					>
						<MenuItem value={'USDT'}>USDT</MenuItem>
						<MenuItem value={'USDC'}>USDC</MenuItem>
						<MenuItem value={'ETH'}>ETH</MenuItem>
					</Select>
					<Select
						id="network-select"
						labelId="network-select-label"
						label={'Network*'}
						value={network}
						onChange={handleNetworkChange}
						sx={{ minWidth: '', width: '160px', marginRight: '16px' }}
					>
						<MenuItem value={'ERC20'}>Ethereum(ERC-20)</MenuItem>
						<MenuItem value={'Optimism'}>Optimism</MenuItem>
					</Select>
					<Select
						id="allocator-select"
						labelId="allocator-select-label"
						label={'Allocator by*'}
						value={allocator}
						onChange={handleAllocatorChange}
						sx={{ minWidth: '', width: '160px', marginRight: '16px' }}
					>
						<MenuItem value={'ProportionBased'}>Proportion-based</MenuItem>
						<MenuItem value={'manual'}>Manual</MenuItem>
					</Select>
				</StyledFlexBox>
			</FormWrapper>

			<Button variant={'contained'} sx={{ marginTop: '40px' }}>
				Allocate
			</Button>
			<Typography variant={'body2'} sx={{ marginTop: '8px', color: '#64748B' }}>
				The results will be displayed below.
			</Typography>
		</>
	);
}

const FormWrapper = styled('div')({
	// width: '1195px',
});

const TitleLine = styled('div')({
	display: 'flex',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '44px',
});
