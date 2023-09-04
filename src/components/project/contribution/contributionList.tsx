'use client';

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	MenuItem,
	Select,
	SelectChangeEvent,
	Typography,
} from '@mui/material';
import React, { useState } from 'react';

import Image from 'next/image';

import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

import { IContribution, IContributor } from '@/services/types';
import Checkbox, { CheckboxTypeEnum } from '@/components/checkbox';
import { StyledFlexBox } from '@/components/styledComponents';
import ContributionItem from '@/components/project/contribution/contributionItem';

export interface IContributionListProps {
	projectId: string;
}

const FakeContributionList: IContribution[] = [
	{
		id: '1',
		detail: 'I walked several new users through how to I walked several new users through. I walked several new users through how to I walked several new users through.I walked several new users new users through.Cc@Michael @Will',
		proof: 'https://github.com',
		credit: 120,
		toIds: ['123', '234'],
		status: 0,
		ownerId: '123',
		projectId: '1',
		deleted: false,
		project: {
			id: '',
			name: '',
			intro: '',
			logo: 'https://nftstorage.link/ipfs/bafkreia6koxbcthmyrqqwy2jhmfuj4vaxgkcmdvxf3v5z7k2xtxaf2eauu',
			network: 5,
			votePeriod: '',
			symbol: '',
			pointConsensus: '',
			contributions: [],
			contributors: [],
		},
		owner: {
			id: '',
			name: '',
			bio: '',
			avatar: '',
			wallet: '',
		},
	},
	{
		id: '2',
		detail: 'I walked several new users through how to I walked several new users through. I walked several new users through how to I walked several new users through.I walked several new users new users through.Cc@Michael @Will',
		proof: 'https://github.com',
		credit: 120,
		toIds: ['123', '234'],
		status: 1,
		ownerId: '123',
		projectId: '1',
		deleted: false,
		project: {
			id: '',
			name: '',
			intro: '',
			logo: 'https://nftstorage.link/ipfs/bafkreia6koxbcthmyrqqwy2jhmfuj4vaxgkcmdvxf3v5z7k2xtxaf2eauu',
			network: 5,
			votePeriod: '',
			symbol: '',
			pointConsensus: '',
			contributions: [],
			contributors: [],
		},
		owner: {
			id: '',
			name: '',
			bio: '',
			avatar: '',
			wallet: '',
		},
	},
	{
		id: '3',
		detail: 'I walked several new users through how to I walked several new users through. I walked several new users through how to I walked several new users through.I walked several new users new users through.Cc@Michael @Will',
		proof: 'https://github.com',
		credit: 120,
		toIds: ['123', '234'],
		status: 2,
		ownerId: '123',
		projectId: '1',
		deleted: false,
		project: {
			id: '',
			name: '',
			intro: '',
			logo: 'https://nftstorage.link/ipfs/bafkreia6koxbcthmyrqqwy2jhmfuj4vaxgkcmdvxf3v5z7k2xtxaf2eauu',
			network: 5,
			votePeriod: '',
			symbol: '',
			pointConsensus: '',
			contributions: [],
			contributors: [],
		},
		owner: {
			id: '',
			name: '',
			bio: '',
			avatar: '',
			wallet: '',
		},
	},
];

const ContributionList = (props: IContributionListProps) => {
	const [claimTotal, getClaimTotal] = useState(0);
	const [showFilter, setShowFilter] = useState(true);
	const [showSelect, setShowSelect] = useState(true);

	const [period, setPeriod] = useState('1');
	const [voteStatus, setVoteStatus] = useState('1');
	const [contributor, setContributor] = useState('1');

	const [selected, setSelected] = useState<Array<string>>([]);
	const [list, setList] = useState<IContribution[]>(() => FakeContributionList);

	const [showDialog, setShowDialog] = useState(false);

	const getClaim = () => {
		// 	TODO: get cliam after login
	};

	const handleHideSelect = () => {
		setShowSelect(false);
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
		if (showFilter) {
			setShowSelect(false);
		}
		setShowFilter((pre) => !pre);
	};

	const onClickSelectBtn = () => {
		setShowSelect((pre) => !pre);
	};

	const onClickSelectParent = (type: Exclude<CheckboxTypeEnum, 'Partial'>) => {
		console.log('type', type);
		if (type === 'All') {
			setSelected(list.map((item, idx) => String(item.id)));
		} else {
			setSelected([]);
		}
	};

	const onSelect = (idList: string[]) => {
		setSelected(idList);
	};

	const onCloseDialog = () => {
		setShowDialog(false);
	};
	const showDeleteDialog = () => {
		setShowDialog(true);
	};

	return (
		<>
			<StyledFlexBox sx={{ justifyContent: 'space-between' }}>
				<Typography typography={'h3'} sx={{ marginTop: '16px' }}>
					Contributions
				</Typography>
				<StyledFlexBox sx={{ cursor: 'pointer' }}>
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
				<StyledFlexBox
					sx={{
						marginTop: '16px',
						marginBottom: '16px',
						justifyContent: 'space-between',
					}}
				>
					<StyledFlexBox>
						{/* TODO use native checkbox */}
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
							onClick={handleHideSelect}
						>
							Cancel
						</Button>
					</StyledFlexBox>
				</StyledFlexBox>
			) : null}

			{list.map((contribution, idx) => (
				<ContributionItem
					key={contribution.id}
					contribution={contribution}
					showSelect={showSelect}
					selected={selected}
					onSelect={onSelect}
					showDeleteDialog={showDeleteDialog}
				/>
			))}

			{/*TODO 确认是revok还是delete*/}
			<Dialog
				open={showDialog}
				onClose={onCloseDialog}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				{/*<DialogTitle id="alert-dialog-title">*/}
				{/*	{"Use Google's location service?"}*/}
				{/*</DialogTitle>*/}
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Are you sure to delete this contribution?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={onCloseDialog}>Cancel</Button>
					<Button onClick={onCloseDialog} autoFocus>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default ContributionList;
