import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import {
	Box,
	Button,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField,
	Typography,
} from '@mui/material';

import { IStepBaseProps } from '@/components/createProject/step/start';
import { StyledFlexBox } from '@/components/styledComponents';
import { showToast } from '@/store/utils';
import { CreateProjectParams } from '@/services';
import ButtonGroup from '@/components/createProject/step/buttonGroup';

export interface IStepStrategyProps extends Partial<IStepBaseProps> {
	data?: Pick<CreateProjectParams, 'network' | 'votePeriod' | 'symbol'>;
	onSave?: () => void;
	canEdit?: boolean;
}

export interface StepStrategyRef {
	getFormData: () => {
		symbol: string;
		network: number;
		period: string;
	};
}

const StepStrategy = forwardRef<StepStrategyRef, IStepStrategyProps>((props, ref) => {
	const { step, setActiveStep, canEdit = true, onSave, data } = props;
	const [symbol, setSymbol] = useState(data?.symbol ?? '');
	const [network, setNetwork] = useState(data?.network ?? 420);
	const [period, setPeriod] = useState(data?.votePeriod ?? '');

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
			getFormData: () => ({ network, period, symbol }),
		}),
		[network, period, symbol],
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
				sx={{ display: 'block', minWidth: '' }}
				error={symbolError}
				disabled={isSettingPage}
			/>

			<Select
				labelId="network-select-label"
				id="network-select"
				value={network.toString()}
				label="Network"
				onChange={handleNetworkChange}
				placeholder={'Select network'}
				sx={{ width: '320px', marginTop: '32px' }}
				disabled={isSettingPage}
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
					disabled={!canEdit}
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
