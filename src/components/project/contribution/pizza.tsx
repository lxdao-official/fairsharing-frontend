import { Status } from '@/services/types';
import { styled, Typography } from '@mui/material';
import { StyledFlexBox } from '@/components/styledComponents';
import { useMemo } from 'react';
import Image from 'next/image';

export interface IPizzaProps {
	credit: number;
	status: Status;
}

const pizzaReady = '/images/pizza1.png';
const pizzaUnReady = '/images/pizza2.png';

const TextColor = {
	[Status.UNREADY]: '#475569',
	[Status.READY]: '#475569',
	[Status.CLAIM]: '#12C29C',
};
const BackgroundColor = {
	[Status.UNREADY]: '#fff',
	[Status.READY]: '#fff',
	[Status.CLAIM]: 'rgba(29, 233, 182, 0.1)',
};

const Border = {
	[Status.UNREADY]: '0.5px solid rgba(15, 23, 42, 0.16)',
	[Status.READY]: '0.5px solid rgba(15, 23, 42, 0.16)',
	[Status.CLAIM]: '0.5px solid rgba(29, 233, 182, 1)',
};

const Pizza = (props: IPizzaProps) => {
	const { credit, status } = props;

	const pizzaIcon = useMemo(() => {
		return status === Status.UNREADY ? pizzaUnReady : pizzaReady;
	}, [status]);

	return (
		<BorderOutline sx={{ background: BackgroundColor[status], border: Border[status] }}>
			<Image src={pizzaIcon} width={24} height={24} alt={''} style={{ marginRight: '4px' }} />
			<Typography variant={'body2'} style={{ color: TextColor[status], fontWeight: 'bold' }}>
				{credit}
			</Typography>
		</BorderOutline>
	);
};

export default Pizza;

export const BorderOutline = styled(StyledFlexBox)({
	borderRadius: 4,
	height: 28,
	padding: '0 8px',
	border: '0.5px solid rgba(15, 23, 42, 0.16)',
});
