import { StyledFlexBox } from '@/components/styledComponents';
import { Avatar, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { formatWalletAddress } from '@/utils/wallet';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { showToast } from '@/store/utils';
import Image from 'next/image';

export const nickNameCell: GridColDef = {
	field: 'nickName',
	headerName: 'Name',
	sortable: false,
	width: 200,
	renderCell: (item) => {
		return (
			<StyledFlexBox sx={{ gap: '8px' }}>
				<Avatar alt={item.value} src={item.row.user?.avatar || ''} />
				<Typography variant="subtitle2" fontSize={16}>
					{item.value}
				</Typography>
			</StyledFlexBox>
		);
	},
};

export const walletCell: GridColDef = {
	field: 'wallet',
	headerName: 'ETH Wallet',
	sortable: false,
	width: 200,
	renderCell: (item) => {
		return (
			<StyledFlexBox sx={{ gap: '4px' }}>
				<Typography variant="body1">{formatWalletAddress(item.value)}</Typography>
				<CopyToClipboard text={item.value} onCopy={() => showToast('Copy success!')}>
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
	},
};
