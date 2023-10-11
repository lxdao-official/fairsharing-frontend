import { styled, Typography } from '@mui/material';

import { useMemo } from 'react';
import Image from 'next/image';

import { StyledFlexBox } from '@/components/styledComponents';
import { Status } from '@/services/types';
import useCountdown from '@/hooks/useCountdown';

export interface IPizzaProps {
	credit: number;
	status: Status;
	votePass: boolean;
	targetTime: number;
}

const pizzaReady = '/images/pizza1.png';
const pizzaUnReady = '/images/pizza2.png';

const TextColor = {
	gray: '#475569',
	orange: '#ED6C02',
	green: '#12C29C',
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
	const { credit, status, targetTime, votePass } = props;

	const { isEnd } = useCountdown(targetTime);

	const canClaim = useMemo(() => {
		if (status === Status.READY && isEnd && votePass) {
			return true;
		} else {
			return false;
		}
	}, [status, isEnd, votePass]);

	const pizzaIcon = useMemo(() => {
		return canClaim ? pizzaReady : pizzaUnReady;
	}, [canClaim]);

	const textColor = useMemo(() => {
		if (status === Status.CLAIM) {
			return TextColor.green;
		} else if (status === Status.UNREADY) {
			return TextColor.gray;
		} else {
			if (canClaim) {
				return TextColor.orange;
			} else {
				return TextColor.gray;
			}
		}
	}, [status, canClaim]);

	return (
		<BorderOutline sx={{ background: BackgroundColor[status], border: Border[status] }}>
			<Image src={pizzaIcon} width={24} height={24} alt={''} style={{ marginRight: '4px' }} />
			<Typography variant={'body2'} style={{ color: textColor, fontWeight: '500' }}>
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
