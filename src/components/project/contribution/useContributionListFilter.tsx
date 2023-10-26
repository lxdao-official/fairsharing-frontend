import { MenuItem, Select, SelectChangeEvent, styled } from '@mui/material';
import React, { useMemo, useState } from 'react';
import {
	addYears,
	endOfMonth,
	endOfQuarter,
	endOfWeek,
	endOfYear,
	startOfQuarter,
	startOfWeek,
	startOfYear,
} from 'date-fns';

import { startOfMonth } from 'date-fns/fp';

import { StyledFlexBox } from '@/components/styledComponents';
import { EasAttestation, IContribution, IContributor, IProject } from '@/services';
import { EasSchemaVoteKey } from '@/constant/eas';

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
	easVoteMap: Record<string, EasAttestation<EasSchemaVoteKey>[]>;
}

const useContributionListFilter = ({
	contributionList,
	contributorList,
	projectDetail,
	easVoteMap,
}: IProps) => {
	const [filterPeriod, setFilterPeriod] = useState(PeriodEnum.All);
	const [filterVoteStatus, setFilterVoteStatus] = useState(VoteStatusEnum.All);
	const [filterContributor, setFilterContributor] = useState('All');

	const [timestamp, settTimestamp] = useState([0, 0]);

	const filterByPeriod = (list: IContribution[]) => {
		if (!projectDetail) return list;
		const [filterStart, filterEnd] = timestamp;
		console.log('timestamp', [new Date(filterStart), new Date(filterEnd)]);
		return list.filter(({ createAt }) => {
			const startTime = new Date(createAt).getTime();
			// const endTime = new Date(createAt).getTime() + Number(projectDetail.votePeriod) * 24 * 60 * 60 * 1000;
			return startTime >= filterStart && startTime <= filterEnd;
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
			console.log('filterVoteStatus in vote', list);
			// TODO 选取投票数据
			const res = list.filter((item) => {
				const { uId } = item;
				console.log('uId', uId);
				console.log('easVoteMap', easVoteMap);
				const easVoteList = easVoteMap[uId!] ?? [];
			});
			if (filterVoteStatus === VoteStatusEnum.VoteByMe) {
				return list;
			} else if (filterVoteStatus === VoteStatusEnum.UnVotedByMe) {
				return list;
			}
			return list;
		}
	};

	const filterContributionList = useMemo(() => {
		const filterTimeList = filterByPeriod(contributionList);
		console.log('filterTimeList', filterTimeList);
		const filterVoteList = filterByVoteStatus(filterTimeList);
		console.log('filterVoteList', filterVoteList);
		if (filterContributor !== 'All') {
			return filterVoteList.filter((contribution) =>
				contribution.toIds.includes(filterContributor),
			);
		} else {
			return filterVoteList;
		}
	}, [
		contributionList,
		contributorList,
		timestamp,
		filterVoteStatus,
		filterContributor,
		projectDetail,
		easVoteMap,
	]);

	const handlePeriodChange = (event: SelectChangeEvent) => {
		const value = event.target.value;
		setFilterPeriod(value as PeriodEnum);
		if (value === PeriodEnum.All) {
			settTimestamp([addYears(new Date(), -5).getTime(), addYears(new Date(), 10).getTime()]);
		} else if (value === PeriodEnum.Year) {
			settTimestamp([startOfYear(new Date()).getTime(), endOfYear(new Date()).getTime()]);
		} else if (value === PeriodEnum.Season) {
			settTimestamp([
				startOfQuarter(new Date()).getTime(),
				endOfQuarter(new Date()).getTime(),
			]);
		} else if (value === PeriodEnum.Month) {
			settTimestamp([startOfMonth(new Date()).getTime(), endOfMonth(new Date()).getTime()]);
		} else if (value === PeriodEnum.Week) {
			settTimestamp([startOfWeek(new Date()).getTime(), endOfWeek(new Date()).getTime()]);
		}
	};
	const handleVoteStatusChange = (event: SelectChangeEvent) => {
		const value = event.target.value;
		console.log('handleVoteStatusChange', value);
		setFilterVoteStatus(value as VoteStatusEnum);
	};
	const handleContributorChange = (event: SelectChangeEvent) => {
		setFilterContributor(event.target.value);
	};

	const handleRest = () => {
		setFilterPeriod(PeriodEnum.All);
		setFilterVoteStatus(VoteStatusEnum.All);
		setFilterContributor('All');
	};
	const renderFilter = (
		<StyledFlexBox>
			<Select
				id="period-select"
				value={filterPeriod}
				onChange={handlePeriodChange}
				placeholder={'Period'}
				sx={{ width: '160px' }}
				size={'small'}
			>
				<MenuItem value={PeriodEnum.All}>All time</MenuItem>
				<MenuItem value={PeriodEnum.Week}>This week</MenuItem>
				<MenuItem value={PeriodEnum.Month}>This month</MenuItem>
				<MenuItem value={PeriodEnum.Season}>This season</MenuItem>
				<MenuItem value={PeriodEnum.Year}>This year</MenuItem>
			</Select>
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
					<MenuItem key={contributor.wallet} value={contributor.userId}>
						{contributor.nickName}
					</MenuItem>
				))}
			</Select>
			<TextButton style={{ marginLeft: '16px' }} onClick={handleRest}>
				Reset
			</TextButton>
		</StyledFlexBox>
	);

	return { filterContributionList, renderFilter };
};

export default useContributionListFilter;

const TextButton = styled('span')({
	cursor: 'pointer',
	fontWeight: '500',
	'&:hover': {
		opacity: '0.5',
	},
});
