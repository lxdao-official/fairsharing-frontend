import { useState } from 'react';

import { ProjectFormStepEnum } from '@/app/project/create/page';
import { StepProfileFormData } from '@/components/createProject/step/profile';
import { StepStrategyFormData } from '@/components/createProject/step/strategy';
import { StepContributorFormData } from '@/components/createProject/step/contributor';

export interface IProjectFormMap {
	profile?: StepProfileFormData;
	strategy?: StepStrategyFormData;
	contributor?: StepContributorFormData;
}

export interface ICreateProjectCache extends IProjectFormMap {
	activeStep: ProjectFormStepEnum;
}

export type IProjectFormKey = keyof IProjectFormMap;

const useProjectCache = () => {
	const cacheKey = '__FS_create_project_cache__';

	const getCache = () => {
		const data = localStorage.getItem(cacheKey);
		if (data) {
			return JSON.parse(data) as ICreateProjectCache;
		} else {
			return null;
		}
	};

	const [data, setData] = useState<ICreateProjectCache | null>(() => getCache());

	const setCache = <K extends IProjectFormKey>(stepKey: K, formData: IProjectFormMap[K]) => {
		const cache = getCache() || {};
		const form = {
			...cache,
			[stepKey]: formData,
			activeStep: ProjectFormStepEnum[stepKey],
		};
		localStorage.setItem(cacheKey, JSON.stringify(form));
		setData(form);
	};

	const clearCache = () => {
		localStorage.removeItem(cacheKey);
		setData(null);
	};

	return {
		cache: data,
		setCache,
		getCache,
		clearCache,
	};
};

export default useProjectCache;
