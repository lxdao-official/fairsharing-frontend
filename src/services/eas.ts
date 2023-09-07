import { request } from '@/common/request';
import { fetchGraphqlData } from '@/common/graphql';

export const getEasSignature = (params: { wallet: string; cId: number; chainId: number }) => {
	return request<string>('eas/signature', 1, params);
};

export interface EasContribution {
	id: string;
	refUID: string;
	ipfsHash: string;
	recipient: string;
	/**
	 * can be JSON.parse
	 */
	decodedDataJson: string | Record<string, any>;
	/**
	 * can be JSON.parse
	 */
	data: string | Record<string, any>;
	attester: string;
	revocable: string;
	revoked: string;
}

export const getEASContributionList = async (ids: string[], chainId?: number) => {
	const id_in = ids.reduce((pre, cur) => {
		return pre + `${pre ? '\n' : ''}` + `"${cur}"`;
	}, '');
	const query = `
		query Attestations {
		  attestations(
			where: {
			  id: {
				in: [
				  ${id_in}
				]
			  }
			}
			take: 5
		  ) {
			id
			refUID
			ipfsHash
			recipient
			decodedDataJson
			data
			attester
			revocable
			revoked
		  }
		}
	`;
	console.log('graphql query', query);
	return fetchGraphqlData<{ attestations: EasContribution[] }>(chainId || 420, query);
};
