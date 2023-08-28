'use client';
import { Button, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import React, { useState } from 'react';

import Image from 'next/image';

import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

import { IContribution } from '@/services/types';
import Checkbox, { CheckboxTypeEnum } from '@/components/checkbox';
import { StyledFlexBox } from '@/components/styledComponents';

export interface IContributionListProps {
	projectId: string;
}

const FakeContributionList = [
	{
		id: '1',
		detail: 'I walked several new users through how to I walked several new users through. I walked several new users through how to I walked several new users through.I walked several new users new users through.Cc@Michael @Will',
		proof: 'https://github.com',
		credit: 120,
		toIds: ['123', '234'],
		status: 1,
		agree: 2,
		disagree: 1,
		ownerId: '123',
		projectId: '1',
		MintRecord: [],
	},
	{
		id: '2',
		detail: 'I walked several new users through how to I walked several new users through. I walked several new users through how to I walked several new users through.I walked several new users new users through.Cc@Michael @Will',
		proof: 'https://github.com',
		credit: 120,
		toIds: ['123', '234'],
		status: 1,
		agree: 2,
		disagree: 1,
		ownerId: '123',
		projectId: '1',
		MintRecord: [],
	},
];

const ContributionList = (props: IContributionListProps) => {
	const [claimTotal, getClaimTotal] = useState(0);
	const [showFilter, setShowFilter] = useState(true);
	const [showSelect, setShowSelect] = useState(true);

	const [period, setPeriod] = useState('1');
	const [voteStatus, setVoteStatus] = useState('1');
	const [contributor, setContributor] = useState('1');

	const [selected, setSelected] = useState<number[]>([]);
	const [list, setList] = useState<IContribution[]>(FakeContributionList);

	const getClaim = () => {
		// 	TODO: get cliam after login
	};

	const handlePeriodChange = (event: SelectChangeEvent) => {
		setPeriod(event.target.value);
	};
	const handleVoteStatusChange = (event: SelectChangeEvent) => {
		setVoteStatus(event.target.value);
	};
	const handleContributorChange = (event: SelectChangeEvent) => {
		setContributor(event.target.value);
	};

	const onClickFilterBtn = () => {
		setShowFilter((pre) => !pre);
	};

	const onClickSelectBtn = () => {
		setShowSelect((pre) => !pre);
	};

	const onClickSelectParent = (type: Exclude<CheckboxTypeEnum, 'Partial'>) => {
		console.log('type', type);
		if (type === 'All') {
			setSelected(list.map((item, idx) => idx));
		} else {
			setSelected([]);
		}
	};

	return (
		<>
			<StyledFlexBox sx={{ justifyContent: 'space-between' }}>
				<Typography typography={'h3'} sx={{ marginTop: '16px' }}>
					Contributions
				</Typography>
				<StyledFlexBox>
					<Image
						src={'/images/claim.png'}
						width={24}
						height={24}
						alt={'claim'}
						onClick={onClickFilterBtn}
					/>
					<Button variant={'outlined'} sx={{ marginLeft: '16px' }}>
						Claim({claimTotal})
					</Button>
				</StyledFlexBox>
			</StyledFlexBox>
			{showFilter ? (
				<StyledFlexBox sx={{ marginTop: '16px', justifyContent: 'space-between' }}>
					<StyledFlexBox>
						<Select
							id="period-select"
							value={period}
							onChange={handlePeriodChange}
							placeholder={'Period'}
							sx={{ width: '160px' }}
							size={'small'}
						>
							<MenuItem value={'1'}>All time</MenuItem>
							<MenuItem value={'2'}>This week</MenuItem>
							<MenuItem value={'3'}>This month</MenuItem>
							<MenuItem value={'4'}>This season</MenuItem>
							<MenuItem value={'5'}>This year</MenuItem>
						</Select>
						<Select
							id="vote-status"
							value={voteStatus}
							onChange={handleVoteStatusChange}
							placeholder={'Vote Status'}
							sx={{ width: '200px', margin: '0 16px' }}
							size={'small'}
						>
							<MenuItem value={'1'}>All status</MenuItem>
							<MenuItem value={'2'}>Voted by me</MenuItem>
							<MenuItem value={'3'}>Unvoted by me</MenuItem>
							<MenuItem value={'4'}>voted ended</MenuItem>
						</Select>
						<Select
							id="contributor"
							value={contributor}
							onChange={handleContributorChange}
							placeholder={'Contributor'}
							sx={{ width: '200px' }}
							size={'small'}
						>
							<MenuItem value={'1'}>All contributors</MenuItem>
							<MenuItem value={'2'}>Jack</MenuItem>
							<MenuItem value={'3'}>Mike</MenuItem>
							<MenuItem value={'4'}>Zed</MenuItem>
						</Select>
						<Button variant={'text'} sx={{ marginLeft: '16px' }}>
							Reset
						</Button>
					</StyledFlexBox>
					<Button variant={'text'} onClick={onClickSelectBtn}>
						Select
					</Button>
				</StyledFlexBox>
			) : null}

			{showSelect ? (
				<StyledFlexBox sx={{ marginTop: '16px', justifyContent: 'space-between' }}>
					<StyledFlexBox>
						<Checkbox
							total={list.length}
							selected={selected.length}
							onChange={onClickSelectParent}
						/>
						<Typography variant={'body1'}>{selected.length} have selected</Typography>
					</StyledFlexBox>
					<StyledFlexBox>
						<Button
							variant="outlined"
							size={'large'}
							color={'success'}
							sx={{ width: '112px', marginLeft: '12px' }}
							startIcon={<DoneOutlinedIcon />}
						>
							For
						</Button>
						<Button
							variant="outlined"
							size={'large'}
							color={'error'}
							sx={{ width: '112px', marginLeft: '12px' }}
							startIcon={<ClearOutlinedIcon />}
						>
							Again
						</Button>
						<Button
							variant="outlined"
							size={'large'}
							color={'primary'}
							sx={{ width: '112px', marginLeft: '12px' }}
							startIcon={<ArrowForwardOutlinedIcon />}
						>
							Abstain
						</Button>
						<Button
							variant="outlined"
							size={'large'}
							color={'info'}
							sx={{ width: '112px', marginLeft: '12px' }}
						>
							Cancel
						</Button>
					</StyledFlexBox>
				</StyledFlexBox>
			) : null}
		</>
	);
};

export default ContributionList;
