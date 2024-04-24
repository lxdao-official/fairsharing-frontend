import SafeAppsSDK, { TokenBalance } from '@safe-global/safe-apps-sdk';
import { useState, useEffect } from 'react';

function useSafeBalances(sdk: SafeAppsSDK): [TokenBalance[], boolean] {
	const [assets, setAssets] = useState<TokenBalance[]>([]);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		async function loadBalances() {
			const balances = await sdk.safe.experimental_getBalances();
			console.log('loadBalances', balances);
			setAssets(balances.items);
			setLoaded(true);
		}

		loadBalances();
	}, [sdk]);

	return [assets, loaded];
}

export { useSafeBalances };
