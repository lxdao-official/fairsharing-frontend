import { useCallback, useMemo } from 'react';
import { Checkbox, FormControlLabel, styled } from '@mui/material';

import Image from 'next/image';

import { StyledFlexBox } from '@/components/styledComponents';

export enum CheckboxTypeEnum {
	All = 'All',
	Partial = 'Partial',
	Empty = 'Empty',
}

export interface ICheckboxProps {
	total: number;
	selected: number;
	onChange: (change: Exclude<CheckboxTypeEnum, 'Partial'>) => void;
}

const IconMap: Record<CheckboxTypeEnum, string> = {
	[CheckboxTypeEnum.All]: '/images/checkbox_all.png',
	[CheckboxTypeEnum.Partial]: '/images/checkbox_partial.png',
	[CheckboxTypeEnum.Empty]: '/images/checkbox_empty.png',
};

export default function CustomCheckbox(props: ICheckboxProps) {
	const { total, selected, onChange } = props;
	const type = useMemo(() => {
		if (selected === 0) return CheckboxTypeEnum.Empty;
		if (selected === total) return CheckboxTypeEnum.All;
		return CheckboxTypeEnum.Partial;
	}, [total, selected]);

	const handleClick = useCallback(() => {
		if (type === CheckboxTypeEnum.Empty || type === CheckboxTypeEnum.Partial) {
			onChange(CheckboxTypeEnum.All);
		} else {
			onChange(CheckboxTypeEnum.Empty);
		}
	}, [type]);

	return (
		<FormControlLabel
			label="Parent"
			control={
				<Checkbox
					checked={selected === total}
					indeterminate={selected > 0 && selected < total}
					onChange={handleClick}
				/>
			}
		/>
	);
}

const Container = styled(StyledFlexBox)({
	width: '42px',
	height: '42px',
	cursor: 'pointer',
	justifyContent: 'center',
});
