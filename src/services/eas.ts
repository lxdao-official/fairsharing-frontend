import { request } from '@/common/request';
import { fetchGraphqlData } from '@/common/graphql';
import { EasSchemaMap } from '@/constant/eas';

export const getEasSignature = (params: { wallet: string; cId: number; chainId: number }) => {
	return request<string>('eas/signature', 1, params);
};

export interface EasAttestation {
	id: string;
	refUID: string;
	ipfsHash: string;
	recipient: string;
	/**
	 * can be JSON.parse
	 */
	decodedDataJson: string | EasAttestationDecodedData[];
	/**
	 * can be JSON.parse
	 */
	data: string | EasAttestationData;
	attester: string;
	revocable: string;
	revoked: string;
}

export interface EasAttestationDecodedData {
	name: string;
	signature: string;
	type: string;
	value: {
		name: string;
		type: string;
		value: string | number | { type: 'BigNumber'; hex: string };
	};
}

export interface EasAttestationData {
	signer: string;
	sig: Record<string, any>;
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
			  },
			  schemaId: {
			  	equals: "${EasSchemaMap.contribution}"
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
	return fetchGraphqlData<{ attestations: EasAttestation[] }>(chainId || 420, query);
};

export const getEASVoteRecord = async (uIds: string[], chainId?: number) => {
	const id_in = uIds.reduce((pre, cur) => {
		return pre + `${pre ? '\n' : ''}` + `"${cur}"`;
	}, '');
	const query = `
		query Attestations {
		  attestations(
			where: {
			  schemaId: {
				equals: "${EasSchemaMap.vote}"
			  }
			  refUID: { 
			   	in: [
				  ${id_in}
				]
			  }
			}
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
	return fetchGraphqlData<{ attestations: EasAttestation[] }>(chainId || 420, query);
};
