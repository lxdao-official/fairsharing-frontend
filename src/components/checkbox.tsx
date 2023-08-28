import { useMemo } from 'react';
import { styled } from '@mui/material';

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

export default function Checkbox(props: ICheckboxProps) {
	const { total, selected, onChange } = props;
	const type = useMemo(() => {
		if (selected === 0) return CheckboxTypeEnum.Empty;
		if (selected === total) return CheckboxTypeEnum.All;
		return CheckboxTypeEnum.Partial;
	}, [total, selected]);

	const handleClick = () => {
		if (type === CheckboxTypeEnum.Empty || type === CheckboxTypeEnum.Partial) {
			onChange(CheckboxTypeEnum.All);
		} else {
			onChange(CheckboxTypeEnum.Empty);
		}
	};

	return (
		<Container onClick={handleClick}>
			<Image src={IconMap[type]} alt={'checkbox'} width={24} height={24} />
		</Container>
	);
}

const Container = styled(StyledFlexBox)({
	width: '42px',
	height: '42px',
	cursor: 'pointer',
	justifyContent: 'center',
});
