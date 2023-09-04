import { proxy, useSnapshot } from 'valtio';

import { IUser } from '@/services/types';

export interface StoreTypes {
	myInfo: IUser | null;
}

export const UserStore = proxy<StoreTypes>({
	myInfo: null,
});

export const useUserStore = () => useSnapshot(UserStore);

export const setUser = (user: IUser) => {
	UserStore.myInfo = user;
};
