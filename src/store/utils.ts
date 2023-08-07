import { proxy, useSnapshot } from 'valtio';

export interface StoreTypes {
	open: boolean;
	[key: string]: any;
}

export const UtilsStore = proxy<StoreTypes>({
	open: false,
});

export const useUserStore = () => useSnapshot(UtilsStore);

export function openGlobalLoading() {
	UtilsStore.open = true;
}

export function closeGlobalLoading() {
	UtilsStore.open = false;
}
