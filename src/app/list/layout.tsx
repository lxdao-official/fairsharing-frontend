import React from 'react';

import NavLayout from '@/components/NavLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
	return <NavLayout>{children}</NavLayout>;
}
