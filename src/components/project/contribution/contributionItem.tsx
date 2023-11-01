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
	styled,
	Tooltip,
	Typography,
} from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { Img3 } from '@lxdao/img3';
import { formatDistance } from 'date-fns';

import Link from 'next/link';
import MuiLink from '@mui/material/Link';

import { useAccount, useNetwork } from 'wagmi';

import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

import { useConnectModal } from '@rainbow-me/rainbowkit';

import axios from 'axios';

import { useSWRConfig } from 'swr';

import { ethers } from 'ethers';

import StatusText from '@/components/project/contribution/statusText';
import Pizza from '@/components/project/contribution/pizza';
import { StyledFlexBox } from '@/components/styledComponents';
import { IContribution, IContributor, IProject } from '@/services/types';
import VoteAction, { VoteTypeEnum } from '@/components/project/contribution/voteAction';
import PostContribution from '@/components/project/contribution/postContribution';
import {
	IClaimParams,
	IVoteParams,
	IVoteValueEnum,
} from '@/components/project/contribution/contributionList';
import { EasAttestation, EasAttestationData, EasAttestationDecodedData } from '@/services/eas';
import {
	EAS_CHAIN_CONFIGS,
	EasSchemaClaimKey,
	EasSchemaData,
	EasSchemaMap,
	EasSchemaTemplateMap,
	EasSchemaVoteKey,
} from '@/constant/eas';
import { closeGlobalLoading, openGlobalLoading, showToast } from '@/store/utils';
import MiniContributorList from '@/components/project/contribution/miniContributorList';
import { EasLogoIcon, FileIcon, LinkIcon, MoreIcon } from '@/icons';
import { useUserStore } from '@/store/user';
import useEas from '@/hooks/useEas';
import { useEthersProvider, useEthersSigner } from '@/common/ether';

import { prepareClaim, updateContributionStatus } from '@/services';
import { LogoImage } from '@/constant/img3';
import useCountDownTime from '@/hooks/useCountdownTime';

/**
 * Record<signer, IVoteValueEnum>
 */
export type IVoteData = Record<string, IVoteValueEnum>;

export interface IContributionItemProps {
	contribution: IContribution;
	projectDetail: IProject;
	showSelect: boolean;
	selected: number[];
	onSelect: (idList: number[]) => void;
	showDeleteDialog: (contributionId: number) => void;
	contributorList: IContributor[];
	contributionList: IContribution[];
	voteData: IVoteData | null;
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
	} = props;

	const { myInfo } = useUserStore();
	const { chain } = useNetwork();
	const { eas, getEasScanURL, submitSignedAttestation } = useEas();
	const signer = useEthersSigner();
	const provider = useEthersProvider();
	const { address: myAddress } = useAccount();
	const { openConnectModal } = useConnectModal();
	const { mutate } = useSWRConfig();

	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const [openMore, setOpenMore] = useState(false);
	const [openProof, setOpenProof] = useState(false);
	const [openContributor, setOpenContributor] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const { targetTime, isEnd, timeLeft } = useCountDownTime(
		contribution.createAt,
		projectDetail.votePeriod,
		10000,
	);

	const voteNumbers = useMemo(() => {
		let For = 0,
			Against = 0,
			Abstain = 0;
		for (const [signer, voteNumber] of Object.entries(voteData || {})) {
			if (voteNumber === IVoteValueEnum.FOR) {
				For += 1;
			} else if (voteNumber === IVoteValueEnum.AGAINST) {
				Against += 1;
			} else if (voteNumber === IVoteValueEnum.ABSTAIN) {
				Abstain += 1;
			}
		}
		return { For, Against, Abstain };
	}, [voteData]);

	const myVoteNumber = useMemo(() => {
		return voteData?.[myAddress!] || 9999;
	}, [voteData, myAddress]);

	const EasLink = useMemo(() => {
		const activeChainConfig =
			EAS_CHAIN_CONFIGS.find((config) => config.chainId === chain?.id) ||
			EAS_CHAIN_CONFIGS[2];
		return `${activeChainConfig.etherscanURL}/offchain/attestation/view/${contribution.uId}`;
	}, [contribution, chain]);

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

	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const checked = event.target.checked;
		const newList = checked
			? [...selected, contribution.id]
			: selected.filter((id) => Number(id) !== Number(contribution.id));
		onSelect(newList);
	};

	const handleVote = (voteValue: IVoteValueEnum) => {
		if (!myAddress) {
			openConnectModal?.();
			return false;
		}
		if (!contribution.uId) {
			console.error('uId not exist');
			return false;
		}
		if (contribution.status === 'UNREADY') {
			showToast(`Contribution is not ready!`, 'error');
			return false;
		}
		// 投票时间结束后，不允许继续Vote
		if (Date.now() >= targetTime) {
			showToast(`Vote ended, can't vote`, 'error');
			return false;
		}
		if (contribution.status === 'CLAIM') {
			showToast(`Can't vote after the contribution is claimed!`, 'error');
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
			const offchain = await eas.getOffchain();
			const voteSchemaUid = EasSchemaMap.vote;

			const schemaEncoder = new SchemaEncoder(EasSchemaTemplateMap.vote);
			const data: EasSchemaData<EasSchemaVoteKey>[] = [
				{ name: 'ProjectAddress', value: projectDetail.id, type: 'address' },
				{ name: 'ContributionID', value: contributionId, type: 'uint64' },
				{ name: 'VoteChoice', value: value, type: 'uint8' },
				{ name: 'Comment', value: 'Good contribution', type: 'string' },
			];
			const encodedData = schemaEncoder.encodeData(data);
			const block = await provider.getBlock('latest');
			if (!signer) {
				return;
			}
			const offchainAttestation = await offchain.signOffchainAttestation(
				{
					recipient: '0x0000000000000000000000000000000000000000',
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
			console.log('vote offchainAttestation', offchainAttestation);

			const res = await submitSignedAttestation({
				signer: myAddress as string,
				sig: offchainAttestation,
			});
			console.log('vote submitSignedAttestation', res);
			if (res.data.error) {
				console.error('vote submitSignedAttestation fail', res.data);
				throw new Error(res.data.error);
			}
			showToast('Vote success', 'success');
			const baseURL = getEasScanURL();
			// Update ENS names
			await axios.get(`${baseURL}/api/getENS/${myAddress}`);
			await mutate(['eas/vote/list', contributionUIds]);
		} catch (e) {
			console.error('onVote error', e);
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
				{ name: 'ContributionID', value: contributionId, type: 'uint64' },
				{ name: 'Voters', value: voters, type: 'address[]' },
				{ name: 'VoteChoices', value: voteValues, type: 'uint8[]' },
				{ name: 'Recipient', value: myAddress, type: 'address' },
				{ name: 'Token', value: ethers.parseUnits(token.toString()), type: 'uint256' },
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
			console.log('onchainAttestation:', attestation);
			const updateStatus = await updateContributionStatus(contributionId, {
				type: 'claim',
				uId: uId,
				operatorId: operatorId,
			});
			showToast('Claim success', 'success');
			await mutate(['contribution/list', projectDetail.id]);
		} catch (err: any) {
			console.error('onClaim error', err);
			if (err.message) {
				showToast(err.message, 'error');
			}
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
		showDeleteDialog(contribution.id);
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
							checked={selected.includes(Number(contribution.id))}
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
								border: '1px solid rgba(15,23,42,0.12)',
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
								votePass={voteResult.votePass}
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
											{isEnd ? null : (
												<ListItem disablePadding>
													<ListItemButton onClick={onEdit} disabled={!isOwner}>
														Edit
													</ListItemButton>
												</ListItem>
											)}

											<ListItem disablePadding>
												<ListItemButton onClick={onDelete} disabled={!isOwner}>
													Revoke
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

							<Pizza
								credit={contribution.credit}
								status={contribution.status}
								votePass={voteResult.votePass}
								isEnd={isEnd}
							/>

							{/*proof*/}

							<>
								<CustomHoverButton
									sx={{ cursor: 'pointer', margin: '0 8px' }}
									onClick={handleOpenProofPopover}
								>
									<FileIcon width={14} height={14} />
									<Typography
										variant={'body2'}
										sx={{
											fontWeight: '500',
											color: '#475569',
											marginLeft: '4px',
										}}
									>
										Proof
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
										{contribution.proof.split(',').map((proof) => (
											<Typography component="p" key={proof}>
												<MuiLink
													href={proof}
													target={'_blank'}
													underline={'hover'}
												>
													<LinkIcon
														width={16}
														height={16}
														style={{ marginRight: 8 }}
													/>
													{proof}
												</MuiLink>
											</Typography>
										))}
									</Paper>
								</Popover>
							</>

							{/*contributors*/}

							<>
								<CustomHoverButton
									sx={{ cursor: 'pointer', margin: '0 8px' }}
									onClick={handleOpenContributorPopover}
								>
									<Typography
										variant={'body2'}
										sx={{ fontWeight: '500', color: '#475569' }}
									>
										@{toContributors}
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
						</StyledFlexBox>

						<StyledFlexBox>
							<VoteAction
								type={VoteTypeEnum.FOR}
								contributionStatus={contribution.status}
								count={voteNumbers.For}
								contribution={contribution}
								onConfirm={() => handleVote(IVoteValueEnum.FOR)}
								isEnd={isEnd}
								isUserVoted={myVoteNumber === IVoteValueEnum.FOR}
							/>
							<VoteAction
								type={VoteTypeEnum.AGAINST}
								contributionStatus={contribution.status}
								count={voteNumbers.Against}
								contribution={contribution}
								onConfirm={() => handleVote(IVoteValueEnum.AGAINST)}
								isEnd={isEnd}
								isUserVoted={myVoteNumber === IVoteValueEnum.AGAINST}
							/>
							<VoteAction
								type={VoteTypeEnum.ABSTAIN}
								contributionStatus={contribution.status}
								count={voteNumbers.Abstain}
								contribution={contribution}
								onConfirm={() => handleVote(IVoteValueEnum.ABSTAIN)}
								isEnd={isEnd}
								isUserVoted={myVoteNumber === IVoteValueEnum.ABSTAIN}
							/>
						</StyledFlexBox>
					</StyledFlexBox>
					{!showEdit ? <Divider sx={{ marginTop: '24px' }} /> : null}
				</div>
			</StyledFlexBox>

			{showEdit ? (
				<PostContribution
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
