'use client';

import useSWR from 'swr';
import { ethers } from "ethers";
import {
	Typography, styled, TextField, Box, Button,
	FormControl, InputLabel, Select, MenuItem, OutlinedInput
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { StyledFlexBox } from '@/components/styledComponents';
import { SelectChangeEvent } from '@mui/material/Select';
import { closeGlobalLoading, openGlobalLoading, showToast } from '@/store/utils';
import useEas from '@/hooks/useEas';
import axios from 'axios';
import {
	getAllocationDetails,
	getContributorList,
	getContributionTypeList,
	createAllocation,
	getUserInfo,
	updateAllocationState
} from '@/services';
import Link from 'next/link';
import Image from 'next/image';
import { Img3, Img3Provider } from '@lxdao/img3';
import { add, endOfYear, format, set, startOfYear } from 'date-fns';
import { defaultGateways, LogoImage } from '@/constant/img3';
import { walletCell } from '@/components/table/cell';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useEthersProvider, useEthersSigner } from '@/common/ether';
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

import {
	EasSchemaAllocationKey,
	EasSchemaData,
	EasSchemaMap,
	EasSchemaTemplateMap,
	EasSchemaVoteKey,
} from '@/constant/contract';

const DateContainer = styled(StyledFlexBox)(({ theme }) => ({
	width: '300px',
	border: '1px solid rgba(15, 23, 42, 0.2)',
	borderRadius: '4px',
	height: '40px',
	'&:hover': {
		borderColor: 'rgba(15, 23, 42, 0.5)',
	},
}));


export default function Page({ params }: { params: { id: string } }) {
	const router = useRouter();
	const { getEasScanURL, submitSignedAttestation, getOffchain } = useEas();

	const [selectedType, setSelectedType] = React.useState<string[]>([]);
	const [searchText, setSearchText] = useState('');
	const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
	const [openEndDatePicker, setOpenEndDatePicker] = useState(false);
	const [list, setList] = useState<any>([]);
	const [title, setTitle] = useState('');
	const [purposeError, setPurposeError] = useState(false);
	const [operatorId, setOperatorId] = useState('');
	const [isRequestLoading, setIsRequestLoading] = useState(false);
	const [startDate, setStartDate] = useState<Date>(() => {
		return startOfYear(new Date());
	});
	const [endDate, setEndDate] = useState<Date>(() => {
		return endOfYear(new Date());
	});

	const { address, chainId } = useAccount();
	const { openConnectModal } = useConnectModal();
	console.log('address', address);
	const provider = useEthersProvider();
	const signer = useEthersSigner();

	const { data: userInfoData } = useSWR(address ? ['getUserInfo', address] : null, () =>
		getUserInfo(address!),
	);

	const { isLoading, data: allocationDetails } = useSWR(
		['getAllocationDetails', params.id, startDate, endDate, selectedType],
		() =>
			getAllocationDetails({
				projectId: params.id,
				endDateFrom: new Date(startDate).getTime(),
				endDateTo: new Date(endDate).getTime(),
				type: selectedType.reduce((pre, cur, idx) => {
					return `${pre}${idx > 0 ? ',' : ''}${cur}`;
				}, ''),
			}),
		{
			fallbackData: {},
			onSuccess: (data) => console.log('allocationDetails', data),
		},
	);

	const { data: contributionTypeList } = useSWR(
		['project/contributionType', params.id],
		() => getContributionTypeList(params.id),
		{ fallbackData: [] },
	);

	const { data: contributorList } = useSWR(
		['contributor/list', params.id],
		() => getContributorList(params.id),
		{
			fallbackData: [],
		},
	);

	useEffect(() => {
		console.log('userInfoData', userInfoData);
		if (userInfoData && contributorList.length) {
			contributorList.forEach((contributor: any) => {
				if (contributor.userId == userInfoData.id) {
					setOperatorId(contributor.id);
				}
			})
		}
	}, [userInfoData, contributorList]);

	const claimedAmount = useMemo(() => {
		return Object.keys(allocationDetails).reduce((acc, cur) => {
			return acc + allocationDetails[cur];
		}, 0);
	}, [allocationDetails]);

	useEffect(() => {
		if (!contributorList.length) return;
		console.log('allocationDetails', claimedAmount);
		const cl:any = []
		contributorList.forEach((contributor: any, index: any) => {
			if (allocationDetails[contributor.id]) {
				contributor.credit = allocationDetails[contributor.id];
				// contributor.percentage = Number(((allocationDetails[contributor.id] / claimedAmount) * 100)).toFixed(2)
				// 如果是最后一个就用100 - 前面的
				if (index === contributorList.length - 1) {
					contributor.percentage = (100 - cl.reduce((acc: number, cur: any) => {
						return acc + parseFloat(cur.percentage);
					}, 0)).toFixed(2);
				} else {
					contributor.percentage = Number(((allocationDetails[contributor.id] / claimedAmount) * 100)).toFixed(2);
				}
				
				cl.push(contributor);	
			} else {
				contributor.credit = 0;
				contributor.percentage = 0;
			}
		})
		console.log('cl', cl);
		setList(cl);

	}, [contributorList, claimedAmount, allocationDetails]);

	const allocationDetailList = useMemo(() => {
		return contributorList.filter(contributor => {
			return !!allocationDetails[contributor.id]
		})
	}, [allocationDetails, contributorList])

	const displayList = useMemo(() => {
		console.log('displayList', list);
		if (!list.length) return [];
		return list.filter((contributor: any) => {
			if (!searchText) return true;
			const regex = new RegExp(searchText, 'i');
			return regex.test(contributor.nickName);
		})
	}, [searchText, list, allocationDetails]);

	const handleChange = (event: SelectChangeEvent<typeof selectedType>) => {
		const {
			target: { value },
		} = event;
		console.log('handleChange value', value);
		setSelectedType(value as string[]);
	};

	const titleChange = (e: any) => {
		setTitle(e.target.value);
		setPurposeError(false);
	}

	const handleSearch = (e: any) => {
		setSearchText(e.target.value)
	}

	const handleCellEditCommit = (params: any) => {
		setList(list.map((row: any) => (row.id === params.id ? params : row)));
	};

	const handleProcessRowUpdateError = (params: any) => {
		console.error('Failed to update row:', params);
	}

	const onCreateAllocation = () => {
		if (!address) {
			openConnectModal?.();
			return;
		}
	}

	const save = async () => {
		console.log('save', list, address, userInfoData?.id);
		if (!address) {
			openConnectModal?.();
			return;
		}
		if (!list.length) return;
		if (!title) {
			setPurposeError(true);
			return;
		}
		//ratios total must be 100
		const total = list.reduce((acc: number, cur: any) => {
			return acc + parseFloat(cur.percentage);
		}, 0).toFixed(2);
		if (total != 100) {
			// 必须是100，当前是${total}
			showToast('The sum of the ratios must be 100, current is ' + total, 'error');
			return;
		}
		setIsRequestLoading(true);
		openGlobalLoading();
		try {
			// const operatorId = "891b3337-a722-4c2a-afc2-e4503c031a92"
			const allocation = await createAllocation({
				operatorId: operatorId || '',
				wallet: address || '',
				projectId: params.id,
				title: title,
				contributors: list.map((item: any) => item.wallet),
				ratios: list.map((item: any) => parseInt((item.percentage * 10 ** 6).toString())),
				credits: list.map((item: any) => ethers.parseUnits((item.credit).toString(), 18).toString()),
			})
			const offchain = getOffchain();
			const contributionSchemaUid = EasSchemaMap.allocation;
			const schemaEncoder = new SchemaEncoder(EasSchemaTemplateMap.allocation);

			const data: EasSchemaData<EasSchemaAllocationKey>[] = [
				{ name: 'ProjectAddress', value: params.id, type: 'address' },
				{ name: 'Title', value: title, type: 'string' },
				{ name: 'WalletAddresses', value: list.map((item: any) => item.wallet), type: 'address[]' },
				{ name: 'AllocationRatios', value: list.map((item: any) => parseInt((item.percentage * 10 ** 6).toString())), type: 'uint32[]' },
				{ name: 'TokenAmounts', value: list.map((item: any) => ethers.parseUnits((item.credit).toString(), 18).toString()), type: 'uint256[]' },
			];
			// console.log('[EAS postContribution data]', data);
			const encodedData = schemaEncoder.encodeData(data);
			const block = await provider.getBlock('latest');
			console.log('block', block, signer);
			if (!signer) {
				return;
			}
			const defaultRecipient = '0x0000000000000000000000000000000000000000';
			const offchainAttestation = await offchain.signOffchainAttestation(
				{
					recipient: defaultRecipient,
					expirationTime: BigInt(0),
					time: BigInt(block ? block.timestamp : 0),
					revocable: true,
					version: 1,
					nonce: BigInt(0),
					schema: '0xaf37a2043e159e7c7bbbdf57cfd685ff370619a6f978ca348de958952361956d',
					refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
					data: encodedData,
				},
				signer,
			);
			console.log('offchainAttestation', offchainAttestation);
			const res = await submitSignedAttestation({
				signer: address as string,
				sig: offchainAttestation,
			}, chainId || 10);
			if (res.data.error) {
				console.error('submitSignedAttestation fail', res.data);
				throw new Error(res.data.error);
			}
			const baseURL = getEasScanURL();
			// Update ENS names
			const getENSRes = await axios.get(`${baseURL}/api/getENS/${address}`);
			// 传eas返回的uid, 更新status为ready
			const updateStatus = await updateAllocationState(allocation.id, {
				status: 'ATTESTED',
				uId: res.data.offchainAttestationId as string,
				wallet: address,
				operatorId: operatorId,
			});
			const ratios = list.map((item: any) => {
				return {
					id: item.id,
					ratio: item.percentage
				}
			})
			const localData = {
				allocationId: allocation.id,
				ratios
			}
			closeGlobalLoading();
			
			localStorage.setItem('allocationDetail', JSON.stringify(localData));
			router.push(`/project/${params.id}/createpool?allocationId=${allocation.id}`);
			console.log('updateStatus', updateStatus);
		} catch (error: any) {
			console.error('createAllocation error', error);
			error.message && showToast(error.message, 'error');
		}
		setIsRequestLoading(false);
	}

	const columns = useMemo(() => {
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
					const contributor = item.row
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
				renderCell: (item) => {
					return (
						<StyledFlexBox sx={{ gap: '4px' }}>
							<Image src="/images/pizza1.png" width={24} height={24} alt="pizza" />
							<Typography variant="subtitle2" fontSize={14} color="#12C29C">
								{item.value}
							</Typography>
						</StyledFlexBox>
					);
				},
			},
		];
		return columns;
	}, [claimedAmount, allocationDetails]);
	return (
		<div style={{ position: 'relative', height: '100%' }}>
			<div style={{ height: 'calc(100% - 90px)', overflow: 'auto' }}>
				<StyledFlexBox sx={{ justifyContent: 'space-between', marginBottom: '30px' }}>
					<Typography variant="h3">Create Pool</Typography>
				</StyledFlexBox>
				<Box>
					<Typography sx={{ fontSize: '20px 24px', fontWeight: 500, marginBottom: '8px', borderRadius: '4px' }}>Type your purpose*</Typography>
					<StyledFlexBox>
						<TextField
							label="purpose*"
							variant="outlined"
							sx={{ width: '440px', height: '56px' }}
							value={title}
							onChange={titleChange}
							error={purposeError}
						/>
					</StyledFlexBox>
				</Box>

				<Box sx={{ padding: '16px', background: '#F8FAFC', marginTop: '24px' }}>
					<Typography variant="h3">Allocation Details</Typography>
					<StyledFlexBox sx={{ justifyContent: 'space-between', width: '100%' }}>
						<StyledFlexBox sx={{ width: '100%' }}>
							<DateContainer>
								<LocalizationProvider dateAdapter={AdapterDateFns}>
									<DatePicker
										format={'MM/dd/yyyy'}
										value={startDate}
										onChange={(date) => setStartDate(date!)}
										open={openStartDatePicker}
										onOpen={() => setOpenStartDatePicker(true)}
										onClose={() => setOpenStartDatePicker(false)}
										sx={{
											width: '120px',
											'& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
												border: 'none',
											},
										}}
										slotProps={{
											openPickerButton: { sx: { display: 'none' } },
											textField: { onClick: () => setOpenStartDatePicker(true) },
										}}
									/>
									<Typography variant={'body2'} sx={{ margin: '0 4px 0 0' }}>
										to
									</Typography>
									<DatePicker
										format={'MM/dd/yyyy'}
										value={endDate}
										onChange={(date) => {
											if (date) {
												date.setHours(23, 59, 59, 999);
											}
											setEndDate(date!);
										}}
										open={openEndDatePicker}
										onOpen={() => setOpenEndDatePicker(true)}
										onClose={() => setOpenEndDatePicker(false)}
										sx={{
											width: '160px',
											'& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
												border: 'none',
											},
										}}
										slotProps={{
											openPickerIcon: { sx: { opacity: 0.2 } },
											textField: { onClick: () => setOpenEndDatePicker(true) },
										}}
									/>
								</LocalizationProvider>
							</DateContainer>
							{contributionTypeList.length > 0 ? (
								<FormControl sx={{ m: 1, width: 200, marginLeft: '20px' }} size="small">
									<InputLabel id="demo-multiple-chip-label">Type</InputLabel>
									<Select
										labelId="demo-multiple-chip-label"
										id="demo-multiple-chip"
										multiple
										value={selectedType}
										onChange={handleChange}
										input={<OutlinedInput label="Name" />}
									>
										{contributionTypeList.map((item) => (
											<MenuItem key={item.id} value={item.name}>
												{item.name}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							) : null}
							<TextField
								label="Search"
								size="small"
								value={searchText}
								onChange={handleSearch}
								sx={{ marginLeft: '20px' }}
							/>

							<Button
								variant="contained"
								color="primary"
								sx={{ marginLeft: '20px' }}
								onClick={() => {
									setStartDate(startOfYear(new Date()));
									setEndDate(endOfYear(new Date()));
									setSelectedType([]);
									setSearchText('');
								}}
							>
								reset
							</Button>

							<Typography sx={{ flex: 1, textAlign: 'right', fontSize: '14px' }}>Total: {claimedAmount}</Typography>
						</StyledFlexBox>
					</StyledFlexBox>
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
						processRowUpdate={handleCellEditCommit}
						onProcessRowUpdateError={handleProcessRowUpdateError}
					/>
				</Box>
			</div>
			<div className="ft" style={{ height: '80px', borderTop: '1px solid #0F172A29', display: 'flex', alignItems: 'center' }}>
				<LoadingButton
					loading={isRequestLoading}
					variant="contained"
					color="primary"
					sx={{ marginRight: '20px' }}
					onClick={save}
				>
					Create pool
				</LoadingButton>
				<Button
					variant="outlined"
					color="primary"
					sx={{ marginRight: '20px' }}
					onClick={() => router.back()}
				>
					Cancel
				</Button>
			</div>
		</div>

	);
}
