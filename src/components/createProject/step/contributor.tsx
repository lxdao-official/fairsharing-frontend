import { forwardRef, useImperativeHandle, useState } from 'react';

import { IStepBaseProps } from '@/components/createProject/step/start';

export interface IStepContributorProps extends IStepBaseProps {}

export interface FromContributor {}

export interface StepContributorRef {
	getFormData: () => {
		contributors: FromContributor[];
	};
}

const StepContributor = forwardRef<StepContributorRef, IStepContributorProps>((props, ref) => {
	const [contributors, setContributors] = useState([]);

	useImperativeHandle(
		ref,
		() => ({
			getFormData: () => ({ contributors }),
		}),
		[contributors],
	);

	return <>StepContributor</>;
});

StepContributor.displayName = 'StepContributor';

export default StepContributor;
