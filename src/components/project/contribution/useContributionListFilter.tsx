import { MenuItem, Select, SelectChangeEvent, styled, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import {
	addYears, endOfDay,
	endOfMonth,
	endOfQuarter,
	endOfWeek,
	endOfYear, startOfDay,
	startOfQuarter,
	startOfWeek,
	startOfYear,
} from 'date-fns';

import { startOfMonth } from 'date-fns/fp';

import { useAccount } from 'wagmi';

import { StyledFlexBox } from '@/components/styledComponents';
import { IContribution, IContributor, IProject, Status } from '@/services';
import { IVoteValueEnum } from '@/components/project/contribution/contributionList';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export enum PeriodEnum {
	All = 'All',
	Week = 'Week',
	Month = 'Month',
	Season = 'Season',
	Year = 'Year',
}

export enum VoteStatusEnum {
	All = 'All',
	VoteByMe = 'VoteByMe',
	UnVotedByMe = 'UnVotedByMe',
	VoteEnded = 'VoteEnded',
}

export interface IProps {
	contributionList: IContribution[];
	contributorList: IContributor[];
	projectDetail?: IProject;
	easVoteNumberBySigner: Record<string, Record<string, IVoteValueEnum>>;
	canClaimedMap: Record<string, IContribution>;
}

const useContributionListFilter = ({
	contributionList,
	contributorList,
	projectDetail,
	easVoteNumberBySigner,
	canClaimedMap,
}: IProps) => {
	const { address: myAddress } = useAccount();
	const [filterPeriod, setFilterPeriod] = useState(PeriodEnum.All);
	const [filterVoteStatus, setFilterVoteStatus] = useState(VoteStatusEnum.All);
	const [filterContributor, setFilterContributor] = useState('All');

	const [endDateFrom, setEndDateFrom] = useState<Date>(() => startOfYear(new Date()));
	const [endDateTo, setEndDateTo] = useState<Date>(() => endOfYear(new Date()));
	const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
	const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

	const timestamp = useMemo(() => {
		if (filterPeriod === PeriodEnum.All) {
			return [new Date('2/1/22').getTime(), new Date('2/1/30').getTime()];
		} else if (filterPeriod === PeriodEnum.Year) {
			return [startOfYear(new Date()).getTime(), endOfYear(new Date()).getTime()];
		} else if (filterPeriod === PeriodEnum.Season) {
			return [startOfQuarter(new Date()).getTime(), endOfQuarter(new Date()).getTime()];
		} else if (filterPeriod === PeriodEnum.Month) {
			return [startOfMonth(new Date()).getTime(), endOfMonth(new Date()).getTime()];
		} else if (filterPeriod === PeriodEnum.Week) {
			return [startOfWeek(new Date()).getTime(), endOfWeek(new Date()).getTime()];
		} else {
			return [addYears(new Date(), -5).getTime(), addYears(new Date(), 10).getTime()];
		}
	}, [filterPeriod]);

	const filterByPeriod = (list: IContribution[]) => {
		if (!projectDetail) return list;
		const [filterStart, filterEnd] = timestamp;
		return list.filter(({ endDate, contributionDate }) => {
			const endTime = endDate;
			const oldEndTime = contributionDate ? JSON.parse(contributionDate).endDate : null;
			const end = new Date(endTime || oldEndTime).getTime();
			return end >= filterStart && end <= filterEnd;
		});
	};

	const filterByVoteStatus = (list: IContribution[]) => {
		if (filterVoteStatus === VoteStatusEnum.All) {
			return list;
		} else if (filterVoteStatus === VoteStatusEnum.VoteEnded) {
			if (!projectDetail) return list;
			return list.filter(({ createAt }) => {
				return (
					Date.now() >
					new Date(createAt).getTime() +
						Number(projectDetail.votePeriod) * 24 * 60 * 60 * 1000
				);
			});
		} else {
			const myVoteCidList: string[] = [];
			for (const [cId, value] of Object.entries(easVoteNumberBySigner)) {
				const signers = Object.keys(value);
				if (signers.includes(myAddress!)) {
					myVoteCidList.push(cId);
				}
			}
			if (filterVoteStatus === VoteStatusEnum.VoteByMe) {
				return list.filter((item) => myVoteCidList.includes(item.uId!.toString()));
			} else if (filterVoteStatus === VoteStatusEnum.UnVotedByMe) {
				return list.filter((item) => !myVoteCidList.includes(item.uId!.toString()));
			}
			return list;
		}
	};

	const filterContributionList = useMemo(() => {
		const list = contributionList.filter(
			(contributor) => contributor.status !== Status.UNREADY,
		);
		const filterVoteList = filterByVoteStatus(list);
		if (filterContributor === 'All') {
			return filterVoteList;
		}
		return filterVoteList.filter((contribution) =>
			contribution.toIds.includes(filterContributor),
		);
	}, [
		contributionList,
		contributorList,
		timestamp,
		filterVoteStatus,
		filterContributor,
		projectDetail,
		myAddress,
		easVoteNumberBySigner,
	]);

	const canClaimedContributionList = useMemo(() => {
		return filterContributionList.filter((item) => {
			return item.status === Status.READY && !!canClaimedMap[item.id];
		});
	}, [filterContributionList, canClaimedMap]);

	const handlePeriodChange = (event: SelectChangeEvent) => {
		const value = event.target.value;
		setFilterPeriod(value as PeriodEnum);
	};
	const handleVoteStatusChange = (event: SelectChangeEvent) => {
		const value = event.target.value;
		setFilterVoteStatus(value as VoteStatusEnum);
	};
	const handleContributorChange = (event: SelectChangeEvent) => {
		setFilterContributor(event.target.value);
	};

	const handleRest = () => {
		setFilterPeriod(PeriodEnum.All);
		setFilterVoteStatus(VoteStatusEnum.All);
		setFilterContributor('All');
		setEndDateFrom(startOfYear(new Date()))
		setEndDateTo(endOfYear(new Date()))
	};
	const renderFilter = (
		<StyledFlexBox>
			<DateContainer>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<DatePicker
						format={'MM/dd/yyyy'}
						value={endDateFrom}
						onChange={(date) => setEndDateFrom(date!)}
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
						value={endDateTo}
						onChange={(date) => setEndDateTo(date!)}
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
			{/*<Select*/}
			{/*	id="period-select"*/}
			{/*	value={filterPeriod}*/}
			{/*	onChange={handlePeriodChange}*/}
			{/*	placeholder={'Period'}*/}
			{/*	sx={{ width: '160px' }}*/}
			{/*	size={'small'}*/}
			{/*>*/}
			{/*	<MenuItem value={PeriodEnum.All}>All time</MenuItem>*/}
			{/*	<MenuItem value={PeriodEnum.Week}>This week</MenuItem>*/}
			{/*	<MenuItem value={PeriodEnum.Month}>This month</MenuItem>*/}
			{/*	<MenuItem value={PeriodEnum.Season}>This season</MenuItem>*/}
			{/*	<MenuItem value={PeriodEnum.Year}>This year</MenuItem>*/}
			{/*</Select>*/}
			<Select
				id="vote-status"
				value={filterVoteStatus}
				onChange={handleVoteStatusChange}
				placeholder={'Vote Status'}
				sx={{ width: '200px', margin: '0 16px' }}
				size={'small'}
			>
				<MenuItem value={VoteStatusEnum.All}>All status</MenuItem>
				<MenuItem value={VoteStatusEnum.VoteByMe}>Voted by me</MenuItem>
				<MenuItem value={VoteStatusEnum.UnVotedByMe}>Unvoted by me</MenuItem>
				<MenuItem value={VoteStatusEnum.VoteEnded}>voted ended</MenuItem>
			</Select>
			<Select
				id="contributor"
				value={filterContributor}
				onChange={handleContributorChange}
				placeholder={'Contributor'}
				sx={{ width: '200px' }}
				size={'small'}
			>
				<MenuItem value={'All'}>All contributors</MenuItem>
				{contributorList.map((contributor) => (
					<MenuItem key={contributor.wallet} value={contributor.id}>
						{contributor.nickName}
					</MenuItem>
				))}
			</Select>
			<TextButton style={{ marginLeft: '16px' }} onClick={handleRest}>
				Reset
			</TextButton>
		</StyledFlexBox>
	);

	return { filterContributionList, renderFilter, canClaimedContributionList, endDateFrom, endDateTo };
};

export default useContributionListFilter;

const TextButton = styled('span')({
	cursor: 'pointer',
	fontWeight: '500',
	'&:hover': {
		opacity: '0.5',
	},
});

const DateContainer = styled(StyledFlexBox)(({ theme }) => ({
	width: '300px',
	border: '1px solid rgba(15, 23, 42, 0.2)',
	borderRadius: '4px',
	height: '40px',
	'&:hover': {
		borderColor: 'rgba(15, 23, 42, 0.5)',
	},
}));
