import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	FormControl,
	IconButton,
	InputAdornment,
	MenuItem,
	Paper,
	Select,
	styled,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import { isAddress as checksumIsAddress } from 'web3-validator';

import { useAccount } from 'wagmi';

import { StyledFlexBox } from '@/components/styledComponents';
import { IStepBaseProps } from '@/components/createProject/step/start';

import { Contributor, PermissionEnum } from '@/services/project';
import { showToast } from '@/store/utils';
import { IContributor, VoteSystemEnum } from '@/services';
import ButtonGroup from '@/components/createProject/step/buttonGroup';
import { DeleteIcon } from '@/icons';
import { isAdmin } from '@/utils/member';
import {
	DialogButton,
	DialogConfirmButton,
} from '@/components/project/contribution/contributionList';
import useProjectCache from '@/components/createProject/useProjectCache';

export interface IStepContributorProps extends Partial<IStepBaseProps> {
	data?: IContributor[];
	onSave?: () => void;
	canEdit?: boolean;
	isActive: boolean;
	voteSystem?: VoteSystemEnum;
}

export interface StepContributorFormData {
	contributors: Contributor[];
}

export interface StepContributorRef {
	getFormData: () => StepContributorFormData;
}

const StepContributor = forwardRef<StepContributorRef, IStepContributorProps>((props, ref) => {
	const { step, setActiveStep, onCreateProject, data, onSave, canEdit, isActive, voteSystem } =
		props;
	const { address: myAddress } = useAccount();
	const { setCache, cache: createProjectCache } = useProjectCache();

	const [contributors, setContributors] = useState<Contributor[]>(
		data
			? data.map((item) => {
					return {
						...item,
						voteWeight: item.voteWeight * 100,
					};
			  })
			: [
					{
						nickName: '',
						wallet: myAddress || '',
						role: '',
						permission: PermissionEnum.Admin,
						voteWeight: 1,
					},
			  ],
	);

	const oldContributorIdMap = useMemo(() => {
		if (!contributors || contributors.length === 0) return {};
		return contributors.reduce(
			(pre, currentValue) => {
				if (currentValue.id) {
					return {
						...pre,
						[currentValue.id]: true,
					};
				}
				return pre;
			},
			{} as Record<string, boolean>,
		);
	}, [contributors]);

	const [isEdited, setIsEdited] = useState(false);
	const [showRevokeOwnerDialog, setShowRevokeOwnerDialog] = useState(false);

	const isSettingPage = !!data;

	useEffect(() => {
		if (!isSettingPage && createProjectCache?.contributor) {
			setContributors(createProjectCache.contributor.contributors);
		}
	}, []);

	const isContributorRepeat = useMemo(() => {
		const wallets = contributors.map((item) => item.wallet);
		const unique = Array.from(new Set(wallets));
		return unique.length !== contributors.length;
	}, [contributors]);

	const isOwnerAdminDeleted = useMemo(() => {
		const ownerInfo = contributors.find((item) => item.wallet === myAddress);
		if (!ownerInfo) return true;
		return !isAdmin(ownerInfo.permission);
	}, [myAddress, contributors]);

	const showWeight = useMemo(() => {
		return !(voteSystem && voteSystem === VoteSystemEnum.EQUAL);
	}, [voteSystem]);

	const handleSubmit = (action: 'BACK' | 'NEXT') => {
		if (action === 'BACK') {
			setActiveStep!(step! - 1);
			return;
		}
		if (!validContributors()) {
			return false;
		}
		if (isContributorRepeat) {
			showToast('Duplicate wallet address', 'error');
			return false;
		}
		if (contributors.filter((item) => isAdmin(item.permission)).length === 0) {
			showToast('At least one admin is required', 'error');
			return false;
		}
		if (isOwnerAdminDeleted && !showRevokeOwnerDialog) {
			setShowRevokeOwnerDialog(true);
			return false;
		}
		if (isSettingPage) {
			onSave?.();
			setIsEdited(false);
		} else {
			setCache('contributor', { contributors });
			onCreateProject?.();
		}
	};

	const validContributors = () => {
		let valid = true;
		contributors.forEach((item) => {
			const { nickName, wallet, permission } = item;
			if (!nickName) {
				showToast('Nickname is required', 'error');
				valid = false;
				return false;
			}
			if (!wallet) {
				valid = false;
				showToast('Wallet address is required', 'error');
				return false;
			}
			if (!checksumIsAddress(wallet, true)) {
				valid = false;
				showToast(`"${wallet}" isn’t a valid wallet address`, 'error');
				return false;
			}
		});
		return valid;
	};

	const changeContributors = (newData: Contributor[]) => {
		setIsEdited(true);
		setContributors(newData);
	};

	const handleNameChange = (index: number, value: string) => {
		const newData = [...contributors];
		newData[index].nickName = value;
		changeContributors(newData);
	};

	const handleWalletAddressChange = (index: number, value: string) => {
		const newData = [...contributors];
		newData[index].wallet = value;
		changeContributors(newData);
	};

	const handleRoleChange = (index: number, value: string) => {
		const newData = [...contributors];
		newData[index].role = value;
		changeContributors(newData);
	};

	const handleVoteWeightChange = (index: number, value: string) => {
		const newData = [...contributors];
		// 只允许正整数
		newData[index].voteWeight = Math.floor(Number(value));
		changeContributors(newData);
	};

	const handlePermissionChange = (index: number, value: PermissionEnum) => {
		const newData = [...contributors];
		newData[index].permission = value;
		changeContributors(newData);
	};

	const handleAddRow = () => {
		changeContributors([
			...contributors,
			{
				nickName: '',
				wallet: '',
				role: '',
				permission: PermissionEnum.Contributor,
				voteWeight: 1,
			},
		]);
	};

	const handleDeleteRow = (index: number) => {
		if (contributors.length <= 1) {
			return false;
		}
		if (!canEdit) {
			return false;
		}
		const newData = contributors.filter((_, i) => i !== index);
		changeContributors(newData);
	};

	const handleClick = (type: 'primary' | 'secondary') => {
		const action = type === 'primary' ? 'NEXT' : 'BACK';
		if (!isSettingPage) {
			handleSubmit(action);
			return;
		}
		if (!canEdit) {
			return;
		}
		if (type === 'primary') {
			handleSubmit(action);
		} else {
			setIsEdited(false);
			setContributors(data ?? []);
		}
	};

	const onCloseDialog = () => {
		setShowRevokeOwnerDialog(false);
	};

	const onRevokeOwnerAdmin = () => {
		handleSubmit('NEXT');
		setShowRevokeOwnerDialog(false);
	};

	useImperativeHandle(
		ref,
		() => ({
			getFormData: () => ({ contributors }),
		}),
		[contributors],
	);

	return (
		<>
			{!isSettingPage ? (
				<>
					<Typography variant={'h4'} sx={{ fontWeight: '500' }}>
						Who can post contribution and vote?
					</Typography>
					<Typography variant={'h4'} sx={{ marginTop: '16px', fontWeight: '500' }}>
						Contributors
					</Typography>
				</>
			) : null}

			<TableContainer
				component={Paper}
				sx={{ marginTop: '8px', marginBottom: '4px', boxShadow: 'none' }}
			>
				<Table>
					<TableHead sx={{ height: '40px', backgroundColor: '#F1F5F9' }}>
						<TableRow>
							<TableCell>NickName*</TableCell>
							<TableCell>Wallet Address*</TableCell>
							<TableCell>Permission</TableCell>
							<TableCell>Role</TableCell>
							{showWeight ? <TableCell>Vote weight</TableCell> : null}
							<TableCell>Action</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{contributors.map((row, index) => (
							<TableRow key={index}>
								<StyledTableCell>
									<TextField
										size="small"
										value={row.nickName}
										disabled={!canEdit}
										onChange={(e) => handleNameChange(index, e.target.value)}
										sx={{ maxWidth: 120 }}
									/>
								</StyledTableCell>
								<StyledTableCell>
									{!canEdit || !!(row.id && oldContributorIdMap[row.id]) ? (
										<Tooltip title={row.wallet} placement={'top'}>
											<TextField
												size="small"
												value={row.wallet}
												disabled={true}
												sx={{ maxWidth: 300, minWidth: 120 }}
											/>
										</Tooltip>
									) : (
										<TextField
											size="small"
											value={row.wallet}
											onChange={(e) =>
												handleWalletAddressChange(index, e.target.value)
											}
											sx={{ maxWidth: 300, minWidth: 120 }}
										/>
									)}
								</StyledTableCell>
								<StyledTableCell>
									<FormControl>
										<Select
											size="small"
											value={row.permission}
											disabled={!canEdit}
											onChange={(e) =>
												handlePermissionChange(
													index,
													e.target.value as PermissionEnum,
												)
											}
											sx={{ width: 140 }}
										>
											{/*<MenuItem value={PermissionEnum.Owner} disabled>*/}
											{/*	Owner*/}
											{/*</MenuItem>*/}
											<MenuItem value={PermissionEnum.Admin}>Admin</MenuItem>
											<MenuItem value={PermissionEnum.Contributor}>
												Contributor
											</MenuItem>
										</Select>
									</FormControl>
								</StyledTableCell>
								<StyledTableCell>
									<TextField
										size="small"
										value={row.role}
										disabled={!canEdit}
										onChange={(e) => handleRoleChange(index, e.target.value)}
									/>
								</StyledTableCell>
								{showWeight ? (
									<StyledTableCell>
										<TextField
											size="small"
											value={row.voteWeight}
											disabled={!canEdit}
											onChange={(e) =>
												handleVoteWeightChange(index, e.target.value)
											}
											InputProps={{
												disableUnderline: true,
												endAdornment: (
													<InputAdornment position="end">
														<Typography variant="body1">%</Typography>
													</InputAdornment>
												),
											}}
										/>
									</StyledTableCell>
								) : null}
								<StyledTableCell>
									<IconButton
										onClick={() => handleDeleteRow(index)}
										sx={{
											opacity:
												contributors.length > 1 && canEdit ? '1' : '.5',
											cursor:
												contributors.length > 1 && canEdit
													? 'pointer'
													: 'not-allowed',
										}}
									>
										<DeleteIcon />
									</IconButton>
								</StyledTableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{canEdit ? (
				<AddRow onClick={handleAddRow}>
					<AddIcon sx={{ fontSize: '14px', color: '#475569' }} />
					<Typography variant={'body2'} color={'#475569'}>
						Add
					</Typography>
				</AddRow>
			) : null}

			<ButtonGroup
				canEdit={!!canEdit}
				isEdited={isEdited}
				isSettingPage={isSettingPage}
				isLatest
				handlePrimary={() => handleClick('primary')}
				handleSecondary={() => handleClick('secondary')}
			/>

			<Dialog
				open={showRevokeOwnerDialog}
				onClose={onCloseDialog}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Are you sure to revoke your admin permission?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<DialogButton onClick={onCloseDialog} variant={'outlined'}>
						Cancel
					</DialogButton>
					<DialogConfirmButton onClick={onRevokeOwnerAdmin} autoFocus>
						Revoke
					</DialogConfirmButton>
				</DialogActions>
			</Dialog>
		</>
	);
});

StepContributor.displayName = 'StepContributor';

export default StepContributor;

const StyledTableCell = styled(TableCell)({
	borderBottom: 'none',
});

const AddRow = styled(StyledFlexBox)({
	height: '32px',
	justifyContent: 'center',
	cursor: 'pointer',
	borderRadius: '2px',
	border: '.5px dotted #0F172A29',
	'&:hover': {
		border: '1px dotted #212121',
	},
});
