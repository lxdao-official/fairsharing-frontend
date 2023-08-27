'use client';
import { Button, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import React, { useState } from 'react';
import { StyledFlexBox } from '@/components/styledComponents';
import Image from 'next/image';

export interface IContributionListProps {
	projectId: string;
}

const ContributionList = (props: IContributionListProps) => {
	const [claimTotal, getClaimTotal] = useState(0);
	const [showFilter, setShowFilter] = useState(true);

	const [period, setPeriod] = useState('1')
	const [voteStatus, setVoteStatus] = useState('1')
	const [contributor, setContributor] = useState('1')
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
		setShowFilter(pre => !pre);
	};

	return (
		<>
			<StyledFlexBox sx={{ justifyContent: 'space-between' }}>
				<Typography typography={'h3'} sx={{ marginTop: '16px' }}>
					Contributions
				</Typography>
				<StyledFlexBox>
					<Image src={'/images/claim.png'} width={24} height={24} alt={'claim'} onClick={onClickFilterBtn} />
					<Button variant={'outlined'} sx={{ marginLeft: '16px' }}>Claim({claimTotal})</Button>
				</StyledFlexBox>
			</StyledFlexBox>
			{showFilter ? <StyledFlexBox sx={{marginTop: '16px'}}>
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
				<Button variant={'text'}>Reset</Button>
				<Button variant={'text'}>Select</Button>
			</StyledFlexBox>: null}

		</>
	);
};

export default ContributionList;
