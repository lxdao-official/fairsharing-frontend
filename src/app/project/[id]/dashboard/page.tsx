'use client';

export default function Page({ params }: { params: { id: string } }) {
	return <div style={{ flex: '1' }}>dashboard: {params.id}</div>;
}
