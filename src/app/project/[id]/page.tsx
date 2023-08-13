export default function Page({ params }: { params: { id: string } }) {
	return <div style={{ flex: '1' }}>default: {params.id}</div>;
}
