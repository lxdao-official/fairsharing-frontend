import {
	InputAdornment,
	styled,
	TextField,
	Typography,
} from '@mui/material';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';

import useSWR from 'swr';
import { DataGrid, GridCallbackDetails, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import Link from 'next/link';
import { Img3, Img3Provider } from '@lxdao/img3';

import { walletCell } from '@/components/table/cell';
import { StyledFlexBox } from '@/components/styledComponents';
import { defaultGateways, LogoImage } from '@/constant/img3';
import {
	getContributorList,
	IContributor,
	IMintRecord,
} from '@/services';
import { IAllocatorTypeEnum } from '@/app/payment/[id]/create/page';

export type IContributorCopy = IContributor & { allocateValue: string };
export interface IAllocationProps {
	id: string;
	totalAmount: number;
	currencyName: string;
	allocatorType: IAllocatorTypeEnum;
	onChange: (list: IMintRecord[], claimedAmount: number) => void;
	onChangeAllocationDetails: (detail: Record<string, number>) => void;
	onChangeManualInfo: (list: IContributorCopy[]) => void;
	isETH: boolean;
}

export default function ManualAllocation(props: IAllocationProps) {
	const [selectedRowIds, setSelectedRowIds] = React.useState<Array<string | number>>([]);
	const [copyMapForManual, setCopyMapForManual] = useState<Record<string, IContributorCopy>>({});

	const { isLoading, data: contributorList } = useSWR(
		['contributor/list', props.id],
		() => getContributorList(props.id),
		{
			onSuccess: (data) => {
				const map = data.reduce(
					(pre, cur) => {
						return {
							...pre,
							[cur.id]: {
								...cur,
								allocateValue: '',
							},
						};
					},
					{} as Record<string, IContributorCopy>,
				);
				setCopyMapForManual(map);
			},
			fallbackData: [],
			revalidateOnFocus: false,
			revalidateOnMount: false,
			revalidateOnReconnect: false,
			revalidateIfStale: false,
			refreshInterval: 0
		},
	);

	const manualTotalAmount = useMemo(() => {
		let amount = 0;
		selectedRowIds.forEach((id) => {
			amount += Number(copyMapForManual[id]?.allocateValue);
		});
		return amount.toFixed(6);
	}, [copyMapForManual, selectedRowIds]);

	const columns = useMemo(() => {
		const columns: GridColDef[] = [
			{
				field: 'nickName',
				headerName: `Name (${contributorList.length})`,
				sortable: false,
				flex: 1,
				minWidth: 150,
				renderCell: (item) => {
					console.log('renderCell', item);
					const avatar = item.row?.user?.avatar || LogoImage;
					return (
						<Link href={`/profile/${item.row?.wallet}`}>
							<Img3Provider defaultGateways={defaultGateways}>
								<StyledFlexBox sx={{ gap: '8px' }}>
									<Img3
										src={avatar}
										alt="logo"
										style={{
											width: 40,
											height: 40,
											borderRadius: '40px',
											border: '1px solid rgba(15,23,42,0.12)',
										}}
									/>
									<Typography variant="subtitle2" fontSize={16} fontWeight={500}>
										{item.row.nickName}
									</Typography>
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
				field: 'amount',
				headerName: `Total: ${manualTotalAmount} ${props.currencyName}`,
				sortable: true,
				minWidth: 250,
				valueGetter: (params) => {
					const id = params.row.id;
					return copyMapForManual[id]?.allocateValue || '';
				},
				renderCell: (item) => {
					return (
						<TextField
							value={item.value}
							size="small"
							variant="outlined"
							onChange={(event) => handleInputChange(item.row, event)}
							InputProps={{
								style: { minWidth: '150px' },
								endAdornment: (
									<InputAdornment position="end">
										<Typography variant="body1">
											{props.isETH ? 'ETH' : props.currencyName}
										</Typography>
									</InputAdornment>
								),
							}}
						/>
					);
				},
			},
		];
		return columns;
	}, [
		contributorList,
		props.currencyName,
		props.totalAmount,
		props.isETH,
		copyMapForManual,
		manualTotalAmount,
	]);

	useEffect(() => {
		const list = selectedRowIds.map((id) => copyMapForManual[id]);
		props.onChangeManualInfo(list);
	}, [copyMapForManual, selectedRowIds]);

	const handleInputChange = (
		item: IContributorCopy,
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		console.log('handleInputChange', item, event.target.value);
		const map = {
			...copyMapForManual,
			[item.id]: {
				...copyMapForManual[item.id],
				allocateValue: event.target.value,
			},
		};
		setCopyMapForManual(map);
	};
	const handleRowSelectionModelChange = (
		rowSelectionModel: GridRowSelectionModel,
		details: GridCallbackDetails,
	) => {
		setSelectedRowIds(rowSelectionModel);
	};

	return (
		<Container>
			<Typography variant={'h3'}>Allocation Details</Typography>

			<div style={{ width: '100%' }}>
				<DataGrid
					loading={isLoading}
					rows={contributorList}
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
					checkboxSelection={true}
					disableRowSelectionOnClick={true}
					onRowSelectionModelChange={handleRowSelectionModelChange}
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
