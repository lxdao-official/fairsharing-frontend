import { Button, styled, Typography } from '@mui/material';
import { hideTokenToolTip, initShowTokenToolTip, useUtilsStore } from '@/store/utils';
import { CloseIcon } from '@/icons';
import React, { useEffect } from 'react';

export interface IProps {
	setShowTokenTip: (show: boolean) => void;
	tokenSymbol: string;
}

const TokenToolTip = ({ setShowTokenTip, tokenSymbol }: IProps) => {
	const { showTokenToolTip } = useUtilsStore();

	useEffect(() => {
		initShowTokenToolTip();
	}, []);

	const hideTipForever = () => {
		console.log('hideTipForever');
		hideTokenToolTip();
	};

	const TokenTips = `$${tokenSymbol} tokens, similar to points, representing project ownership. Earned through approved contributions, there's no limit to their supply.\n`;

	return (
		<ToolTipContainer>
			<Typography variant={'subtitle1'}>What are ${tokenSymbol} tokens?</Typography>
			<Typography variant={'body1'}>{TokenTips}</Typography>
			<ToolTipAction>
				{/*<Button size={'small'} variant={'contained'} onClick={hideTipForever}>Don't show*/}
				{/*	again</Button>*/}
			</ToolTipAction>
			<ToolTipClose onClick={() => setShowTokenTip(false)}>
				<CloseIcon width={16} height={16} />
			</ToolTipClose>
		</ToolTipContainer>
	);
};

export default TokenToolTip;

const ToolTipContainer = styled('div')({
	minWidth: '350px',
	padding: '8px 12px',
	position: 'relative',
});
const ToolTipClose = styled('div')({
	position: 'absolute',
	top: '4px',
	right: '4px',
	width: '24px',
	height: '24px',
	cursor: 'pointer',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
});
const ToolTipAction = styled('div')({
	marginTop: '16px',
	textAlign: 'right',
});
