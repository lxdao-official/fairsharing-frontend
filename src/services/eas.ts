import { request } from '@/common/request';

export const getEasSignature = (params: { wallet: string; cId: number; chainId: number }) => {
	return request<string>('eas/signature', 1, params);
};
