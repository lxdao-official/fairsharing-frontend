import * as React from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';

import { useCallback } from 'react';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { Typography } from '@mui/material';

import { IContributor } from '@/services/types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

export interface IContributorSelectorProps {
	contributorList: IContributor[];
	onChange: (values: string[]) => void;
}

export default function MultipleContributorSelector(props: IContributorSelectorProps) {
	const { contributorList, onChange } = props;
	const [selectedValue, setSelectedValue] = React.useState<string[]>([]);

	const handleChange = (event: SelectChangeEvent<typeof selectedValue>) => {
		const {
			target: { value },
		} = event;
		setSelectedValue(value as string[]);
		onChange(value as string[]);
	};

	const findName = useCallback(
		(id: string) => {
			const name = contributorList.find((item) => item.id === id)?.nickName;
			return `@${name}`;
		},
		[contributorList],
	);

	return (
		<div>
			<FormControl sx={{ m: 1, width: 300, margin: '0' }}>
				<Select
					labelId="multiple-checkbox-label"
					id="multiple-checkbox"
					multiple
					value={selectedValue}
					onChange={handleChange}
					renderValue={(selected) => (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
							{selected.map((value) => (
								<Typography key={value} color={'#437EF7'}>
									{findName(value)}
								</Typography>
							))}
						</Box>
					)}
					inputProps={{ 'aria-label': 'Without label' }}
					MenuProps={MenuProps}
					size={'small'}
				>
					{contributorList.map((contributor) => (
						<MenuItem key={contributor.id} value={contributor.id}>
							<Checkbox checked={selectedValue.includes(contributor.id)} />
							<ListItemText primary={contributor.nickName} />
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
}
