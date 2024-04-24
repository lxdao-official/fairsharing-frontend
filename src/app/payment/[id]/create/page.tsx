'use client';
// https://github.com/safe-global/safe-apps-sdk/blob/main/guides/drain-safe-app/01-bootstrap-the-app.md
// https://github.com/safe-global/safe-apps-sdk/blob/main/guides/drain-safe-app/02-display-safe-assets.md
// https://github.com/safe-global/safe-apps-sdk/blob/main/guides/drain-safe-app/03-transfer-assets.md

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Button,
	MenuItem,
	Select,
	SelectChangeEvent,
	styled,
	TextField,
	Typography,
} from '@mui/material';

import { useRouter } from 'next/navigation';

import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';

import { TokenType } from '@safe-global/safe-gateway-typescript-sdk';

import { encodeFunctionData } from 'viem';

import { StyledFlexBox } from '@/components/styledComponents';
import { BackIcon } from '@/icons';

import { useSafeBalances } from '@/hooks/useSafeBalances';

import Allocation from '@/components/payment/allocation';
import { IMintRecord } from '@/services';

import { ERC_20_ABI } from '@/abis/erc20';

export default function PaymentPage({ params }: { params: { id: string } }) {
	const router = useRouter();
	const [address, setAddress] = useState('');
	const [category, setCategory] = useState('');
	const [purpose, setPurpose] = useState('');
	const [amount, setAmount] = useState('');
	const [totalAmount, setTotalAmount] = useState(0);
	const [walletType, setWalletType] = useState('Multi');
	const [currency, setCurrency] = useState<string>('');
	const [network, setNetwork] = useState<string>('');
	const [allocatorType, setAllocatorType] = useState('ProportionBased');

	const [allocationInfo, setAllocationInfo] = useState<{
		list: IMintRecord[];
		claimedAmount: number;
	}>({
		list: [],
		claimedAmount: 0,
	});

	const { sdk, safe } = useSafeAppsSDK();
	const [balances] = useSafeBalances(sdk);

	const currencyOptions = useMemo(() => {
		if (!balances || !balances.length) return [];
		return balances.map((balance) => {
			const { tokenInfo } = balance;
			return {
				value: tokenInfo.symbol,
				label: tokenInfo.name,
			};
		});
	}, [balances]);

	const currencyName = useMemo(() => {
		if (!currencyOptions || !currencyOptions.length) return '';
		return currencyOptions.find((item) => item.value === currency)?.label || '';
	}, [currency, currencyOptions]);

	const networkOptions = useMemo(() => {
		if (!safe) return [];
		return [
			{
				value: safe.chainId,
				// @ts-ignore
				label: safe?.network as string,
			},
		];
	}, [safe]);

	useEffect(() => {
		console.log('balances', { balances });
		if (balances && balances.length) {
			setCurrency(balances[0].tokenInfo.symbol);
		}
	}, [balances]);

	const currentBalance = useMemo(() => {
		return balances.find((balance) => balance.tokenInfo.symbol === currency);
	}, [balances, currency]);

	useEffect(() => {
		console.log('safe', safe);
		if (safe && safe.safeAddress) {
			setAddress(safe.safeAddress);
			setNetwork(String(safe.chainId));
		}
	}, [safe]);

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
		setAllocatorType(event.target.value);
	};

	const handleAllocate = () => {
		setTotalAmount(Number(amount));
	};

	const onAllocationChange = useCallback((list: IMintRecord[], claimedAmount: number) => {
		console.log('onAllocationChange', { list, claimedAmount });
		setAllocationInfo({ list, claimedAmount });
	}, []);

	const handleCreatePayment = async () => {
		if (!currentBalance) return;
		try {
			const { list, claimedAmount } = allocationInfo;
			const decimals = currentBalance.tokenInfo.decimals;
			const pow = Math.pow(10, decimals);
			// https://github.com/safe-global/safe-apps-sdk/blob/main/guides/drain-safe-app/03-transfer-assets.md
			const txs = list.map((item) => {
				const percent = item.credit / claimedAmount;
				const value = String(totalAmount * pow * percent);
				const recipient = item.contributor.wallet;
				// Send ETH directly to the recipient address
				if (currentBalance.tokenInfo.type === TokenType.NATIVE_TOKEN) {
					return {
						to: recipient,
						value: value,
						data: '0x',
					};
				} else {
					// For other token types, generate a contract tx
					return {
						to: currentBalance.tokenInfo.address,
						value: '0',
						data: encodeFunctionData({
							abi: ERC_20_ABI,
							functionName: 'transfer',
							args: [recipient, value],
						}),
					};
				}
			});
			const { safeTxHash } = await sdk.txs.send({ txs });
			console.log({ safeTxHash });
			const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash);
			console.log({ safeTx });
		} catch (err: any) {
			console.error('handleCreatePayment error', err);
		}
	};

	return (
		<PageContainer>
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
						disabled={true}
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
						sx={{ width: '180px', marginRight: '16px' }}
					/>
					<Select
						id="currency-select"
						labelId="currency-select-label"
						label={'currency*'}
						value={currency}
						onChange={handleCurrencyChange}
						sx={{ minWidth: '', width: '200px', marginRight: '16px' }}
					>
						{currencyOptions.map((item) => (
							<MenuItem key={item.value} value={item.value}>
								{item.label}
							</MenuItem>
						))}
					</Select>
					<Select
						id="network-select"
						labelId="network-select-label"
						label={'Network*'}
						value={network}
						onChange={handleNetworkChange}
						sx={{ minWidth: '', width: '200px', marginRight: '16px' }}
						disabled={true}
					>
						{networkOptions.map((item) => (
							<MenuItem key={item.value} value={item.value}>
								{item.label}
							</MenuItem>
						))}
					</Select>
					<Select
						id="allocator-select"
						labelId="allocator-select-label"
						label={'Allocator by*'}
						value={allocatorType}
						onChange={handleAllocatorChange}
						sx={{ minWidth: '', width: '200px', marginRight: '16px' }}
					>
						<MenuItem value={'ProportionBased'}>Proportion-based</MenuItem>
						<MenuItem value={'manual'}>Manual</MenuItem>
					</Select>
				</StyledFlexBox>
			</FormWrapper>

			<Button
				variant={'contained'}
				sx={{ marginTop: '40px' }}
				onClick={handleAllocate}
				disabled={!(Number(amount) > 0)}
			>
				Allocate
			</Button>
			<Typography variant={'body2'} sx={{ marginTop: '8px', color: '#64748B' }}>
				The results will be displayed below.
			</Typography>

			{totalAmount > 0 ? (
				<Allocation
					id={params.id}
					totalAmount={totalAmount}
					currencyName={currencyName}
					onChange={onAllocationChange}
				/>
			) : null}

			{allocationInfo.list.length > 0 ? (
				<BottomLine>
					<ContentWrapper>
						<Button variant={'contained'} onClick={handleCreatePayment}>
							Create Payment
						</Button>
						<Button variant={'outlined'} sx={{ marginLeft: '16px' }}>
							Cancel
						</Button>
						<Typography
							variant={'body2'}
							sx={{
								marginLeft: '16px',
								color: '#64748B',
							}}
						>
							Allocation details have been auto-saved as a draft.
						</Typography>
					</ContentWrapper>
				</BottomLine>
			) : null}
		</PageContainer>
	);
}

const PageContainer = styled('div')({
	width: '1264px',
	minWidth: '1264px',
	margin: '0 auto',
	padding: '0 32px 32px',
	height: 'calc(100vh - 64px - 80px)',
	overflowY: 'scroll',
});

const FormWrapper = styled('div')({
	// width: '1195px',
});

const TitleLine = styled('div')({
	display: 'flex',
	justifyContent: 'flex-start',
	alignItems: 'center',
	height: '44px',
});

const BottomLine = styled('div')({
	position: 'fixed',
	bottom: '0',
	left: '80px',
	right: '0',
	height: '80px',
	borderTop: '0.5px solid rgba(15, 23, 42, 0.16)',
	backgroundColor: '#fff',
});

const ContentWrapper = styled('div')({
	height: '100%',
	margin: '0 auto',
	width: '1264px',
	padding: '0 32px',
	display: 'flex',
	alignItems: 'center',
});
