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
import React, { useCallback, useMemo, useState } from 'react';
import { Img3 } from '@lxdao/img3';
import Image from 'next/image';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { format } from 'date-fns';

import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Link from 'next/link';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';

import { useNetwork } from 'wagmi';

import StatusText from '@/components/project/contribution/statusText';
import Pizza, { BorderOutline } from '@/components/project/contribution/pizza';
import { StyledFlexBox } from '@/components/styledComponents';
import { IContribution, IContributor, IProject } from '@/services/types';
import VoteAction, { VoteStatus, VoteTypeEnum } from '@/components/project/contribution/voteAction';
import PostContribution from '@/components/project/contribution/postContribution';
import {
	IClaimParams,
	IVoteParams,
	IVoteValueEnum,
} from '@/components/project/contribution/contributionList';
import { EasAttestation, EasAttestationData, EasAttestationDecodedData } from '@/services/eas';
import { EAS_CHAIN_CONFIGS } from '@/constant/eas';

export interface IContributionItemProps {
	contribution: IContribution;
	projectDetail: IProject;
	showSelect: boolean;
	selected: number[];
	onSelect: (idList: number[]) => void;
	showDeleteDialog: () => void;
	onVote: (params: IVoteParams) => void;
	onClaim: (params: IClaimParams) => void;
	easVoteList: EasAttestation[];
	contributorList: IContributor[];
}

const ContributionItem = (props: IContributionItemProps) => {
	const {
		contribution,
		selected,
		onSelect,
		showSelect,
		showDeleteDialog,
		projectDetail,
		easVoteList,
		contributorList,
	} = props;

	const { chain } = useNetwork();

	const voteInfoMap = useMemo(() => {
		let For = 0,
			Against = 0,
			Abstain = 0;
		const voters: string[] = [];
		const voterValues: number[] = [];
		easVoteList?.forEach((vote) => {
			const decodedDataJson = vote.decodedDataJson as EasAttestationDecodedData[];
			const attestationData = vote.data as EasAttestationData;

			const voteValueItem = decodedDataJson.find((item) => item.name === 'value');
			if (voteValueItem) {
				const voteNumber = voteValueItem.value.value as IVoteValueEnum;
				voters.push(attestationData.signer);
				voterValues.push(voteNumber);
				if (voteNumber === IVoteValueEnum.FOR) {
					For += 1;
				} else if (voteNumber === IVoteValueEnum.AGAINST) {
					Against += 1;
				} else if (voteNumber === IVoteValueEnum.ABSTAIN) {
					Abstain += 1;
				}
			}
		});
		return { For, Against, Abstain, voters, voterValues };
	}, [easVoteList]);

	const EasLink = useMemo(() => {
		const activeChainConfig =
			EAS_CHAIN_CONFIGS.find((config) => config.chainId === chain?.id) ||
			EAS_CHAIN_CONFIGS[2];
		return `${activeChainConfig.etherscanURL}/offchain/attestation/view/${contribution.uId}`;
	}, [contribution, chain]);

	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log('handleCheckboxChange', event.target.checked);
		const checked = event.target.checked;
		const newList = checked
			? [...selected, contribution.id]
			: selected.filter((id) => Number(id) !== Number(contribution.id));
		onSelect(newList);
	};

	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const [openMore, setOpenMore] = useState(false);
	const [openProof, setOpenProof] = useState(false);
	const [openContributor, setOpenContributor] = useState(false);

	const [showEdit, setShowEdit] = useState(false);

	const handleVote = (voteValue: IVoteValueEnum) => {
		props.onVote({
			contributionId: contribution.id,
			uId: contribution.uId as string,
			value: voteValue,
		});
	};

	const handleClaim = () => {
		props.onClaim({
			contributionId: contribution.id,
			uId: contribution.uId || ('' as string),
			token: contribution.credit,
			voters: voteInfoMap.voters,
			voteValues: voteInfoMap.voterValues,
		});
	};

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
		setShowEdit(true);
		handleClosePopover();
	};

	const onDelete = () => {
		console.log('onDelete');
		handleClosePopover();
	};

	const onCancel = useCallback(() => {
		setShowEdit(false);
	}, []);

	const onPost = useCallback(() => {
		console.log('re-post');
	}, []);

	return (
		<>
			<StyledFlexBox sx={{ alignItems: 'flex-start', paddingTop: '16px' }}>
				<StyledFlexBox sx={{ marginRight: '16px', maxWidth: '94px' }}>
					{showSelect ? (
						<Checkbox
							checked={selected.includes(Number(contribution.id))}
							onChange={handleCheckboxChange}
						/>
					) : null}
					<Img3
						src={projectDetail.logo}
						style={{ width: '48px', height: '48px', borderRadius: '48px' }}
					/>
				</StyledFlexBox>
				<div style={{ flex: 1 }}>
					<StyledFlexBox sx={{ height: 28, justifyContent: 'space-between' }}>
						<StyledFlexBox>
							<Typography variant={'subtitle1'}>{projectDetail.name}</Typography>
							<Typography sx={{ marginLeft: '12px' }}>
								{format(new Date(contribution.updatedAt), 'yyyy-MM-dd HH:mm:ss')}
							</Typography>
						</StyledFlexBox>
						<StyledFlexBox>
							<StatusText
								contribution={contribution}
								onClaim={handleClaim}
								period={projectDetail.votePeriod}
							/>
							<Tooltip title="View on chain" placement="top">
								<Link href={EasLink} target={'_blank'}>
									<Image
										src={'/images/eas_logo.png'}
										width={52}
										height={24}
										alt={'eas'}
										style={{ cursor: 'pointer', margin: '0 24px' }}
									/>
								</Link>
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
												<ListItemButton onClick={onEdit}>
													Edit
												</ListItemButton>
											</ListItem>
											<ListItem disablePadding>
												<ListItemButton onClick={showDeleteDialog}>
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
								status={VoteStatus.DONE}
								count={voteInfoMap.For}
								contribution={contribution}
								onConfirm={() => handleVote(IVoteValueEnum.FOR)}
							/>
							<VoteAction
								type={VoteTypeEnum.AGAINST}
								status={VoteStatus.NORMAL}
								count={voteInfoMap.Against}
								contribution={contribution}
								onConfirm={() => handleVote(IVoteValueEnum.AGAINST)}
							/>
							<VoteAction
								type={VoteTypeEnum.ABSTAIN}
								status={VoteStatus.DISABLED}
								count={voteInfoMap.Abstain}
								contribution={contribution}
								onConfirm={() => handleVote(IVoteValueEnum.ABSTAIN)}
							/>
						</StyledFlexBox>
					</StyledFlexBox>
					{!showEdit ? <Divider sx={{ marginTop: '26px' }} /> : null}
				</div>
			</StyledFlexBox>

			{showEdit ? (
				<PostContribution
					contribution={contribution}
					onCancel={onCancel}
					onPost={onPost}
					contributorList={contributorList}
				/>
			) : null}
		</>
	);
};

export default ContributionItem;
