import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
	Box,
	FormControl,
	FormControlLabel,
	FormLabel,
	InputAdornment,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	SelectChangeEvent,
	TextField,
	Typography,
} from '@mui/material';

import { IStepBaseProps } from '@/components/createProject/step/start';
import { StyledFlexBox } from '@/components/styledComponents';
import { showToast } from '@/store/utils';
import { CreateProjectParams, VoteApproveEnum, VoteSystemEnum } from '@/services';
import ButtonGroup from '@/components/createProject/step/buttonGroup';

export interface IStepStrategyProps extends Partial<IStepBaseProps> {
	data?: Pick<
		CreateProjectParams,
		'network' | 'votePeriod' | 'symbol' | 'voteSystem' | 'voteApprove' | 'voteThreshold'
	>;
	onSave?: () => void;
	canEdit?: boolean;
}

export interface StepStrategyFormData {
	symbol: string;
	network: number;
	period: string;
	voteSystem: VoteSystemEnum;
	voteApproveType: VoteApproveEnum;
	forWeightOfTotal: string;
	differWeightOfTotal: string;
}

export interface StepStrategyRef {
	getFormData: () => StepStrategyFormData;
}

const StepStrategy = forwardRef<StepStrategyRef, IStepStrategyProps>((props, ref) => {
	const { step, setActiveStep, canEdit = true, onSave, data } = props;
	const [symbol, setSymbol] = useState(data?.symbol ?? '');
	const [network, setNetwork] = useState(data?.network ?? 420);
	const [period, setPeriod] = useState(data?.votePeriod ?? '');

	const [voteSystem, setVoteSystem] = useState<VoteSystemEnum>(
		data?.voteSystem ?? VoteSystemEnum.EQUAL,
	);
	const [voteApproveType, setVoteApproveType] = useState<VoteApproveEnum>(
		data?.voteApprove ?? VoteApproveEnum.DEFAULT,
	);
	const [forWeightOfTotal, setForWeightOfTotal] = useState(
		data?.voteThreshold ? String(data?.voteThreshold * 100) : '',
	);
	const [differWeightOfTotal, setDifferWeightOfTotal] = useState(
		data?.voteThreshold ? String(data?.voteThreshold * 100) : '',
	);

	const handleVoteSystemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = (event.target as HTMLInputElement).value;
		setVoteSystem(value as VoteSystemEnum);
		setIsEdited(true);
	};
	const handleVoteApproveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = (event.target as HTMLInputElement).value;
		setVoteApproveType(value as VoteApproveEnum);
		setIsEdited(true);
	};

	const handleForWeightInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setForWeightOfTotal(event.target.value);
	};
	const handleDifferWeightInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDifferWeightOfTotal(event.target.value);
	};

	const [symbolError, setSymbolError] = useState(false);
	const [periodError, setPeriodError] = useState(false);
	const [isEdited, setIsEdited] = useState(false);

	const isSettingPage = !!data;

	const handleSymbolInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSymbol(event.target.value);
		setSymbolError(false);
	};

	const handleNetworkChange = (event: SelectChangeEvent) => {
		setNetwork(Number(event.target.value));
	};

	const handlePeriodInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsEdited(true);
		setPeriod(event.target.value);
		setPeriodError(false);
	};

	useImperativeHandle(
		ref,
		() => ({
			getFormData: () => ({
				network,
				period,
				symbol,
				voteSystem,
				voteApproveType,
				forWeightOfTotal,
				differWeightOfTotal,
			}),
		}),
		[
			network,
			period,
			symbol,
			voteSystem,
			voteApproveType,
			forWeightOfTotal,
			differWeightOfTotal,
		],
	);

	const handleSubmit = (action: 'BACK' | 'NEXT') => {
		if (action === 'BACK') {
			setActiveStep!(step! - 1);
			return;
		}
		if (!symbol) {
			setSymbolError(true);
			return;
		}
		if (!period) {
			setPeriodError(true);
			return;
		}
		if (!Number(period)) {
			setPeriodError(true);
			showToast('Vote period must be number', 'error');
			return;
		}
		setActiveStep!(step! + 1);
	};

	const handleClick = (type: 'primary' | 'secondary') => {
		if (!isSettingPage) {
			handleSubmit(type === 'primary' ? 'NEXT' : 'BACK');
			return;
		}
		if (type === 'primary') {
			if (!Number(period)) {
				setPeriodError(true);
				showToast('Vote period must be number', 'error');
				return;
			}
			onSave!();
			setIsEdited(false);
		} else {
			setIsEdited(false);
			setPeriod(data?.votePeriod ?? '');
		}
	};

	return (
		<>
			<TextField
				required
				label="Symbol"
				value={symbol}
				placeholder={'Token Symbol *'}
				onChange={handleSymbolInputChange}
				sx={{ display: 'block', minWidth: '', width: '200px' }}
				error={symbolError}
				disabled={isSettingPage}
			/>

			<Select
				labelId="network-select-label"
				id="network-select"
				value={network.toString()}
				onChange={handleNetworkChange}
				placeholder={'Select network'}
				sx={{ minWidth: '', marginTop: '32px', width: '200px' }}
				disabled={isSettingPage}
			>
				<MenuItem value={'10'}>Optimism</MenuItem>
				<MenuItem value={'420'}>Optimism Goerli</MenuItem>
			</Select>

			<div style={{ display: 'flex', alignItems: 'center', marginTop: '32px' }}>
				<TextField
					required
					label="period"
					value={period}
					placeholder={'Voting period *'}
					onChange={handlePeriodInputChange}
					error={periodError}
					disabled={!canEdit}
					sx={{ display: 'block', minWidth: '', width: '200px' }}
				/>
				<span style={{ marginLeft: '12px' }}>days</span>
			</div>

			<Typography variant={'subtitle1'} sx={{ marginTop: '32px' }}>
				Voting system:{' '}
			</Typography>
			<FormControl>
				{/*<FormLabel id="demo-controlled-radio-buttons-group">Gender</FormLabel>*/}
				<RadioGroup
					aria-labelledby="demo-controlled-radio-buttons-group"
					name="controlled-radio-buttons-group"
					value={voteSystem}
					onChange={handleVoteSystemChange}
				>
					<FormControlLabel
						value={VoteSystemEnum.EQUAL}
						control={<Radio />}
						sx={{ marginTop: '12px' }}
						label={
							<>
								<Typography variant={'subtitle2'}>One person, one vote</Typography>
								<Typography variant={'body2'} color={'#64748B'}>
									All contributors in this project can vote, and each vote is
									equal.
								</Typography>
							</>
						}
					/>
					<FormControlLabel
						value={VoteSystemEnum.WEIGHT}
						control={<Radio />}
						sx={{ marginTop: '20px' }}
						label={
							<>
								<Typography variant={'subtitle2'}>Weighted voting</Typography>
								<Typography variant={'body2'} color={'#64748B'}>
									Votes are weighted by admin settings, configured in the next
									step.
								</Typography>
							</>
						}
					/>
				</RadioGroup>
			</FormControl>

			<Typography variant={'subtitle1'} sx={{ marginTop: '32px' }}>
				Voting approved:{' '}
			</Typography>

			<FormControl>
				<RadioGroup
					aria-labelledby="demo-controlled-radio-buttons-group"
					name="controlled-radio-buttons-group"
					value={voteApproveType}
					onChange={handleVoteApproveChange}
				>
					<FormControlLabel
						value={VoteApproveEnum.RELATIVE2}
						sx={{ marginTop: '12px' }}
						control={<Radio />}
						label={
							<>
								<Typography variant={'subtitle2'}>
									Number of for {'>'} number of against
								</Typography>
								<Typography variant={'body2'} color={'#64748B'}>
									The majority wins the vote, regardless of the total votes.
								</Typography>
							</>
						}
					/>
					<FormControlLabel
						value={VoteApproveEnum.DEFAULT}
						sx={{ marginTop: '12px' }}
						control={<Radio />}
						label={
							<>
								<Typography variant={'subtitle2'}>
									Number of for ≥ number of against（Requirement: for ≥ 1)
								</Typography>
								<Typography variant={'body2'} color={'#64748B'}>
									No votes, or equally split between for and against.
								</Typography>
							</>
						}
					/>
					{/*<FormControlLabel*/}
					{/*	value={VoteApproveEnum.ABSOLUTE1}*/}
					{/*	sx={{ marginTop: '20px' }}*/}
					{/*	control={<Radio />}*/}
					{/*	label={*/}
					{/*		<>*/}
					{/*			<StyledFlexBox>*/}
					{/*				<Typography variant={'subtitle2'}>*/}
					{/*					Number of for / total votes * 100% ≥{' '}*/}
					{/*				</Typography>*/}
					{/*				<TextField*/}
					{/*					sx={{ marginLeft: '12px', width: '60px' }}*/}
					{/*					variant={'standard'}*/}
					{/*					required*/}
					{/*					onChange={handleForWeightInputChange}*/}
					{/*					value={forWeightOfTotal}*/}
					{/*					size={'small'}*/}
					{/*					placeholder={'50.00'}*/}
					{/*					InputProps={{*/}
					{/*						disableUnderline: true,*/}
					{/*						endAdornment: (*/}
					{/*							<InputAdornment position="end">*/}
					{/*								<Typography variant="body1">%</Typography>*/}
					{/*							</InputAdornment>*/}
					{/*						),*/}
					{/*					}}*/}
					{/*				/>*/}
					{/*			</StyledFlexBox>*/}
					{/*			<Typography variant={'body2'} color={'#64748B'}>*/}
					{/*				The ratio of "for" votes to the total votes satisfies a*/}
					{/*				specified threshold.*/}
					{/*			</Typography>*/}
					{/*		</>*/}
					{/*	}*/}
					{/*/>*/}
					{/*<FormControlLabel*/}
					{/*	value={VoteApproveEnum.ABSOLUTE2}*/}
					{/*	sx={{ marginTop: '20px' }}*/}
					{/*	control={<Radio />}*/}
					{/*	label={*/}
					{/*		<>*/}
					{/*			<StyledFlexBox>*/}
					{/*				<Typography variant={'subtitle2'}>*/}
					{/*					(Number of for - number of against) / total votes * 100% ≥{' '}*/}
					{/*				</Typography>*/}

					{/*				<TextField*/}
					{/*					sx={{ marginLeft: '12px', width: '60px' }}*/}
					{/*					variant={'standard'}*/}
					{/*					required*/}
					{/*					onChange={handleDifferWeightInputChange}*/}
					{/*					value={differWeightOfTotal}*/}
					{/*					size={'small'}*/}
					{/*					placeholder={'50.00'}*/}
					{/*					InputProps={{*/}
					{/*						disableUnderline: true,*/}
					{/*						endAdornment: (*/}
					{/*							<InputAdornment position="end">*/}
					{/*								<Typography variant="body1">%</Typography>*/}
					{/*							</InputAdornment>*/}
					{/*						),*/}
					{/*					}}*/}
					{/*				/>*/}
					{/*			</StyledFlexBox>*/}
					{/*			<Typography variant={'body2'} color={'#64748B'}>*/}
					{/*				The ratio of "for-against" votes to the total votes satisfies a*/}
					{/*				specified threshold.*/}
					{/*			</Typography>*/}
					{/*		</>*/}
					{/*	}*/}
					{/*/>*/}
				</RadioGroup>
			</FormControl>

			<ButtonGroup
				canEdit={canEdit}
				isEdited={isEdited}
				isSettingPage={isSettingPage}
				handlePrimary={() => handleClick('primary')}
				handleSecondary={() => handleClick('secondary')}
			/>
		</>
	);
});
StepStrategy.displayName = 'StepStrategy';

export default StepStrategy;
