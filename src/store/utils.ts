import { proxy, useSnapshot } from 'valtio';
import { AlertColor } from '@mui/material/Alert/Alert';

export interface StoreTypes {
	open: boolean;
	alert: {
		open: boolean;
		content: string;
		severity: AlertColor;
		autoHideDuration: number;
	};

	showTokenToolTip: boolean;

	[key: string]: any;
}

export const UtilsStore = proxy<StoreTypes>({
	open: false,
	alert: {
		open: false,
		content: '',
		severity: 'success',
		autoHideDuration: 5000,
	},
	showTokenToolTip: true,
});

export const useUtilsStore = () => useSnapshot(UtilsStore);

export function openGlobalLoading() {
	UtilsStore.open = true;
}

export function closeGlobalLoading() {
	UtilsStore.open = false;
}

export function showToast(text: string, severity: AlertColor = 'success', duration?: number) {
	UtilsStore.alert = {
		open: true,
		content: text,
		severity: severity,
		autoHideDuration: duration || 5000,
	};
}

export function closeToast() {
	UtilsStore.alert = {
		open: false,
		content: '',
		severity: 'success',
		autoHideDuration: 5000,
	};
}

const storageTokenTip = '__fs_show_token_tip__';

export function initShowTokenToolTip() {
	const storageData = localStorage.getItem(storageTokenTip);
	if (storageData === 'never') {
		UtilsStore.showTokenToolTip = false;
	}
}

export function hideTokenToolTip() {
	console.log('hideTokenToolTip');
	localStorage.setItem(storageTokenTip, 'never');
	UtilsStore.showTokenToolTip = false;
}
