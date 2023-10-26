import { IContributor, PermissionEnum } from '@/services';

export function compareMemberArrays(array1: IContributor[], array2: IContributor[]) {
	const set1 = new Set(array1.map((item) => item.wallet));
	const set2 = new Set(array2.map((item) => item.wallet));
	const addMemberList = array2
		.filter((item) => !set1.has(item.wallet))
		.map((item) => item.wallet);
	const removeMemberList = array1
		.filter((item) => !set2.has(item.wallet))
		.map((item) => item.wallet);

	const adminArr1 = array1.filter((item) => isAdmin(item.permission));
	const adminArr2 = array2.filter((item) => isAdmin(item.permission));
	const adminSet1 = new Set(adminArr1.map((item) => item.wallet));
	const adminSet2 = new Set(adminArr2.map((item) => item.wallet));

	const addAdminList = adminArr2
		.filter((item) => !adminSet1.has(item.wallet))
		.map((item) => item.wallet);
	const removeAdminList = adminArr1
		.filter((item) => !adminSet2.has(item.wallet))
		.map((item) => item.wallet);

	return {
		addAdminList,
		removeAdminList,
		addMemberList,
		removeMemberList,
	};
}

export function isAdmin(permission: PermissionEnum) {
	return permission === PermissionEnum.Owner || permission === PermissionEnum.Admin;
}
