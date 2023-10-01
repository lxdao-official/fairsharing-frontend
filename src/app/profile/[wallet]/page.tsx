'use client';

export default function Page({ params }: { params: { wallet: string } }) {
	return <div style={{ flex: '1' }}>Profile: {params.wallet}</div>;
}
