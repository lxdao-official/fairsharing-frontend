import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
	Box,
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	styled,
	TextField,
	Typography,
} from '@mui/material';

import { IStepBaseProps } from '@/components/createProject/step/start';
import { StyledFlexBox } from '@/components/styledComponents';
import { showToast } from '@/store/utils';

export interface IStepStrategyProps extends IStepBaseProps {}

export interface StepStrategyRef {
	getFormData: () => {
		symbol: string;
		token: string;
		network: number;
		period: string;
	};
}

const StepStrategy = forwardRef<StepStrategyRef, IStepStrategyProps>((props, ref) => {
	const { step, setActiveStep } = props;
	const [symbol, setSymbol] = useState('Token Symbol');
	const [token, setToken] = useState('1200');
	const [network, setNetwork] = useState(420);
	const [period, setPeriod] = useState('365');

	const [symbolError, setSymbolError] = useState(false);
	const [tokenError, setTokenError] = useState(false);
	const [periodError, setPeriodError] = useState(false);

	const handleSymbolInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSymbol(event.target.value);
		setSymbolError(false);
	};

	const handleTokenInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setToken(event.target.value);
		setTokenError(false);
	};

	const handleNetworkChange = (event: SelectChangeEvent) => {
		setNetwork(Number(event.target.value));
	};

	const handlePeriodInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPeriod(event.target.value);
		setPeriodError(false);
	};

	useImperativeHandle(
		ref,
		() => ({
			getFormData: () => ({ token, network, period, symbol }),
		}),
		[token, network, period, symbol],
	);

	const handleSubmit = (action: 'BACK' | 'NEXT') => {
		if (!token) {
			setTokenError(true);
			return;
		}
		if (!Number(token)) {
			setTokenError(true);
			showToast('Token must be number', 'error');
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
		setActiveStep(action === 'BACK' ? step - 1 : step + 1);
	};

	return (
		<>
			<TextField
				required
				label="Symbol"
				value={symbol}
				placeholder={'Token Symbol *'}
				onChange={handleSymbolInputChange}
				sx={{ display: 'block', minWidth: '' }}
				error={symbolError}
			/>

			<TextField
				required
				label="Token"
				value={token}
				placeholder={'Pizza slice token *'}
				onChange={handleTokenInputChange}
				sx={{ display: 'block', minWidth: '', marginTop: '32px' }}
				error={tokenError}
			/>

			{/*<InputLabel id="network-select-label">Network</InputLabel>*/}
			<Select
				labelId="network-select-label"
				id="network-select"
				value={network.toString()}
				label="Network"
				onChange={handleNetworkChange}
				placeholder={'Select network'}
				sx={{ width: '320px', marginTop: '32px' }}
			>
				<MenuItem value={'5'}>MainNet</MenuItem>
				<MenuItem value={'420'}>optimismGoerli</MenuItem>
				<MenuItem value={'1'}>Georily</MenuItem>
			</Select>

			<div style={{ display: 'flex', alignItems: 'center', marginTop: '32px' }}>
				<TextField
					required
					label="period"
					value={period}
					placeholder={'Voting period *'}
					onChange={handlePeriodInputChange}
					error={periodError}
				/>
				<span style={{ marginLeft: '12px' }}>days</span>
			</div>

			<Box
				sx={{
					marginTop: '32px',
					backgroundColor: '#F1F5F9',
					padding: '24px',
					minWidth: '500px',
				}}
			>
				<StyledFlexBox>
					<Typography variant={'h5'}>Voting system:</Typography>
					<Typography variant={'body1'} sx={{ marginLeft: '12px' }}>
						One person, one vote
					</Typography>
				</StyledFlexBox>
				<StyledFlexBox sx={{ marginTop: '12px' }}>
					<Typography variant={'h5'}>Voting approved:</Typography>
					<Typography variant={'body1'} sx={{ marginLeft: '12px' }}>
						Number of for {'>'} number of against
					</Typography>
				</StyledFlexBox>
			</Box>

			<StyledFlexBox sx={{ marginTop: '40px' }}>
				<Button
					variant={'outlined'}
					sx={{ backgroundColor: 'transparent' }}
					onClick={() => handleSubmit('BACK')}
				>
					Back
				</Button>
				<Button
					variant={'contained'}
					sx={{ marginLeft: '16px' }}
					onClick={() => handleSubmit('NEXT')}
				>
					Next
				</Button>
			</StyledFlexBox>
		</>
	);
});
StepStrategy.displayName = 'StepStrategy';

export default StepStrategy;
