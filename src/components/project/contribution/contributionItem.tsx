import { IContribution } from '@/services/types';
import { StyledFlexBox } from '@/components/styledComponents';
import {
	Button,
	Checkbox,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	Paper,
	Popover,
	Tooltip,
	Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Img3 } from '@lxdao/img3';
import Image from 'next/image';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Pizza, { BorderOutline } from '@/components/project/contribution/pizza';
import StatusText from '@/components/project/contribution/statusText';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Link from 'next/link';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';
import VoteAction, { VoteTypeEnum } from '@/components/project/contribution/voteAction';

export interface IContributionItemProps {
	contribution: IContribution;
	showSelect: boolean;
	selected: string[];
	onSelect: (idList: string[]) => void;
}

// TODO contribution的头像是owner头像？
// TODO 标题是project owner name?
// TODO time
const ContributionItem = (props: IContributionItemProps) => {
	const { contribution, selected, onSelect, showSelect } = props;

	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log('handleCheckboxChange', event.target.checked);
		const checked = event.target.checked;
		const newList = checked
			? [...selected, contribution.id]
			: selected.filter((id) => id !== contribution.id);
		onSelect(newList);
	};

	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const [openMore, setOpenMore] = useState(false);
	const [openProof, setOpenProof] = useState(false);
	const [openContributor, setOpenContributor] = useState(false);
	const handleOpenMorePopover = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
		setOpenMore(true);
	};

	const handleOpenProofPopover = (event: React.MouseEvent<HTMLDivElement>) => {
		setAnchorEl(event.currentTarget);
		setOpenProof(true);
	};

	const handleOpenContributorPopover = (event: React.MouseEvent<HTMLDivElement>) => {
		setAnchorEl(event.currentTarget);
		setOpenContributor(true);
	};
	const handleClosePopover = () => {
		setAnchorEl(null);
		setOpenMore(false);
		setOpenProof(false);
		setOpenContributor(false);
	};

	const onEdit = () => {
		console.log('onEdit');
	};

	const onDelete = () => {
		console.log('onDelete');
	};

	return (
		<StyledFlexBox sx={{ alignItems: 'flex-start', paddingTop: '16px' }}>
			<StyledFlexBox sx={{ marginRight: '16px', maxWidth: '94px' }}>
				{showSelect ? (
					<Checkbox
						checked={selected.includes(contribution.id)}
						onChange={handleCheckboxChange}
					/>
				) : null}
				<Img3
					src={contribution.avatar}
					style={{ width: '48px', height: '48px', borderRadius: '48px' }}
				/>
			</StyledFlexBox>
			<div style={{ flex: 1 }}>
				<StyledFlexBox sx={{ height: 28, justifyContent: 'space-between' }}>
					<StyledFlexBox>
						<Typography variant={'subtitle1'}>Project owner name ?</Typography>
						<Typography sx={{ marginLeft: '12px' }}>2 hour ago</Typography>
					</StyledFlexBox>
					<StyledFlexBox>
						<StatusText contribution={contribution} />
						<Tooltip title="View on chain" placement="top">
							<Image
								src={'/images/eas_logo.png'}
								width={52}
								height={24}
								alt={'eas'}
								style={{ cursor: 'pointer', margin: '0 24px' }}
							/>
						</Tooltip>

						<div>
							<IconButton size="small" onClick={handleOpenMorePopover}>
								<MoreHorizIcon />
							</IconButton>
							<Popover
								id={'simple-popover-more'}
								open={openMore}
								anchorEl={anchorEl}
								onClose={handleClosePopover}
								anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
								transformOrigin={{ vertical: 'top', horizontal: 'right' }}
							>
								<Paper>
									<List>
										<ListItem disablePadding>
											<ListItemButton onClick={onEdit}>Edit</ListItemButton>
										</ListItem>
										<ListItem disablePadding>
											<ListItemButton onClick={onDelete}>
												Delete
											</ListItemButton>
										</ListItem>
									</List>
								</Paper>
							</Popover>
						</div>
					</StyledFlexBox>
				</StyledFlexBox>
				<Typography sx={{ margin: '2px 0 12px' }}>{contribution.detail}</Typography>
				<StyledFlexBox sx={{ justifyContent: 'space-between' }}>
					<StyledFlexBox>
						{/*pizza status*/}

						<Pizza credit={contribution.credit} status={contribution.status} />

						{/*proof*/}

						<>
							<BorderOutline
								sx={{ cursor: 'pointer', margin: '0 8px' }}
								onClick={handleOpenProofPopover}
							>
								<InsertDriveFileOutlinedIcon
									fontSize={'small'}
									sx={{ color: '#677389' }}
								/>
								<Typography
									variant={'body2'}
									sx={{ fontWeight: 'bold', color: '#475569' }}
								>
									Proof
								</Typography>
							</BorderOutline>
							<Popover
								id={'simple-popover-proof'}
								open={openProof}
								anchorEl={anchorEl}
								onClose={handleClosePopover}
								anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
								transformOrigin={{ vertical: 'top', horizontal: 'left' }}
								disableRestoreFocus
							>
								<Paper sx={{ padding: '12px' }}>
									<Link href={contribution.proof} target={'_blank'}>
										<InsertLinkOutlinedIcon sx={{ color: '#437EF7' }} />
										<Button variant={'text'} sx={{ textTransform: 'none' }}>
											{contribution.proof}
										</Button>
									</Link>
								</Paper>
							</Popover>
						</>

						{/*contributors*/}

						<>
							{/*TODO API contributors */}
							<BorderOutline
								sx={{ cursor: 'pointer', margin: '0 8px' }}
								onClick={handleOpenContributorPopover}
							>
								<Typography
									variant={'body2'}
									sx={{ fontWeight: 'bold', color: '#475569' }}
								>
									@ Mike,Bruce, +8
								</Typography>
							</BorderOutline>
							<Popover
								id={'simple-popover-contributor'}
								open={openContributor}
								anchorEl={anchorEl}
								onClose={handleClosePopover}
								anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
								transformOrigin={{ vertical: 'top', horizontal: 'left' }}
								disableRestoreFocus
							>
								<Paper sx={{ padding: '12px' }}>Contributor list</Paper>
							</Popover>
						</>
					</StyledFlexBox>

					<StyledFlexBox>
						<VoteAction
							type={VoteTypeEnum.FOR}
							contribution={contribution}
							onConfirm={() => {}}
						/>
						<VoteAction
							type={VoteTypeEnum.AGAINST}
							contribution={contribution}
							onConfirm={() => {}}
						/>
						<VoteAction
							type={VoteTypeEnum.ABSTAIN}
							contribution={contribution}
							onConfirm={() => {}}
						/>
					</StyledFlexBox>
				</StyledFlexBox>
				<Divider sx={{ marginTop: '26px' }} />
			</div>
		</StyledFlexBox>
	);
};

export default ContributionItem;
