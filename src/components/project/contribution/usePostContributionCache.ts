import { useEffect, useMemo, useState } from 'react';

import { AutoCompleteValue } from '@/components/project/contribution/postContribution';

export interface IPostContributionCacheItem {
	detail: string;
	typeValue: AutoCompleteValue[];
	proof: string;
	startDate: Date;
	endDate: Date;
	toValue: AutoCompleteValue;
	credit: string;
}

/**
 * Record<projectId, IPostContributionCacheItem>
 */
export type ICachedPostContribution = Record<string, IPostContributionCacheItem>;

const usePostContributionCache = ({ projectId }: { projectId: string }) => {
	const cacheKey = '__FS_post_contribution_cache__';

	const getCacheMap = () => {
		const data = localStorage.getItem(cacheKey);
		return data ? (JSON.parse(data) as ICachedPostContribution) : {};
	};

	const [cacheMap, setCacheMap] = useState<ICachedPostContribution>(() => getCacheMap());

	const cache = useMemo(() => {
		return cacheMap?.[projectId] || null;
	}, [cacheMap, projectId]);

	useEffect(() => {
		if (cacheMap) {
			console.log('cacheMap', cacheMap);
		}
	}, [cacheMap]);

	const getCache = () => {
		return cache;
	};

	const setCache = (data: IPostContributionCacheItem) => {
		const newCache = { ...cacheMap, [projectId]: data };
		localStorage.setItem(cacheKey, JSON.stringify(newCache));
		setCacheMap(newCache);
	};

	const clearCache = () => {
		const newCache = { ...cacheMap };
		delete newCache[projectId];
		localStorage.setItem(cacheKey, JSON.stringify(newCache));
		setCacheMap(newCache);
	};

	return {
		cache,
		setCache,
		getCache,
		clearCache,
	};
};

export default usePostContributionCache;
