import {
	Checkbox,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	Paper,
	Popover,
	styled,
	Tooltip,
	Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Img3 } from '@lxdao/img3';
import { format, formatDistance, isSameDay } from 'date-fns';

import Link from 'next/link';

import { useAccount } from 'wagmi';

import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

import { useConnectModal } from '@rainbow-me/rainbowkit';

import axios from 'axios';

import { useSWRConfig } from 'swr';

import { ethers } from 'ethers';

import dynamic from 'next/dynamic';

import StatusText from '@/components/project/contribution/statusText';
import Pizza from '@/components/project/contribution/pizza';
import { StyledFlexBox } from '@/components/styledComponents';
import {
	ContributionType,
	IContribution,
	IContributor,
	IProject,
	Status,
} from '@/services/types';
import VoteAction, { VoteTypeEnum } from '@/components/project/contribution/voteAction';
import PostContribution from '@/components/project/contribution/postContribution';
import {
	IClaimParams,
	IVoteParams,
	IVoteValueEnum,
} from '@/components/project/contribution/contributionList';
import {
	EAS_CHAIN_CONFIGS,
	EasSchemaClaimKey,
	EasSchemaData,
	EasSchemaMap,
	EasSchemaTemplateMap,
	EasSchemaVoteKey,
} from '@/constant/contract';
import { closeGlobalLoading, openGlobalLoading, showToast } from '@/store/utils';
import MiniContributorList from '@/components/project/contribution/miniContributorList';
import { EasLogoIcon, MoreIcon } from '@/icons';
import { useUserStore } from '@/store/user';
import useEas from '@/hooks/useEas';
import { useEthersProvider, useEthersSigner } from '@/common/ether';

import { prepareClaim, updateContributionStatus } from '@/services';
import { LogoImage } from '@/constant/img3';
import useCountDownTime from '@/hooks/useCountdownTime';
import Types from '@/components/project/contribution/types';
import { useProjectStore } from '@/store/project';
import PreviewImageModal from '@/components/previewImageModal';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

/**
 * Record<signer, IVoteValueEnum>
 */
export type IVoteData = Record<string, IVoteValueEnum>;

export interface IContributionItemProps {
	contribution: IContribution;
	projectDetail: IProject;
	showSelect: boolean;
	selected: string[];
	onSelect: (idList: string[]) => void;
	showDeleteDialog: (contributionId: string, uId: string) => void;
	contributorList: IContributor[];
	contributionList: IContribution[];
	voteData: IVoteData | null;
	contributionTypeList: ContributionType[];
	unClaimedVoteResultMap: Record<string, boolean>
	isVoteResultFetched: boolean
	mutateGetAllUnClaimedList: () => void
}

const ContributionItem = (props: IContributionItemProps) => {
	const {
		contribution,
		selected,
		onSelect,
		showSelect,
		showDeleteDialog,
		projectDetail,
		contributorList,
		contributionList,
		voteData,
		contributionTypeList,
		unClaimedVoteResultMap,
		isVoteResultFetched,
		mutateGetAllUnClaimedList
	} = props;

	const { myInfo } = useUserStore();
	const { chain, chainId } = useAccount();
	const { eas, getEasScanURL, submitSignedAttestation, getOffchain, easConfig } = useEas();
	const signer = useEthersSigner();
	const provider = useEthersProvider();
	const { address: myAddress } = useAccount();
	const { openConnectModal } = useConnectModal();
	const { mutate } = useSWRConfig();

	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const [openMore, setOpenMore] = useState(false);
	const [openProof, setOpenProof] = useState(false);
	const [openContributor, setOpenContributor] = useState(false);

	const [openPreviewImage, setOpenPreviewImage] = useState(false);
	const [previewUrl, setPreviewUrl] = useState('');

	const { contributionListParam } = useProjectStore();

	const [showEdit, setShowEdit] = useState(false);
	const { targetTime, isEnd, timeLeft } = useCountDownTime(
		contribution.createAt,
		projectDetail.votePeriod,
		10000,
	);

	const isVotePass = useMemo(() => {
		return contribution.status === Status.READY && !!unClaimedVoteResultMap[contribution.id]
	}, [unClaimedVoteResultMap, contribution.id, contribution.status])

	const voteNumbers = useMemo(() => {
		let For = 0,
			Against = 0,
			Abstain = 0;
		for (const [signer, voteNumber] of Object.entries(voteData || {})) {
			const value = Number(voteNumber);
			if (value === IVoteValueEnum.FOR) {
				For += 1;
			} else if (value === IVoteValueEnum.AGAINST) {
				Against += 1;
			} else if (value === IVoteValueEnum.ABSTAIN) {
				Abstain += 1;
			}
		}
		return { For, Against, Abstain };
	}, [voteData]);

	const myVoteNumber = useMemo(() => {
		return voteData?.[myAddress!] || 9999;
	}, [voteData, myAddress]);

	const EasLink = useMemo(() => {
		return `${easConfig.etherscanURL}/offchain/attestation/view/${contribution.uId}`;
	}, [contribution, easConfig]);

	const matchContributors = useMemo(() => {
		return contributorList.filter((item) => contribution.toIds.includes(item.id));
	}, [contributorList, contribution]);

	const toContributors = useMemo(() => {
		const maxNum = 2;
		if (matchContributors.length > maxNum) {
			const names = matchContributors.slice(0, maxNum).reduce((pre, cur, currentIndex) => {
				return `${pre} ${currentIndex > 0 ? ', ' : ''}${cur.nickName}`;
			}, '');
			return `${names}, +${matchContributors.length - maxNum}`;
		} else {
			return matchContributors.reduce((pre, cur, currentIndex) => {
				return `${pre} ${currentIndex > 0 ? ', ' : ''}${cur.nickName}`;
			}, '');
		}
	}, [matchContributors]);

	const voteResult = useMemo(() => {
		const { For, Against, Abstain } = voteNumbers;
		const hasVoted = !(For === 0 && Against === 0 && Abstain === 0);
		const votePass = For > 0 && For >= Against;
		return { hasVoted, votePass };
	}, [voteNumbers]);

	const operatorId = useMemo(() => {
		if (contributorList.length === 0 || !myInfo) {
			return '';
		}
		return contributorList.filter((contributor) => contributor.userId === myInfo?.id)[0]?.id;
	}, [contributorList, myInfo]);

	const isOwner = useMemo(() => {
		return contribution.ownerId === operatorId;
	}, [contribution.ownerId, operatorId]);

	const contributionUIds = useMemo(() => {
		return contributionList
			.filter((contribution) => !!contribution.uId)
			.map((item) => item.uId) as string[];
	}, [contributionList]);

	const contributionOwner = useMemo(() => {
		return (
			contributorList.find((item) => item.id === contribution.ownerId) || {
				nickName: 'FS member',
				user: { avatar: LogoImage },
				wallet: '',
			}
		);
	}, [contribution, contributorList]);

	const contributionDate = useMemo(() => {
		const { contributionDate, startDate: startTime, endDate: endTime } = contribution;
		const oldDate = contributionDate ? JSON.parse(contributionDate) : null;
		const start = startTime || oldDate?.startDate;
		const end = endTime || oldDate?.endDate;
		const isSame = isSameDay(new Date(start), new Date(end));
		const startDate = format(new Date(start), 'MMM dd, yyyy');
		const endDate = format(new Date(end), 'MMM dd, yyyy');
		return isSame ? `📆 ${startDate}` : `📆 ${startDate} - ${endDate}`;
	}, [contribution]);

	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const checked = event.target.checked;
		const newList = checked
			? [...selected, contribution.id]
			: selected.filter((id) => id !== contribution.id);
		onSelect(newList);
	};

	const handleVote = (voteValue: IVoteValueEnum) => {
		if (!myAddress) {
			openConnectModal?.();
			return false;
		}
		// 不在contributorList里，无权投票
		if (!contributorList.find((contributor) => contributor.wallet === myAddress)) {
			showToast('To participate in this project, reach out to the admin to join.', 'error');
			return false;
		}
		if (!contribution.uId) {
			console.error('uId not exist');
			return false;
		}
		if (contribution.status === 'UNREADY') {
			showToast(`This contribution is not ready for voting`, 'error');
			return false;
		}
		// 投票时间结束后，不允许继续Vote
		if (Date.now() >= targetTime) {
			showToast(`Vote has ended.`, 'error');
			return false;
		}
		if (contribution.status === 'CLAIM') {
			showToast(`Vote has ended, and tokens have been claimed`, 'error');
			return false;
		}
		submitVote({
			contributionId: contribution.id,
			uId: contribution.uId as string,
			value: voteValue,
		});
	};

	const submitVote = async ({ contributionId, value, uId }: IVoteParams) => {
		try {
			openGlobalLoading();
			const offchain = getOffchain();
			const voteSchemaUid = EasSchemaMap.vote;

			const schemaEncoder = new SchemaEncoder(EasSchemaTemplateMap.vote);
			const data: EasSchemaData<EasSchemaVoteKey>[] = [
				{ name: 'ProjectAddress', value: projectDetail.id, type: 'address' },
				{
					name: 'ContributionID',
					value: contributionId,
					type: 'bytes32',
				},
				{ name: 'VoteChoice', value: value, type: 'uint8' },
				{ name: 'Comment', value: 'Good contribution', type: 'string' },
			];
			const encodedData = schemaEncoder.encodeData(data);
			const block = await provider.getBlock('latest');
			if (!signer) {
				return;
			}
			const defaultRecipient = '0x0000000000000000000000000000000000000000';
			const toWallet = matchContributors[0]?.wallet;
			const offchainAttestation = await offchain.signOffchainAttestation(
				{
					recipient: toWallet || defaultRecipient,
					expirationTime: BigInt(0),
					time: BigInt(block ? block.timestamp : 0),
					revocable: true,
					version: 1,
					nonce: BigInt(0),
					schema: voteSchemaUid,
					refUID: uId, // 可用来查询vote信息
					data: encodedData,
				},
				signer,
			);
			const res = await submitSignedAttestation({
				signer: myAddress as string,
				sig: offchainAttestation,
			});
			if (res.data.error) {
				console.error('vote submitSignedAttestation fail', res.data);
				throw new Error(res.data.error);
			}
			showToast('Voted', 'success');
			const baseURL = getEasScanURL();
			// Update ENS names
			await axios.get(`${baseURL}/api/getENS/${myAddress}`);
			await mutate(['eas/vote/list', contributionUIds]);
		} catch (err: any) {
			console.error('onVote error', err);
			if (err.code && err.code === 'ACTION_REJECTED') {
				showToast('Unsuccessful: Signing request rejected by you', 'error');
				return;
			}
		} finally {
			closeGlobalLoading();
		}
	};

	const getVoteResult = () => {
		const voters: string[] = [];
		const voterValues: number[] = [];
		for (const [signer, value] of Object.entries(voteData || {})) {
			voters.push(signer);
			voterValues.push(value);
		}
		return {
			voters: voters,
			voterValues: voterValues,
		};
	};

	const handleClaim = () => {
		if (!myAddress) {
			openConnectModal?.();
			return false;
		}
		const own = contributorList.find((contributor) => contributor.wallet === myAddress);
		if (!own) {
			showToast(`You can't claim as you're not in the project.`);
			return false;
		}
		// 非本人的不允许claim
		if (contribution.toIds[0] !== operatorId) {
			showToast(`This contribution isn't yours to claim.`, 'error');
			return false;
		}
		const { voters, voterValues } = getVoteResult();

		submitClaim({
			contributionId: contribution.id,
			uId: contribution.uId || ('' as string),
			token: contribution.credit,
			voters: voters,
			voteValues: voterValues,
			toIds: contribution.toIds,
		});
	};

	const submitClaim = async (claimParams: IClaimParams) => {
		const { contributionId, uId, token, voters, voteValues, toIds } = claimParams;
		try {
			openGlobalLoading();
			const claimSchemaUid = EasSchemaMap.claim;

			// 默认选第一个To里面的人
			const toWallet = contributorList.find((item) => item.id === toIds[0])?.wallet as string;
			const signature = await prepareClaim({
				wallet: myAddress as string,
				toWallets: [toWallet],
				chainId: chain?.id as number,
				contributionIds: String(contributionId),
			});

			const schemaEncoder = new SchemaEncoder(EasSchemaTemplateMap.claim);
			const data: EasSchemaData<EasSchemaClaimKey>[] = [
				{ name: 'ProjectAddress', value: projectDetail.id, type: 'address' },
				{
					name: 'ContributionID',
					value: contributionId,
					type: 'bytes32',
				},
				{ name: 'Voters', value: voters, type: 'address[]' },
				{ name: 'VoteChoices', value: voteValues, type: 'uint8[]' },
				{ name: 'Recipient', value: myAddress, type: 'address' },
				{
					name: 'TokenAmount',
					value: ethers.parseUnits(token.toString()),
					type: 'uint256',
				},
				{ name: 'Signatures', value: signature[0], type: 'bytes' },
			];
			const encodedData = schemaEncoder.encodeData(data);
			const attestation = await eas.attest({
				schema: claimSchemaUid,
				data: {
					recipient: myAddress as string,
					expirationTime: BigInt(0),
					revocable: false,
					refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
					data: encodedData,
					value: BigInt(0),
				},
			});
			const updateStatus = await updateContributionStatus(contributionId, {
				type: 'claim',
				uId: uId,
				operatorId: operatorId,
			});
			showToast('Tokens claimed', 'success');
			mutate(contributionListParam);
			mutateGetAllUnClaimedList()
		} catch (err: any) {
			console.error('onClaim error', err);
			if (err.code && err.code === 'ACTION_REJECTED') {
				showToast('Unsuccessful: Signing request rejected by you', 'error');
				return;
			}
			showToast('Unsuccessful: transaction rejected by you or insufficient gas fee', 'error');
		} finally {
			closeGlobalLoading();
		}
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
		if (isEnd) {
			return false;
		}
		setShowEdit(true);
		handleClosePopover();
	};

	const onDelete = () => {
		showDeleteDialog(contribution.id, contribution.uId!);
		handleClosePopover();
	};

	const onCancel = useCallback(() => {
		setShowEdit(false);
	}, []);

	const onPost = useCallback(async () => {
		// 直接创建一个新的contribution, 但先不先 revoke 旧的（避免多唤起一次钱包进行确认）
		// DB：先把状态改为最初的状态，然后再改uId
		// await eas.revokeOffchain(contribution.uId!);
		// post new contribution -> update DB status -> revoke old contribution
	}, [contribution]);

	return (
		<>
			<StyledFlexBox
				sx={{
					alignItems: 'flex-start',
					paddingTop: '16px',
					display: showEdit ? 'none' : 'flex',
				}}
			>
				<StyledFlexBox sx={{ marginRight: '16px', maxWidth: '94px' }}>
					{showSelect ? (
						<Checkbox
							checked={selected.includes(contribution.id)}
							onChange={handleCheckboxChange}
						/>
					) : null}
					<Link href={`/profile/${contributionOwner.wallet}`}>
						<Img3
							src={contributionOwner.user.avatar || LogoImage}
							style={{
								width: '48px',
								height: '48px',
								borderRadius: '48px',
								// border: '1px solid rgba(15,23,42,0.12)',
							}}
						/>
					</Link>
				</StyledFlexBox>
				<div style={{ flex: 1 }}>
					<StyledFlexBox sx={{ height: 28, justifyContent: 'space-between' }}>
						<StyledFlexBox>
							<Link href={`/profile/${contributionOwner.wallet}`}>
								<Typography variant={'body1'} sx={{ fontWeight: 500 }}>
									{contributionOwner.nickName}
								</Typography>
							</Link>
							<Typography
								variant={'body2'}
								sx={{ marginLeft: '12px', color: '#64748B' }}
							>
								{formatDistance(new Date(contribution.createAt), new Date(), {
									includeSeconds: false,
									addSuffix: true,
								})}
							</Typography>
						</StyledFlexBox>
						<StyledFlexBox>
							<StatusText
								contribution={contribution}
								onClaim={handleClaim}
								hasVoted={voteResult.hasVoted}
								isEnd={isEnd}
								votePass={isVotePass}
								isVoteResultFetched={isVoteResultFetched}
								timeLeft={timeLeft}
							/>
							<Tooltip title="View on chain" placement="top" arrow={true}>
								<Link
									href={EasLink}
									target={'_blank'}
									style={{ cursor: 'pointer', margin: '0 24px' }}
								>
									<EasLogoIcon width={52} height={24} />
								</Link>
							</Tooltip>

							<div>
								<IconButton size="small" onClick={handleOpenMorePopover}>
									<MoreIcon width={24} height={24} />
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
											{/* hide edit entry 2024.07.24 */}
											{/*{isEnd ? null : (*/}
											{/*	<ListItem disablePadding>*/}
											{/*		<ListItemButton*/}
											{/*			onClick={onEdit}*/}
											{/*			disabled={!isOwner}*/}
											{/*		>*/}
											{/*			Edit*/}
											{/*		</ListItemButton>*/}
											{/*	</ListItem>*/}
											{/*)}*/}

											<ListItem disablePadding>
												<ListItemButton
													onClick={onDelete}
													disabled={!isOwner}
												>
													Revoke
												</ListItemButton>
											</ListItem>
										</List>
									</Paper>
								</Popover>
							</div>
						</StyledFlexBox>
					</StyledFlexBox>
					{/*<Typography sx={{ margin: '2px 0 12px' }}>{contribution.detail}</Typography>*/}
					<ReactQuill
						style={{ margin: '2px 0 12px' }}
						value={contribution.detail}
						readOnly={true}
						modules={{ toolbar: false }}
					/>
					<StyledFlexBox sx={{ justifyContent: 'space-between' }}>
						<StyledFlexBox>
							{/*pizza status*/}

							<Pizza
								credit={contribution.credit}
								status={contribution.status}
								votePass={isVotePass}
								isEnd={isEnd}
							/>

							{/*type*/}

							<CustomHoverButton
								sx={{
									marginLeft: '8px',
									cursor: contribution.type?.length > 2 ? 'pointer' : 'auto',
								}}
							>
								<Types
									types={contribution.type}
									contributionTypeList={contributionTypeList}
								/>
							</CustomHoverButton>

							{/*proof*/}

							<>
								<CustomHoverButton
									sx={{ cursor: 'pointer', marginLeft: '8px' }}
									onClick={handleOpenProofPopover}
								>
									<Typography
										variant={'body2'}
										sx={{
											fontWeight: '400',
											color: '#475569',
											marginLeft: '4px',
											whiteSpace: 'nowrap',
										}}
									>
										📁 Proof
									</Typography>
								</CustomHoverButton>
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
										<ReactQuill
											style={{ margin: '2px 0 12px' }}
											value={contribution.proof}
											readOnly={true}
											modules={{ toolbar: false }}
										/>

										<Divider />

										<StyledFlexBox
											sx={{
												marginTop: '16px',
												gap: '8px',
												flexWrap: 'wrap',
											}}
										>
											{contribution.imageList &&
											contribution.imageList.length > 0
												? contribution.imageList.map((url) => {
														return (
															<ImageItem
																key={url}
																onClick={() => {
																	setOpenPreviewImage(true);
																	setPreviewUrl(url);
																}}
															>
																<img
																	src={url}
																	width={48}
																	height={48}
																	style={{ objectFit: 'cover' }}
																	alt="image"
																/>
															</ImageItem>
														);
												  })
												: null}
										</StyledFlexBox>
									</Paper>
								</Popover>

								{contribution.imageList && contribution.imageList.length > 0 ? (
									<PreviewImageModal
										open={openPreviewImage}
										url={previewUrl}
										onClose={() => {
											setOpenPreviewImage(false);
											setPreviewUrl('');
										}}
									/>
								) : null}
							</>

							{/*contributors*/}

							<>
								<CustomHoverButton
									sx={{ cursor: 'pointer', marginLeft: '8px' }}
									onClick={handleOpenContributorPopover}
								>
									<Typography
										variant={'body2'}
										sx={{
											fontWeight: '400',
											color: '#475569',
											whiteSpace: 'nowrap',
										}}
									>
										👨‍💻 {toContributors}
									</Typography>
								</CustomHoverButton>
								<Popover
									id={'simple-popover-contributor'}
									open={openContributor}
									anchorEl={anchorEl}
									onClose={handleClosePopover}
									anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
									transformOrigin={{ vertical: 'top', horizontal: 'left' }}
									disableRestoreFocus
								>
									<Paper sx={{ padding: '12px', maxWidth: '500px' }}>
										<MiniContributorList contributorList={matchContributors} />
									</Paper>
								</Popover>
							</>

							{/*contributionDate*/}
							<>
								<CustomHoverButton sx={{ margin: '0 8px' }}>
									<Typography
										variant={'body2'}
										sx={{
											fontWeight: '400',
											color: '#475569',
											whiteSpace: 'nowrap',
										}}
									>
										{contributionDate}
									</Typography>
								</CustomHoverButton>
							</>
						</StyledFlexBox>

						<StyledFlexBox>
							<VoteAction
								type={VoteTypeEnum.FOR}
								contributionStatus={contribution.status}
								count={voteNumbers.For}
								contribution={contribution}
								onConfirm={() => handleVote(IVoteValueEnum.FOR)}
								isEnd={isEnd}
								isUserVoted={Number(myVoteNumber) === IVoteValueEnum.FOR}
							/>
							<VoteAction
								type={VoteTypeEnum.AGAINST}
								contributionStatus={contribution.status}
								count={voteNumbers.Against}
								contribution={contribution}
								onConfirm={() => handleVote(IVoteValueEnum.AGAINST)}
								isEnd={isEnd}
								isUserVoted={Number(myVoteNumber) === IVoteValueEnum.AGAINST}
							/>
							<VoteAction
								type={VoteTypeEnum.ABSTAIN}
								contributionStatus={contribution.status}
								count={voteNumbers.Abstain}
								contribution={contribution}
								onConfirm={() => handleVote(IVoteValueEnum.ABSTAIN)}
								isEnd={isEnd}
								isUserVoted={Number(myVoteNumber) === IVoteValueEnum.ABSTAIN}
							/>
						</StyledFlexBox>
					</StyledFlexBox>
					{!showEdit ? <Divider sx={{ marginTop: '24px' }} /> : null}
				</div>
			</StyledFlexBox>

			{showEdit ? (
				<PostContribution
					isEdit={true}
					projectId={projectDetail.id}
					contribution={contribution}
					onCancel={onCancel}
					selectedContributors={matchContributors}
				/>
			) : null}
		</>
	);
};

export default ContributionItem;

export const CustomHoverButton = styled(StyledFlexBox)({
	borderRadius: 4,
	height: 28,
	padding: '0 8px',
	border: '0.5px solid rgba(15, 23, 42, 0.16)',
	'&:hover': {
		backgroundColor: 'rgba(203, 213, 225, .3)',
	},
});
const ImageItem = styled('div')({
	width: '48px',
	height: '48px',
	borderRadius: '4px',
	overflow: 'hidden',
	position: 'relative',
	cursor: 'pointer',
});
