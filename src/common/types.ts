export interface PageListParams {
	currentPage: number;
	pageSize: number;
}
export interface PageListData<T = any> {
	list: T[];
	total: number;
	currentPage: number;
	pageSize: number;
	totalPage: number;
}
