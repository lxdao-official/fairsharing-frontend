import {
	Button,
	InputLabel,
	MenuItem,
	OutlinedInput,
	Select,
	SelectChangeEvent,
	styled,
	TextField,
	Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useSWR from 'swr';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Link from 'next/link';
import { Img3, Img3Provider } from '@lxdao/img3';

import Image from 'next/image';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { endOfDay, startOfDay } from 'date-fns';

import FormControl from '@mui/material/FormControl';

import { walletCell } from '@/components/table/cell';
import { StyledFlexBox } from '@/components/styledComponents';
import { defaultGateways, LogoImage } from '@/constant/img3';
import {
	getAllocationDetails,
	getContributionTypeList,
	getContributorList,
	getMintRecord,
	IMintRecord,
} from '@/services';

export interface IAllocationProps {
	id: string;
	totalAmount: number;
	currencyName: string;
	onChange: (list: IMintRecord[], claimedAmount: number) => void;
	onChangeAllocationDetails: (detail: Record<string, number>) => void;
	isETH: boolean;
}

export default function Allocation(props: IAllocationProps) {
	const [recordList, setRecordList] = useState<IMintRecord[]>([]);

	const [startDate, setStartDate] = useState<Date>(() => {
		return startOfDay(new Date());
	});

	const [endDate, setEndDate] = useState<Date>(() => {
		return endOfDay(new Date());
	});
	const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
	const [openEndDatePicker, setOpenEndDatePicker] = useState(false);
	const [filterContributor, setFilterContributor] = useState('All');
	const [selectedType, setSelectedType] = React.useState<string[]>([]);

	const { isLoading, data } = useSWR(['getMintRecord', props.id], () => getMintRecord(props.id), {
		fallbackData: [],
		onSuccess: (data) => {
			setRecordList(data);
			console.log('setRecordList', data);
		},
	});

	const { data: contributionTypeList } = useSWR(
		['project/contributionType', props.id],
		() => getContributionTypeList(props.id),
		{ fallbackData: [] },
	);

	const { data: allocationDetails } = useSWR(
		['getAllocationDetails', props.id, startDate, endDate, selectedType],
		() =>
			getAllocationDetails({
				projectId: props.id,
				endDateFrom: new Date(startDate).getTime(),
				endDateTo: new Date(endDate).getTime(),
				type: selectedType.reduce((pre, cur, idx) => {
					return `${pre}${idx > 0 ? ',' : ''}${cur}`;
				}, ''),
			}),
		{
			fallbackData: {},
			onSuccess: (data) => {
				props.onChangeAllocationDetails(data);
			},
			retry: false,
			errorRetryCount: 2,
			keepPreviousData: true,
		},
	);

	const filterRecordList = useMemo(() => {
		// allocationDetails里有key才会过滤出来
		let list = recordList.filter((item) => {
			const contributorId = item.contributor.id;
			const credit = allocationDetails[contributorId];
			return !!credit || credit === 0;
		});
		if (filterContributor !== 'All') {
			list = list.filter((item) => {
				return item.contributor.id === filterContributor;
			});
		}
		console.log('filterRecordList', list);
		return list;
	}, [filterContributor, recordList, allocationDetails]);

	const { data: contributorList } = useSWR(
		['contributor/list', props.id],
		() => getContributorList(props.id),
		{
			fallbackData: [],
		},
	);

	const claimedAmount = useMemo(() => {
		return Object.keys(allocationDetails).reduce((acc, cur) => {
			return acc + allocationDetails[cur];
		}, 0);
	}, [allocationDetails]);

	const columns = useMemo(() => {
		const columns: GridColDef[] = [
			{
				field: 'nickName',
				headerName: `Name (${filterRecordList.length})`,
				sortable: false,
				flex: 1,
				minWidth: 150,
				valueGetter: (params) => {
					return params.row.contributor.nickName;
				},
				renderCell: (item) => {
					const contributor = contributorList.find(
						(contributor) => contributor.id === item.row.contributorId,
					);
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
										{item.value}
									</Typography>
									{item.row.user}
								</StyledFlexBox>
							</Img3Provider>
						</Link>
					);
				},
			},
			{
				...walletCell,
				valueGetter: (params) => {
					return params.row.contributor.wallet;
				},
			},
			{
				field: 'percentage',
				headerName: 'Percentage',
				flex: 1,
				minWidth: 150,
				valueGetter: (params) => {
					const credit = allocationDetails[params.row.contributorId] || 0;
					const percentage = (credit / claimedAmount) * 100;
					return percentage.toFixed(2);
				},
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
					const credit = allocationDetails[item.row.contributorId] || 0;
					return (
						<StyledFlexBox sx={{ gap: '4px' }}>
							<Image src="/images/pizza1.png" width={24} height={24} alt="pizza" />
							<Typography variant="subtitle2" fontSize={14} color="#12C29C">
								{credit}
							</Typography>
						</StyledFlexBox>
					);
				},
			},
			{
				field: 'amount',
				headerName: `Total: ${props.totalAmount} ${props.currencyName}`,
				sortable: true,
				minWidth: 200,
				valueGetter: (params) => {
					const credit = allocationDetails[params.row.contributorId] || 0;
					const percentage = credit / claimedAmount;
					const value = props.totalAmount * percentage;
					// return props.isETH ? Math.round(value) : value.toFixed(8);
					return value.toFixed(6);
				},
				renderCell: (item) => {
					return (
						<Typography variant="body1" fontSize={16}>
							{item.value}
						</Typography>
					);
				},
			},
		];
		return columns;
	}, [
		claimedAmount,
		contributorList,
		filterRecordList.length,
		props.currencyName,
		props.totalAmount,
		props.isETH,
		allocationDetails,
	]);

	useEffect(() => {
		const totalClaimedAmount = filterRecordList.reduce((pre, cur) => {
			return pre + allocationDetails[cur.contributor.id];
		}, 0);
		props.onChange(filterRecordList, totalClaimedAmount);
	}, [filterRecordList, allocationDetails]);

	const handleContributorChange = (event: SelectChangeEvent) => {
		setFilterContributor(event.target.value);
	};

	const handleSearch = useCallback(
		(e: any) => {
			const list = filterRecordList.filter((item) => {
				const regex = new RegExp(e.target.value, 'i');
				return regex.test(item.contributor.nickName);
			});
			setRecordList(list);
		},
		[filterRecordList],
	);

	const handleChange = (event: SelectChangeEvent<typeof selectedType>) => {
		const {
			target: { value },
		} = event;
		setSelectedType(value as string[]);
	};

	const handleRest = () => {
		setStartDate(startOfDay(new Date()));
		setEndDate(endOfDay(new Date()));
		setFilterContributor('All');
		setRecordList(filterRecordList);
	};

	return (
		<Container>
			<Typography variant={'h3'}>Allocation Details</Typography>

			<FormContainer>
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
				<Select
					id="contributor"
					value={filterContributor}
					onChange={handleContributorChange}
					placeholder={'Contributor'}
					sx={{ width: '200px' }}
					size={'small'}
				>
					<MenuItem value={'All'}>All contributors({contributorList.length})</MenuItem>
					{contributorList.map((contributor) => (
						<MenuItem key={contributor.wallet} value={contributor.id}>
							{contributor.nickName}
						</MenuItem>
					))}
				</Select>
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
				<TextField label="Search" size="small" onChange={handleSearch} />
				<TextButton style={{ marginLeft: '16px' }} onClick={handleRest}>
					Reset
				</TextButton>
			</FormContainer>

			<div style={{ width: '100%' }}>
				<DataGrid
					loading={isLoading}
					rows={filterRecordList}
					columns={columns}
					rowHeight={72}
					autoHeight
					initialState={{
						pagination: {
							paginationModel: { page: 0, pageSize: 50 },
						},
					}}
					pageSizeOptions={[50, 100]}
					sx={{
						border: 0,
						'& .mui-de9k3v-MuiDataGrid-selectedRowCount': {
							visibility: 'hidden',
						},
					}}
					isRowSelectable={() => false}
				/>
			</div>
		</Container>
	);
}

const Container = styled('div')(({ theme }) => ({
	backgroundColor: '#F8FAFC',
	width: '100%',
	minHeight: '200px',
	marginTop: '24px',
	padding: '24px',
}));

const FormContainer = styled(StyledFlexBox)(({ theme }) => ({
	width: '100%',
	margin: '24px 0',
	gap: '16px',
}));
const DateContainer = styled(StyledFlexBox)(({ theme }) => ({
	width: '300px',
	border: '1px solid rgba(15, 23, 42, 0.2)',
	borderRadius: '4px',
	height: '40px',
	'&:hover': {
		borderColor: 'rgba(15, 23, 42, 0.5)',
	},
}));
const TextButton = styled('span')({
	cursor: 'pointer',
	fontWeight: '500',
	'&:hover': {
		opacity: '0.5',
	},
});
