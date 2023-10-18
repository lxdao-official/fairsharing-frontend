'use client';

import useSWR from 'swr';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Typography, styled, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { StyledFlexBox } from '@/components/styledComponents';
import { PermissionEnum, getContributorList, IContributor } from '@/services';
import { nickNameCell, walletCell } from '@/components/table/cell';

const PermissionWrapper = styled('div')`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2px 8px;
	background-color: #f1f5f9;
	border-radius: 2px;
`;

const columns: GridColDef[] = [
	nickNameCell,
	walletCell,
	{
		field: 'permission',
		headerName: 'Role',
		sortable: false,
		flex: 1,
		minWidth: 150,
		renderCell: (item) => {
			return (
				<PermissionWrapper>
					<Typography variant="body2">{PermissionEnum[item.value]}</Typography>
				</PermissionWrapper>
			);
		},
	},
	{
		field: 'createAt',
		headerName: 'Joined time',
		flex: 1,
		minWidth: 150,
		renderCell: (item) => {
			const date = new Date(item.value);
			const value = date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			});
			return <Typography variant="body2">{value}</Typography>;
		},
	},
];

export default function Page({ params }: { params: { id: string } }) {
	const [contributorList, setContributorList] = useState<IContributor[]>([]);
	const { isLoading, data } = useSWR(
		['getContributorList', params.id],
		() => getContributorList(params.id),
		{
			fallbackData: [],
		},
	);

	useEffect(() => {
		setContributorList(data);
	}, [data]);

	const handleSearch = useCallback(
		(e: any) => {
			const list = data.filter((item) => {
				const regex = new RegExp(e.target.value, 'i');
				return regex.test(item.nickName);
			});
			setContributorList(list);
		},
		[data],
	);

	return (
		<div>
			<StyledFlexBox sx={{ justifyContent: 'space-between', marginBottom: '30px' }}>
				<Typography variant="h3">Contributors</Typography>
				<TextField label="Search" size="small" onChange={handleSearch} />
			</StyledFlexBox>
			<DataGrid
				autoHeight
				loading={isLoading}
				disableRowSelectionOnClick={contributorList.length <= 1}
				rows={contributorList || []}
				disableColumnMenu
				columns={columns}
				rowHeight={72}
				initialState={{
					pagination: {
						paginationModel: { page: 0, pageSize: 10 },
					},
				}}
				pageSizeOptions={[10, 20]}
				sx={{
					border: 0,
					'& .MuiDataGrid-columnHeader:focus': {
						outline: '1px solid #fff',
					},
				}}
			/>
		</div>
	);
}
