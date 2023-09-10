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
});

export const useUtilsStore = () => useSnapshot(UtilsStore);

export function openGlobalLoading() {
	UtilsStore.open = true;
}

export function closeGlobalLoading() {
	UtilsStore.open = false;
}

export function showToast(text: string, severity: AlertColor, duration?: number) {
	UtilsStore.alert = {
		open: true,
		content: text,
		severity: severity || 'success',
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
