import React from 'react';

import NavLayout from '@/components/navLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
	return <NavLayout>{children}</NavLayout>;
}
