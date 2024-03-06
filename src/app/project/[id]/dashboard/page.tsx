'use client';

import useSWR from 'swr';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Typography, TextField, Button, styled } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

import { Img3, Img3Provider } from '@lxdao/img3';

import Link from 'next/link';

import { StyledFlexBox } from '@/components/styledComponents';
import { IMintRecord, getMintRecord, getContributorList, getAllocationDetails } from '@/services';
import { nickNameCell, walletCell } from '@/components/table/cell';
import { defaultGateways, LogoImage } from '@/constant/img3';
import { isProd } from '@/constant/env';
import { endOfDay, endOfYear, startOfDay, startOfYear } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function Page({ params }: { params: { id: string } }) {
	const [safeUrl, setSafeUrl] = useState('');

	const [startDate, setStartDate] = useState<Date>(() => {
		return startOfYear(new Date());
	});

	const [endDate, setEndDate] = useState<Date>(() => {
		return endOfYear(new Date());
	});
	const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
	const [openEndDatePicker, setOpenEndDatePicker] = useState(false);
	const [filterContributor, setFilterContributor] = useState('All');

	const [recordList, setRecordList] = useState<IMintRecord[]>([]);
	const { isLoading, data } = useSWR(
		['getMintRecord', params.id],
		() => getMintRecord(params.id),
		{
			fallbackData: [],
			onSuccess: (data) => setRecordList(data),
		},
	);

	const { data: allocationDetails } = useSWR(
		['getAllocationDetails', params.id, startDate, endDate],
		() =>
			getAllocationDetails({
				projectId: params.id,
				endDateFrom: new Date(startDate).getTime(),
				endDateTo: new Date(endDate).getTime(),
			}),
		{
			fallbackData: {},
			onSuccess: (data) => console.log('allocationDetails', data),
		},
	);

	const { data: contributorList } = useSWR(
		['contributor/list', params.id],
		() => getContributorList(params.id),
		{
			fallbackData: [],
		},
	);

	// const claimedAmount = useMemo(() => {
	// 	return recordList.reduce((acc, cur) => {
	// 		return acc + cur.credit;
	// 	}, 0);
	// }, [recordList]);

	const claimedAmount = useMemo(() => {
		return Object.keys(allocationDetails).reduce((acc, cur) => {
			return acc + allocationDetails[cur];
		}, 0);
	}, [allocationDetails]);

	const columns = useMemo(() => {
		const columns: GridColDef[] = [
			{
				field: 'nickName',
				headerName: 'Name',
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
					if (claimedAmount === 0) return 0;
					const credit = allocationDetails[params.row.contributorId] || 0;
					if (credit === 0) return 0;
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
		];
		return columns;
	}, [claimedAmount, contributorList]);

	const handleSearch = useCallback(
		(e: any) => {
			const list = data.filter((item) => {
				const regex = new RegExp(e.target.value, 'i');
				return regex.test(item.contributor.nickName);
			});
			setRecordList(list);
		},
		[data],
	);

	useEffect(() => {
		const inSafeApp = window.parent.location !== window.location;
		if (inSafeApp) {
			setSafeUrl(`/payment/${params.id}/create`);
		} else {
			setSafeUrl(
				`https://app.safe.global/share/safe-app?appUrl=${encodeURIComponent(
					location.origin,
				)}`,
			);
		}
	}, []);

	return (
		<div style={{ width: '100%' }}>
			<Typography variant="h3" sx={{ marginBottom: '30px' }}>Dashboard</Typography>

			<StyledFlexBox sx={{ justifyContent: 'space-between' }}>
				<StyledFlexBox>
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
								onChange={(date) => setEndDate(date!)}
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
					<TextField label="Search" size="small" onChange={handleSearch} sx={{ marginLeft: '20px' }} />
				</StyledFlexBox>
				<Link href={safeUrl}>
					<Button variant={'contained'} sx={{ marginLeft: '16px' }}>
						Create payment
					</Button>
				</Link>
			</StyledFlexBox>

			<div style={{ width: '100%' }}>
				<DataGrid
					loading={isLoading}
					rows={recordList || []}
					columns={columns}
					rowHeight={72}
					autoHeight
					initialState={{
						pagination: {
							paginationModel: { page: 0, pageSize: 10 },
						},
					}}
					pageSizeOptions={[10, 20]}
					sx={{
						border: 0,
						'& .mui-de9k3v-MuiDataGrid-selectedRowCount': {
							visibility: 'hidden',
						},
					}}
					isRowSelectable={() => false}
				/>
			</div>
		</div>
	);
}

const DateContainer = styled(StyledFlexBox)(({ theme }) => ({
	width: '300px',
	border: '1px solid rgba(15, 23, 42, 0.2)',
	borderRadius: '4px',
	height: '40px',
	'&:hover': {
		borderColor: 'rgba(15, 23, 42, 0.5)',
	},
}));
