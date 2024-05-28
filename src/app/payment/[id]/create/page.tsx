'use client';
// https://github.com/safe-global/safe-apps-sdk/blob/main/guides/drain-safe-app/01-bootstrap-the-app.md
// https://github.com/safe-global/safe-apps-sdk/blob/main/guides/drain-safe-app/02-display-safe-assets.md
// https://github.com/safe-global/safe-apps-sdk/blob/main/guides/drain-safe-app/03-transfer-assets.md

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

import { useRouter } from 'next/navigation';

import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';

import { TokenType } from '@safe-global/safe-gateway-typescript-sdk';

import { encodeFunctionData } from 'viem';

import FormControl from '@mui/material/FormControl';

import { StyledFlexBox } from '@/components/styledComponents';
import { BackIcon } from '@/icons';

import { useSafeBalances } from '@/hooks/useSafeBalances';

import Allocation, { IMintRecordCopy } from '@/components/payment/allocation';
import { IMintRecord } from '@/services';

import { ERC_20_ABI } from '@/abis/erc20';

export enum IAllocatorTypeEnum {
	ProportionBased = 'ProportionBased',
	Manual = 'Manual',
}

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
	const [allocatorType, setAllocatorType] = useState<IAllocatorTypeEnum>(
		IAllocatorTypeEnum.ProportionBased,
	);

	const [allocationInfo, setAllocationInfo] = useState<{
		list: IMintRecord[];
		claimedAmount: number;
	}>({
		list: [],
		claimedAmount: 0,
	});

	const [manualAllocationList, setManualAllocationList] = useState<IMintRecordCopy[]>([]);

	const [allocationDetails, setAllocationDetails] = useState<Record<string, number>>({});

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
		setAllocatorType(event.target.value as IAllocatorTypeEnum);
	};

	const handleAllocate = () => {
		setTotalAmount(Number(amount));
	};

	const onAllocationChange = useCallback((list: IMintRecord[], claimedAmount: number) => {
		setAllocationInfo({ list, claimedAmount });
	}, []);

	const handleCreatePayment = async () => {
		if (!currentBalance) return;
		try {
			const { list, claimedAmount } = allocationInfo;
			console.log('currentBalance, list', currentBalance, list);
			const decimals = currentBalance.tokenInfo.decimals;
			const calcPow = decimals > 6 ? 6 : decimals;
			const isManual = allocatorType === IAllocatorTypeEnum.Manual;
			const finalList = isManual
				? manualAllocationList.map((item) => {
						const intValue = Math.round(
							Number(item.allocateValue) * Math.pow(10, calcPow),
						);
						const bigIntValue =
							BigInt(intValue) * BigInt(Math.pow(10, decimals - calcPow));
						return {
							recipient: item.contributor.wallet,
							bigIntValue: bigIntValue,
						};
				  })
				: list.map((item) => {
						const curCredit = allocationDetails[item.contributor.id];
						const value = ((totalAmount * curCredit) / claimedAmount).toFixed(calcPow);
						const intValue = Math.round(Number(value) * Math.pow(10, calcPow));
						const bigIntValue =
							BigInt(intValue) * BigInt(Math.pow(10, decimals - calcPow));
						return {
							recipient: item.contributor.wallet,
							bigIntValue: bigIntValue,
						};
				  });
			// https://github.com/safe-global/safe-apps-sdk/blob/main/guides/drain-safe-app/03-transfer-assets.md
			const txs = finalList.map((item) => {
				const { recipient, bigIntValue } = item;
				// Send ETH directly to the recipient address
				if (currentBalance.tokenInfo.type === TokenType.NATIVE_TOKEN) {
					return {
						to: recipient,
						value: bigIntValue.toString(),
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
							args: [recipient, bigIntValue.toString()],
						}),
					};
				}
			});
			console.log('tsx', txs);
			const { safeTxHash } = await sdk.txs.send({ txs });
			console.log({ safeTxHash });
			const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash);
			console.log({ safeTx });
		} catch (err: any) {
			console.error('handleCreatePayment error', err);
		}
	};

	const onChangeAllocationDetails = (detail: Record<string, number>) => {
		setAllocationDetails(detail);
	};
	const onChangeManualInfo = (list: IMintRecordCopy[]) => {
		console.log('onChangeManualInfo', list);
		setManualAllocationList(list);
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
					<FormControl sx={{ marginRight: '16px', width: '160px' }}>
						<InputLabel id="wallet-type-select-label">Wallet Type*</InputLabel>
						<Select
							id="wallet-type-select"
							labelId="wallet-type-select-label"
							label={'Wallet Type*'}
							value={walletType}
							onChange={handleWalletTypeChange}
							sx={{ minWidth: '' }}
						>
							<MenuItem value={'Multi'}>Multi-sig</MenuItem>
							<MenuItem value={'Eoa'}>EOA</MenuItem>
						</Select>
					</FormControl>
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
					<FormControl sx={{ marginRight: '16px', width: '200px' }}>
						<InputLabel id="currency-select-label" sx={{ backgroundColor: '#fff' }}>
							currency*
						</InputLabel>
						<Select
							id="currency-select"
							labelId="currency-select-label"
							value={currency}
							onChange={handleCurrencyChange}
							sx={{ minWidth: '' }}
						>
							{currencyOptions.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl sx={{ marginRight: '16px', width: '200px' }}>
						<InputLabel id="network-select-label" sx={{ backgroundColor: '#fff' }}>
							Network*
						</InputLabel>
						<Select
							id="network-select"
							labelId="network-select-label"
							value={network}
							onChange={handleNetworkChange}
							sx={{ minWidth: '' }}
							disabled={true}
						>
							{networkOptions.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl sx={{ marginRight: '16px', width: '200px' }}>
						<InputLabel id="allocator-select-label" sx={{ backgroundColor: '#fff' }}>
							Allocator by*
						</InputLabel>
						<Select
							id="allocator-select"
							labelId="allocator-select-label"
							value={allocatorType}
							onChange={handleAllocatorChange}
							sx={{ minWidth: '' }}
						>
							<MenuItem value={IAllocatorTypeEnum.ProportionBased}>
								Proportion-based
							</MenuItem>
							<MenuItem value={IAllocatorTypeEnum.Manual}>Manual</MenuItem>
						</Select>
					</FormControl>
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
					allocatorType={allocatorType}
					onChange={onAllocationChange}
					onChangeAllocationDetails={onChangeAllocationDetails}
					onChangeManualInfo={onChangeManualInfo}
					isETH={currentBalance?.tokenInfo.type === TokenType.NATIVE_TOKEN}
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
