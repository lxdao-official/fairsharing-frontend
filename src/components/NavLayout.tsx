import React from 'react';

import Nav from '@/components/nav/nav';

export default function NavLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Nav />
			{children}
		</>
	);
}
