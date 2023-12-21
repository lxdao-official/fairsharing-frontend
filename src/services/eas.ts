import { request } from '@/common/request';
import { fetchGraphqlData } from '@/common/graphql';
import {
	DefaultChainId,
	EasSchemaContributionKey,
	EasSchemaMap,
	EasSchemaVoteKey,
} from '@/constant/eas';

export const getEasSignature = (params: { wallet: string; cId: number; chainId: number }) => {
	return request<string>('eas/signature', 1, params);
};

export type EasAttestation<K> = {
	id: string;
	refUID: string;
	ipfsHash: string;
	recipient: string;
	/**
	 * can be JSON.parse
	 */
	decodedDataJson: string | EasAttestationDecodedData<K>[];
	/**
	 * can be JSON.parse
	 */
	data: string | EasAttestationData;
	attester: string;
	revocable: string;
	revoked: string;
};

export type EasAttestationDecodedData<T> = {
	name: string;
	signature: string;
	type: string;
	value: {
		name: T;
		type: string;
		value: string | number | { type: 'BigNumber'; hex: string };
	};
};

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
	return fetchGraphqlData<{ attestations: EasAttestation<EasSchemaContributionKey>[] }>(
		chainId || DefaultChainId,
		query,
	);
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
	return fetchGraphqlData<{ attestations: EasAttestation<EasSchemaVoteKey>[] }>(
		chainId || DefaultChainId,
		query,
	);
};
