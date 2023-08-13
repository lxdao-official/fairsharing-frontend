'use client';

import { useRouter } from 'next/router';

export default function ProjectDetail() {
	const router = useRouter();
	return <div>My Project: {router.query.id}</div>;
}
