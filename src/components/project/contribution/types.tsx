import React, { useEffect, useMemo, useState } from 'react';
import { StyledFlexBox } from '@/components/styledComponents';
import { Paper, Popover, styled, Typography } from '@mui/material';

export interface IProps {
	types: string[];
}

const Types = ({ types }: IProps) => {

	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const [randomIndex] = useState<number[]>(() => {
		return Array(types.length).fill(true).map(() => Math.floor(Math.random() * 10));
	});

	const showType = useMemo(() => {
		return types.slice(0, 2);
	}, [types]);

	const extra = useMemo(() => {
		return types.length > 2 ? types.length - 2 : 0;
	}, [types]);

	const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
		if (types.length > 2) {
			setAnchorEl(event.currentTarget);
		}
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<StyledFlexBox
			onMouseEnter={handlePopoverOpen}
			onMouseLeave={handlePopoverClose}
		>
			{showType.map((type, idx) => (
				<Item
					key={idx}
					index={randomIndex[idx]}
					isFirst={idx === 0}
				>
					{type}
				</Item>
			))}
			{extra > 0
				?
				<Typography
					variant={'body2'} color={'#475569'}
					sx={{ marginLeft: '8px', fontWeight: 500 }}
				>
					+{extra}
				</Typography>

				: null
			}
			<Popover
				id="mouse-over-popover"
				sx={{
					pointerEvents: 'none',
				}}
				open={open}
				anchorEl={anchorEl}
				onClose={handlePopoverClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				disableRestoreFocus
			>
				<Paper sx={{ padding: '12px' }}>
					{types.map((type, idx) => (
						<Item
							key={idx}
							index={randomIndex[idx]}
							isFirst={idx === 0}
						>
							{type}
						</Item>
					))}
				</Paper>
			</Popover>
		</StyledFlexBox>
	);
};

export default Types;

export const OptionBgColors = [
	'#FEEDEB',
	'#FFF3E0',
	'#E6F7FF',
	'#E1F3E2',
	'#FBF6C7',
	'#F2F4F6',
	'#EDE7F6',
	'#EDF1DA',
	'#E9EBF7',
	'#FCE8F9',
];
export const OptionFontColors = [
	'#491410',
	'#391A00',
	'#002338',
	'#00200D',
	'#4D2100',
	'#181D24',
	'#180038',
	'#182700',
	'#0E184C',
	'#3A071B',
];

const Item = styled('span')<{ index: number, isFirst: boolean }>(({ index, isFirst }) => ({
	borderRadius: 2,
	marginLeft: isFirst ? 0 : 8,
	fontSize: 14,
	padding: '0 6px',
	backgroundColor: OptionBgColors[index],
	color: OptionFontColors[index],
}));
