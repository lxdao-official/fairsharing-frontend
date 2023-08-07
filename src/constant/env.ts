export enum ENV {
	LOCAL = 'Local',
	DEV = 'DEV',
	SIT = 'SIT',
	PRODUCTION = 'Production',
}

export function getEnv(): ENV {
	return process.env.APP_ENV as ENV;
}

export const isProd = getEnv() === ENV.PRODUCTION;
export const isDEV = getEnv() === ENV.DEV;
export const isLocal = getEnv() === ENV.LOCAL;
