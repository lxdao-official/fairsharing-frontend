import React, { useMemo, useState } from 'react';

import { Paper, Popover, styled, Typography } from '@mui/material';

import { StyledFlexBox } from '@/components/styledComponents';
import { ContributionType } from '@/services';
import { TagBgColors, TagColorMap, TagTextColors } from '@/components/project/contribution/tag';

export interface IProps {
	types: string[];
	contributionTypeList: ContributionType[];
}

const DefaultBgColor = '#f5f6f6';
const DefaultTextColor = '#ccc';

const Types = ({ types, contributionTypeList }: IProps) => {
	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const [randomIndex] = useState<number[]>(() => {
		return Array(types.length)
			.fill(true)
			.map(() => Math.floor(Math.random() * 10));
	});

	const showType = useMemo(() => {
		return types.slice(0, 2);
	}, [types]);

	const extra = useMemo(() => {
		return types.length > 2 ? types.length - 2 : 0;
	}, [types]);

	const typeMap = useMemo(() => {
		return contributionTypeList.reduce(
			(acc, cur, idx) => {
				const isValidColor = TagBgColors.includes(cur.color);
				return {
					...acc,
					[cur.name]: {
						...cur,
						color: isValidColor ? cur.color : TagBgColors[idx % 10],
						textColor: isValidColor ? TagColorMap[cur.color] : TagTextColors[idx % 10],
					},
				};
			},
			{} as Record<string, ContributionType & { textColor: string }>,
		);
	}, [contributionTypeList]);

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
		<StyledFlexBox onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
			{showType.map((type, idx) => (
				<Item
					key={idx}
					index={idx}
					isFirst={idx === 0}
					bgColor={typeMap[type]?.color || DefaultBgColor}
					textColor={typeMap[type]?.textColor || DefaultTextColor}
				>
					{type}
				</Item>
			))}
			{extra > 0 ? (
				<Typography
					variant={'body2'}
					color={'#475569'}
					sx={{ marginLeft: '8px', fontWeight: 500 }}
				>
					+{extra}
				</Typography>
			) : null}
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
							index={idx}
							isFirst={idx === 0}
							bgColor={typeMap[type]?.color || DefaultBgColor}
							textColor={typeMap[type]?.textColor || DefaultTextColor}
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

const Item = styled('span')<{
	index: number;
	isFirst: boolean;
	bgColor: string;
	textColor: string;
}>(({ index, isFirst, bgColor, textColor }) => ({
	borderRadius: 2,
	marginLeft: isFirst ? 0 : 8,
	fontSize: 14,
	padding: '0 6px',
	backgroundColor: bgColor,
	color: textColor,
	whiteSpace: 'nowrap',
}));
