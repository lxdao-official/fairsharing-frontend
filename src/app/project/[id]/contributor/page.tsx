'use client';

import useSWR from 'swr';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Avatar, Typography, styled, TextField } from '@mui/material';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { StyledFlexBox } from '@/components/styledComponents';
import { IContributor } from '@/services/types';
import { getContributorList } from '@/services/contributor';
import { PermissionEnum } from '@/services/project';
import { formatWalletAddress } from '@/utils/wallet';
import { showToast } from '@/store/utils';

const PermissionWrapper = styled('div')`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2px 8px;
	background-color: #f1f5f9;
	border-radius: 2px;
`;

const columns: GridColDef[] = [
	{
		field: 'nickName',
		headerName: 'Name',
		sortable: false,
		width: 200,
		renderCell: (item) => {
			return (
				<StyledFlexBox sx={{ gap: '8px' }}>
					<Avatar alt={item.value} src={item.row.user?.avatar || ''} />
					<Typography variant="subtitle2" fontSize={16}>
						{item.value}
					</Typography>
				</StyledFlexBox>
			);
		},
	},
	{
		field: 'wallet',
		headerName: 'ETH Wallet',
		sortable: false,
		width: 200,
		renderCell: (item) => {
			return (
				<StyledFlexBox sx={{ gap: '4px' }}>
					<Typography variant="body1">{formatWalletAddress(item.value)}</Typography>
					<CopyToClipboard text={item.value} onCopy={() => showToast('Copy success!')}>
						<Image
							src="/images/copy.png"
							width={24}
							height={24}
							alt="copy"
							style={{ cursor: 'pointer' }}
						/>
					</CopyToClipboard>
				</StyledFlexBox>
			);
		},
	},
	{
		field: 'permission',
		headerName: 'Role',
		sortable: false,
		width: 200,
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
		width: 200,
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
		['contributor/list', params.id],
		() => getContributorList(params.id),
		{
			fallbackData: [],
			onSuccess: (data) => setContributorList(data),
		},
	);

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
				loading={isLoading}
				rows={contributorList || []}
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
				}}
			/>
		</div>
	);
}
