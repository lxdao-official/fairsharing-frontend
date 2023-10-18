import { styled, Typography } from '@mui/material';

import { Img3 } from '@lxdao/img3';
import Link from 'next/link';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { StyledFlexBox } from '@/components/styledComponents';
import { IContributor } from '@/services';

export interface IMiniContributorListProps {
	contributorList: IContributor[];
}

const MiniContributorList = ({ contributorList }: IMiniContributorListProps) => {
	return (
		<StyledFlexBox sx={{ flex: 'no-wrap' }}>
			{contributorList.map((contributor) => {
				return (
					<Link href={`/profile/${contributor.wallet}`} key={contributor.id}>
						<Item>
							{contributor.user?.avatar ? (
								<Img3
									src={contributor.user.avatar}
									style={{
										width: '20px',
										height: '20px',
										borderRadius: '20px',
										border: '1px solid rgba(15,23,42,0.12)',
									}}
								/>
							) : (
								<AccountCircleIcon sx={{ color: '#94A3B8' }} />
							)}

							<Typography variant={'body1'}>{contributor.nickName}</Typography>
						</Item>
					</Link>
				);
			})}
		</StyledFlexBox>
	);
};

export default MiniContributorList;

const Item = styled(StyledFlexBox)({
	marginRight: '8px',
	gap: '8px',
	padding: '0 4px',
	height: '28px',
	backgroundColor: 'rgba(241, 245, 249, .6)',
	borderRadius: '4px',
	lineHeight: '24px',
	'&:hover': {
		backgroundColor: 'rgba(241, 245, 249, 1)',
	},
});
