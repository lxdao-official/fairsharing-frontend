'use client';

export default function Page({ params }: { params: { id: string } }) {
	return <div style={{ flex: '1' }}>contributor: {params.id}</div>;
}
