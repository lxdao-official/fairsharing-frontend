'use client';

import {
	Typography,
	styled,
	TextField,
	Box,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	OutlinedInput,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import useSWR from 'swr';
import React, { use, useCallback, useEffect, useMemo, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import { SelectChangeEvent } from '@mui/material/Select';

import Link from 'next/link';
import Image from 'next/image';
import { ethers } from 'ethers';

import { Img3, Img3Provider } from '@lxdao/img3';

import { useRouter } from 'next/navigation';

import { useAccount } from 'wagmi';

import { useConnectModal } from '@rainbow-me/rainbowkit';

import { isProd } from '@/constant/env';
import { defaultGateways, LogoImage } from '@/constant/img3';
import { walletCell } from '@/components/table/cell';

import { getContributorList, createPool, getUserInfo } from '@/services';

import { useEthersSigner } from '@/common/ether';

import { closeGlobalLoading, openGlobalLoading, showToast } from '@/store/utils';
import { StyledFlexBox } from '@/components/styledComponents';

const getParams = () => {
	const url = window.location.href;
	const arr1 = url.split('?');
	const arr2 = arr1[1].split('&');
	const obj: any = {};
	arr2.forEach((item) => {
		const arr3 = item.split('=');
		obj[arr3[0]] = arr3[1];
	});
	return obj;
};

const abi = [
	{
		inputs: [{ internalType: 'address', name: '_allocationTemplate', type: 'address' }],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
			{ indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
		],
		name: 'OwnershipTransferred',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'projectAddress', type: 'address' },
			{ indexed: true, internalType: 'address', name: 'implementation', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'salt', type: 'uint256' },
			{ indexed: true, internalType: 'address', name: 'creator', type: 'address' },
		],
		name: 'PoolCreated',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'operator', type: 'address' },
			{ indexed: true, internalType: 'address', name: 'from', type: 'address' },
			{ indexed: true, internalType: 'address', name: 'to', type: 'address' },
		],
		name: 'PoolTemplateChanged',
		type: 'event',
	},
	{
		inputs: [],
		name: 'allocationPoolTemplate',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				components: [
					{ internalType: 'address', name: 'token', type: 'address' },
					{ internalType: 'uint256', name: 'unClaimedAmount', type: 'uint256' },
					{ internalType: 'address[]', name: 'addresses', type: 'address[]' },
					{ internalType: 'uint256[]', name: 'tokenAmounts', type: 'uint256[]' },
					{ internalType: 'uint32[]', name: 'ratios', type: 'uint32[]' },
				],
				internalType: 'struct Allocation[]',
				name: 'allocations',
				type: 'tuple[]',
			},
			{
				components: [
					{ internalType: 'address', name: 'projectAddress', type: 'address' },
					{ internalType: 'address', name: 'depositor', type: 'address' },
					{ internalType: 'uint256', name: 'timeToClaim', type: 'uint256' },
					{ internalType: 'uint256', name: 'salt', type: 'uint256' },
				],
				internalType: 'struct ExtraParams',
				name: 'params',
				type: 'tuple',
			},
		],
		name: 'create',
		outputs: [{ internalType: 'address', name: 'poolAddress', type: 'address' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'creator', type: 'address' },
			{ internalType: 'uint256', name: 'salt', type: 'uint256' },
		],
		name: 'predictPoolAddress',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'renounceOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
		name: 'transferOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: '_allocationPoolTemplate', type: 'address' }],
		name: 'updateTemplate',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
];

export default function Page({ params }: { params: { id: string } }) {
	console.log('params', params);
	const [sendData, setSendData] = useState<any>({});
	const [allocationId, setAllocationId] = useState('');
	const [operatorId, setOperatorId] = useState('');
	const [ratio, setRatio] = useState<any>([]);
	const [displayList, setDisplayList] = useState<any>([]);
	const [amount, setAmount] = useState<any>(null);
	const [isRequesting, setIsRequesting] = useState(false);
	const [paramesError, setParamesError] = useState<any>({});
	const { address } = useAccount();
	const signer = useEthersSigner();
	const router = useRouter();
	const { openConnectModal } = useConnectModal();

	const { data: userInfoData } = useSWR(address ? ['getUserInfo', address] : null, () =>
		getUserInfo(address!),
	);

	const { isLoading, data: contributorList } = useSWR(
		['contributor/list', params.id],
		() => getContributorList(params.id),
		{
			fallbackData: [],
		},
	);

	useEffect(() => {
		let local: any = localStorage.getItem('allocationDetail') || '';
		if (local) {
			local = JSON.parse(local);
			console.log('local', local, local.ratios);
			if (local.allocationId == allocationId) {
				setRatio(local.ratios);
			}
		}
	}, [allocationId]);

	useEffect(() => {
		const list = [];
		console.log('contributorList', contributorList, ratio);
		if (contributorList.length && ratio.length) {
			for (let i = 0; i < contributorList.length; i++) {
				for (let j = 0; j < ratio.length; j++) {
					if (contributorList[i].id == ratio[j].id) {
						const item = { ...contributorList[i], percentage: ratio[j].ratio };
						list.push(item);
					}
				}
			}
			setDisplayList(list);
		}
	}, [contributorList, ratio]);

	useEffect(() => {
		console.log('userInfoData', userInfoData);
		if (userInfoData && contributorList.length) {
			contributorList.forEach((contributor: any) => {
				if (contributor.userId == userInfoData.id) {
					setOperatorId(contributor.id);
				}
			});
		}
	}, [userInfoData, contributorList]);

	useEffect(() => {
		const query = getParams();
		if (query.allocationId) {
			setAllocationId(query.allocationId);
		}
	}, []);

	const allocate = async () => {
		if (!address) {
			openConnectModal?.();
			return;
		}
		if (!sendData.address) {
			setParamesError({ ...paramesError, address: true });
			return;
		} else if (!sendData.walletType) {
			setParamesError({ ...paramesError, walletType: true });
			return;
		} else if (!amount) {
			setParamesError({ ...paramesError, amount: true });
			return;
		} else if (!sendData.token) {
			setParamesError({ ...paramesError, token: true });
			return;
		} else if (!sendData.network) {
			setParamesError({ ...paramesError, network: true });
			return;
		} else if (!sendData.allocate) {
			setParamesError({ ...paramesError, allocate: true });
			return;
		} else if (!sendData.locked) {
			setParamesError({ ...paramesError, locked: true });
			return;
		}
		setIsRequesting(true);
		openGlobalLoading();
		try {
			const contractAddress = isProd
				? '0xAD1B017Aa86BE3378d28b4b4445293068E3A7aCf'
				: '0xc732cd05648b246ddae63453577c35d2f3d8210a';
			const contract = new ethers.Contract(contractAddress, abi, signer);
			const allocation = {
				token: sendData.token,
				unClaimedAmount: ethers.parseUnits(amount.toString(), 6).toString(),
				addresses: displayList.map((item: any) => item.wallet),
				tokenAmounts: displayList.map((item: any) =>
					ethers.parseUnits(((amount * item.percentage) / 100).toFixed(6), 6).toString(),
				),
				ratios: displayList.map((item: any) =>
					parseInt((item.percentage * 10 ** 6).toString()),
				),
			};
			console.log('contract', contract);
			const salt = new Date().getTime();
			const param = {
				projectAddress: params.id,
				depositor: address,
				timeToClaim: Number(sendData.locked) * 86400,
				salt: salt,
			};
			const tx = await contract.create([allocation], param);
			const receipt = await tx.wait();
			const poolAddress = await contract.predictPoolAddress(address, salt);
			console.log(poolAddress);
			const pool = await createPool({
				operatorId: operatorId,
				wallet: address || '',
				allocationId: allocationId,
				projectId: params.id,
				address: poolAddress,
				creator: address || '',
				lockDuration: Number(sendData.locked) * 86400,
				depositor: sendData.address,
				tokens: [
					{
						token: sendData.token,
						wallets: displayList.map((item: any) => item.wallet),
						amounts: displayList.map((item: any) =>
							ethers
								.parseUnits(((amount * item.percentage) / 100).toFixed(6), 6)
								.toString(),
						),
						ratios: displayList.map((item: any) =>
							parseInt((item.percentage * 10 ** 6).toString()),
						),
					},
				],
			});
			console.log('pool', pool);
			if (pool.id) {
				router.push(`/project/${params.id}/dashboard`);
			}
		} catch (error: any) {
			console.log('error', error);
			error.message && showToast(error.message, 'error');
		}
		setIsRequesting(false);
		closeGlobalLoading();
	};

	const handleLockedInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const {
			target: { value },
		} = event;
		sendData.locked = value;
		setSendData(sendData);
		setParamesError({ ...paramesError, locked: false });
	};

	const handleAllocateChange = (event: SelectChangeEvent) => {
		const {
			target: { value },
		} = event;
		sendData.allocate = value;
		setSendData(sendData);
		setParamesError({ ...paramesError, allocate: false });
	};

	const handleNetworkChange = (event: SelectChangeEvent) => {
		const {
			target: { value },
		} = event;
		sendData.network = value;
		setSendData(sendData);
		setParamesError({ ...paramesError, network: false });
	};

	const handleWalletTypeChange = (event: SelectChangeEvent) => {
		const {
			target: { value },
		} = event;
		sendData.walletType = value;
		setSendData(sendData);
		setParamesError({ ...paramesError, walletType: false });
	};

	const handleTokenChange = (event: SelectChangeEvent) => {
		const {
			target: { value },
		} = event;
		console.log('value', value);
		sendData.token = value;
		setSendData(sendData);
		setParamesError({ ...paramesError, token: false });
	};

	const columns = useMemo(() => {
		console.log('displayList', displayList);
		const columns: GridColDef[] = [
			{
				field: 'nickName',
				headerName: 'Name',
				sortable: false,
				flex: 1,
				minWidth: 150,
				// valueGetter: (params) => {
				// 	return params.row.nickName;
				// },
				renderCell: (item) => {
					const contributor = item.row;
					return (
						<Link href={`/profile/${contributor?.wallet}`}>
							<Img3Provider defaultGateways={defaultGateways}>
								<StyledFlexBox sx={{ gap: '8px' }}>
									<Img3
										src={contributor?.user?.avatar || LogoImage}
										alt="logo"
										style={{
											width: 40,
											height: 40,
											borderRadius: '40px',
											border: '1px solid rgba(15,23,42,0.12)',
										}}
									/>
									<Typography variant="subtitle2" fontSize={16} fontWeight={500}>
										{contributor.nickName}
									</Typography>
									{/*{item.row.user}*/}
								</StyledFlexBox>
							</Img3Provider>
						</Link>
					);
				},
			},
			{
				...walletCell,
				valueGetter: (params) => {
					return params.row.wallet;
				},
			},
			{
				field: 'percentage',
				headerName: 'Percentage',
				flex: 1,
				minWidth: 150,
				type: 'number',
				align: 'left',
				headerAlign: 'left',
				editable: true,
				renderCell: (item) => {
					return (
						<StyledFlexBox>
							<Typography variant="body1" fontSize={16}>
								{item.value}%
							</Typography>
						</StyledFlexBox>
					);
				},
			},
			{
				field: 'credit',
				headerName: 'Pizza slices earned',
				sortable: false,
				flex: 1,
				minWidth: 150,
				valueGetter: (params) => {
					if (amount == 0) return 0;
					const percentage = params.row.percentage;
					const value = (amount * percentage) / 100;
					return value.toFixed(2);
				},
				renderCell: (item) => {
					return (
						<StyledFlexBox sx={{ gap: '4px' }}>
							<Image src="/images/pizza1.png" width={24} height={24} alt="pizza" />
							<Typography variant="subtitle2" fontSize={14} color="#12C29C">
								{item.value || 0}
							</Typography>
						</StyledFlexBox>
					);
				},
			},
		];
		return columns;
	}, [displayList, amount]);
	return (
		<div>
			<StyledFlexBox sx={{ justifyContent: 'space-between', marginBottom: '30px' }}>
				<Typography variant="h3">Create Pool</Typography>
			</StyledFlexBox>
			<Box>
				<Typography sx={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
					Treasury for payment*
				</Typography>
				<StyledFlexBox>
					<TextField
						label="Address*"
						variant="outlined"
						error={paramesError.address}
						sx={{ width: '440px', height: '56px' }}
						value={sendData?.address}
						onChange={(e) => {
							setSendData({ ...sendData, address: e.target.value });
							setParamesError({ ...paramesError, address: false });
						}}
					/>
					<FormControl sx={{ m: 1, width: 200, marginLeft: '20px', height: '56px' }}>
						<InputLabel id="demo-multiple-chip-label" sx={{ fontSize: '16px' }}>
							Wallet type*
						</InputLabel>
						<Select
							labelId="demo-multiple-chip-label"
							id="demo-multiple-chip"
							value={sendData?.walletType}
							onChange={handleWalletTypeChange}
							input={<OutlinedInput label="Wallet type*" />}
							sx={{ width: '200px', height: '56px' }}
							error={paramesError.walletType}
						>
							<MenuItem value={'multi'}>Multi-sig</MenuItem>
							<MenuItem value={'eoa'}>EOA</MenuItem>
						</Select>
					</FormControl>
				</StyledFlexBox>
			</Box>
			<Box sx={{ marginTop: '24px' }}>
				<Typography sx={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
					Total amount*
				</Typography>
				<StyledFlexBox>
					<TextField
						label="Amount *"
						type="number"
						error={paramesError.amount}
						variant="outlined"
						sx={{ width: '135px', height: '56px' }}
						value={amount}
						onChange={(e) => {
							const str = e.target.value;
							setAmount(str);
							setParamesError({ ...paramesError, amount: false });
						}}
					/>
					<FormControl sx={{ m: 1, width: 135, marginLeft: '20px', height: '56px' }}>
						<InputLabel id="demo-multiple-chip-label" sx={{ fontSize: '16px' }}>
							Currency*
						</InputLabel>
						{isProd ? (
							<Select
								labelId="demo-multiple-chip-label"
								id="demo-multiple-chip"
								value={sendData?.token}
								onChange={handleTokenChange}
								input={<OutlinedInput label="Currency*" />}
								sx={{ width: '135px', height: '56px' }}
								error={paramesError.token}
							>
								<MenuItem value={'0x94b008aa00579c1307b0ef2c499ad98a8ce58e58'}>
									USDT
								</MenuItem>
								<MenuItem value={'0x0b2c639c533813f4aa9d7837caf62653d097ff85'}>
									USDC
								</MenuItem>
							</Select>
						) : (
							<Select
								labelId="demo-multiple-chip-label"
								id="demo-multiple-chip"
								value={sendData?.token}
								onChange={handleTokenChange}
								input={<OutlinedInput label="Currency*" />}
								sx={{ width: '135px', height: '56px' }}
								error={paramesError.token}
							>
								<MenuItem value={'0xd368d0420dd938e8e567307f4038df602e2e0430'}>
									USDT
								</MenuItem>
								<MenuItem value={'0x55af86972839732f89eefc4c2adb7bf088078ee0'}>
									USDC
								</MenuItem>
							</Select>
						)}
					</FormControl>
					<FormControl sx={{ m: 1, width: 288, marginLeft: '20px', height: '56px' }}>
						<InputLabel id="demo-multiple-chip-label" sx={{ fontSize: '16px' }}>
							Network*
						</InputLabel>
						<Select
							labelId="demo-multiple-chip-label"
							id="demo-multiple-chip"
							value={sendData?.network}
							onChange={handleNetworkChange}
							input={<OutlinedInput label="Network*" />}
							sx={{ width: '288px', height: '56px' }}
							error={paramesError.network}
						>
							<MenuItem value={'optimism'}>Optimism</MenuItem>
						</Select>
					</FormControl>
					<FormControl sx={{ m: 1, width: 288, marginLeft: '20px', height: '56px' }}>
						<InputLabel id="demo-multiple-chip-label" sx={{ fontSize: '16px' }}>
							Allocate by*
						</InputLabel>
						<Select
							labelId="demo-multiple-chip-label"
							id="demo-multiple-chip"
							value={sendData?.allocate}
							onChange={handleAllocateChange}
							input={<OutlinedInput label="Allocate by*" />}
							sx={{ width: '288px', height: '56px' }}
							error={paramesError.allocate}
						>
							<MenuItem value={'proportion'}>Proportion-based</MenuItem>
							<MenuItem value={'manual'}>Manual</MenuItem>
						</Select>
					</FormControl>
				</StyledFlexBox>
			</Box>
			<Box sx={{ marginTop: '24px' }}>
				<Typography sx={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
					Time locked*
				</Typography>
				<StyledFlexBox>
					<div style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
						<TextField
							required
							type="number"
							label="Time locked*"
							value={sendData?.locked}
							placeholder={'Time locked*'}
							onChange={handleLockedInputChange}
							sx={{ display: 'block', minWidth: '', width: '200px' }}
							error={paramesError.locked}
						/>
						<span style={{ marginLeft: '12px' }}>Day</span>
					</div>
				</StyledFlexBox>
			</Box>
			<Box sx={{ marginTop: '36px' }}>
				<LoadingButton
					loading={isRequesting}
					variant="contained"
					color="primary"
					sx={{ marginRight: '20px' }}
					onClick={allocate}
				>
					Allocate
				</LoadingButton>
				<Typography sx={{ fontSize: '12px', color: '#64748B', marginTop: '12px' }}>
					The results will be displayed below.
				</Typography>
			</Box>
			<Box sx={{ marginTop: '24px', background: '#F8FAFC', padding: '20px 24px' }}>
				<DataGrid
					loading={isLoading}
					rows={displayList}
					columns={columns}
					rowHeight={72}
					autoHeight
					hideFooter={true}
					pageSizeOptions={[10, 20]}
					sx={{
						border: 0,
						'& .mui-de9k3v-MuiDataGrid-selectedRowCount': {
							visibility: 'hidden',
						},
					}}
					disableColumnMenu
					isRowSelectable={() => false}
				/>
			</Box>
		</div>
	);
}
