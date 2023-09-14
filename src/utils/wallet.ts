export function formatWalletAddress(walletAddress: string): string {
	const prefix = walletAddress.slice(0, 6);
	const suffix = walletAddress.slice(-4);
	return prefix + '...' + suffix;
}
