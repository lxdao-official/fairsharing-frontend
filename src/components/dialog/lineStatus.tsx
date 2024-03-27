import { CircularProgress, styled, Typography } from '@mui/material';
import React from 'react';

import { ForIcon } from '@/icons';
import { StyledFlexBox } from '@/components/styledComponents';

export interface IProps {
	isLoading: boolean;
	isDone: boolean;
	text: string;
}

const LineStatus = ({ isLoading, isDone, text }: IProps) => {
	return (
		<StyledFlexBox sx={{ height: '40px', margin: '0 20px' }}>
			{isLoading ? (
				<CircularProgress sx={{ color: '#0F172A' }} size={20} />
			) : isDone ? (
				<ForIcon />
			) : (
				<DefaultDot />
			)}
			<Typography variant={isLoading ? 'subtitle1' : 'body1'} sx={{ marginLeft: '16px' }}>
				{text}
			</Typography>
		</StyledFlexBox>
	);
};

export default LineStatus;

const DefaultDot = styled('div')({
	width: '20px',
	height: '20px',
	borderRadius: '20px',
	border: '2px solid #94A3B8',
});
