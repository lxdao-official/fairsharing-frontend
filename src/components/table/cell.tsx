import { Avatar, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import Image from 'next/image';

import { formatWalletAddress } from '@/utils/wallet';
import { showToast } from '@/store/utils';

import { StyledFlexBox } from '@/components/styledComponents';

export const nickNameCell: GridColDef = {
	field: 'nickName',
	headerName: 'Name',
	sortable: false,
	flex: 1,
	minWidth: 150,
	renderCell: (item) => {
		return (
			<StyledFlexBox sx={{ gap: '8px' }}>
				<Avatar alt={item.value} src={item.row.user?.avatar || ''} />
				<Typography variant="subtitle2" fontSize={16} fontWeight={500}>
					{item.value}
				</Typography>
			</StyledFlexBox>
		);
	},
};

export const WalletCell = ({
	wallet,
	needFormat = true,
	color,
}: {
	wallet: string;
	needFormat?: boolean;
	color?: string;
}) => {
	const props = color ? { color } : {};
	return (
		<StyledFlexBox sx={{ gap: '4px' }}>
			<Typography variant="body1" {...props}>
				{needFormat ? formatWalletAddress(wallet) : wallet}
			</Typography>
			<CopyToClipboard text={wallet} onCopy={() => showToast('Copied')}>
				<Image
					src="/images/copy.png"
					width={24}
					height={24}
					alt="copy"
					style={{ cursor: 'pointer' }}
				/>
			</CopyToClipboard>
		</StyledFlexBox>
	);
};

export const walletCell: GridColDef = {
	field: 'wallet',
	headerName: 'ETH Wallet',
	sortable: false,
	flex: 1,
	minWidth: 200,
	renderCell: (item) => {
		return <WalletCell wallet={item.value} />;
	},
};
