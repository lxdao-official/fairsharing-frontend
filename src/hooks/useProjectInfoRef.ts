import { useRef } from 'react';

import { StepProfileRef } from '@/components/createProject/step/profile';
import { StepStrategyRef } from '@/components/createProject/step/strategy';
import { StepContributorRef } from '@/components/createProject/step/contributor';

const useProjectInfoRef = () => {
	const stepProfileRef = useRef<StepProfileRef | null>(null);
	const stepStrategyRef = useRef<StepStrategyRef | null>(null);
	const stepContributorRef = useRef<StepContributorRef | null>(null);

	return { stepContributorRef, stepProfileRef, stepStrategyRef };
};

export default useProjectInfoRef;
