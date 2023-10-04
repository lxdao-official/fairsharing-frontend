import { request } from '@/common/request';
import { IUser } from '@/services/types';

export const signup = (wallet: string) => {
	return request.post<IUser>('user/signup', 1, { wallet });
};

export const getUserInfo = (wallet: string) => {
	return request<IUser>('user/info', 1, { wallet });
};

export type EditUserParams = Pick<IUser, 'avatar' | 'bio' | 'name'>;
export const editUser = (userId: string, params: EditUserParams) => {
	return request.put(`user/${userId}/edit`, 1, params);
};
