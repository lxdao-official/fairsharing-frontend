'use client';

import useSWR from 'swr';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Typography, TextField } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';

import { StyledFlexBox } from '@/components/styledComponents';
import { IMintRecord, getMintRecord } from '@/services';
import { nickNameCell, walletCell } from '@/components/table/cell';

export default function Page({ params }: { params: { id: string } }) {
	const [recordList, setRecordList] = useState<IMintRecord[]>([]);
	const { isLoading, data } = useSWR(
		['getMintRecord', params.id],
		() => getMintRecord(params.id),
		{
			fallbackData: [],
			onSuccess: (data) => setRecordList(data),
		},
	);

	const claimedAmount = useMemo(() => {
		return recordList.reduce((acc, cur) => {
			return acc + cur.credit;
		}, 0);
	}, [recordList]);

	const columns = useMemo(() => {
		const columns: GridColDef[] = [
			{
				...nickNameCell,
				valueGetter: (params) => {
					return params.row.contributor.nickName;
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
					const percentage = (params.row.credit / claimedAmount) * 100;
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
	}, [claimedAmount]);

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

	return (
		<div style={{ width: '100%' }}>
			<StyledFlexBox sx={{ justifyContent: 'space-between', marginBottom: '30px' }}>
				<Typography variant="h3">Dashboard</Typography>
				<TextField label="Search" size="small" onChange={handleSearch} />
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
					}}
				/>
			</div>
		</div>
	);
}
