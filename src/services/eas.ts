import { request } from '@/common/request';

export const getEasSignature = (params: { wallet: string; cid: string }) => {
	return request<string>('eas/signature', 1, params);
};
