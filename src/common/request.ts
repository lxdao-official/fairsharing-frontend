import * as process from 'process';

import * as https from 'https';

import axios, { AxiosRequestConfig } from 'axios';

import { isServer } from '@tanstack/query-core';

import { isProd } from '@/constant/env';

export const client = axios.create({
	baseURL: getHost(),
	timeout: 5000,
	withCredentials: true,
	httpsAgent: new https.Agent({
		rejectUnauthorized: false,
	}),
});

client.interceptors.request.use(
	(config) => {
		// TODO auth

		return config;
	},
	(error) => {
		// 请求拦截器发生错误时的处理
		return Promise.reject(error);
	},
);

client.interceptors.response.use(
	(response) => {
		const { data, status } = response ?? {};

		if (data?.code === 0) {
			return data?.data;
		}

		// TODO handle not login or other error case
		if (status === 401 || data?.code === 4001) {
			/* empty */
		}

		console.error('Request Error', data?.message, data);
	},
	(error) => {
		const { response } = error ?? {};
		const { data, status } = response ?? {};

		return Promise.reject(error);
	},
);

export interface RequestOptions extends AxiosRequestConfig {}

export function request<T = any>(
	api: string,
	version: number | string,
	data?: AxiosRequestConfig['params'],
	options?: RequestOptions & { method: 'get' | never },
): Promise<T>;
export function request<T = any>(
	api: string,
	version: number | string,
	data: AxiosRequestConfig['data'],
	options?: RequestOptions,
): Promise<T>;
export function request<T = any>(
	api: string,
	version: number | string,
	data?: any,
	options: RequestOptions = {},
): Promise<T> {
	if (options.method === 'get' && data) {
		data = removeEmptyParams(data);
	}

	return client.request({
		...options,
		url: getRequestUrl(api, version),
		params: options.method ? '' : data,
		data: options.method ? data : null,
	});
}

request.post = function post<T = any>(
	api: string,
	version: number | string,
	data: any,
	options?: Omit<AxiosRequestConfig, 'method'>,
): Promise<T> {
	return request(api, version, data, { method: 'post', ...options });
};

request.put = function post<T = any>(
	api: string,
	version: number | string,
	data: any,
	options?: Omit<AxiosRequestConfig, 'put'>,
): Promise<T> {
	return request(api, version, data, { method: 'put', ...options });
};

function removeEmptyParams(data: any) {
	return Object.entries(data).reduce((data, [key, value]) => {
		if (typeof value === 'undefined') {
			return data;
		}

		if (typeof value === 'string' && value.length === 0) {
			return data;
		}

		if (key === 'page' && value === 0) {
			return data;
		}

		// @ts-ignore
		data[key] = value;

		return data;
	}, {});
}

function getHost() {
	return isProd ? process.env.NEXT_PUBLIC_API_HOST_PROD : process.env.NEXT_PUBLIC_API_HOST_TEST;
}

export function getRequestUrl(api: string, version: number | string = 1): string {
	return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${api}`;
}

export function getAPIUrl(api: string, version: number | string = 1): string {
	return `${getHost()}${getRequestUrl(api, version)}`;
}
