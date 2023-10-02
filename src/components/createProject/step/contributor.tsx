import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';

import {
	Button,
	FormControl,
	IconButton,
	MenuItem,
	Paper,
	Select,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { StyledFlexBox } from '@/components/styledComponents';
import { IStepBaseProps } from '@/components/createProject/step/start';

import { Contributor, PermissionEnum } from '@/services/project';
import { showToast } from '@/store/utils';
import { IContributor } from '@/services';
import ButtonGroup from '@/components/createProject/step/buttonGroup';

export interface IStepContributorProps extends Partial<IStepBaseProps> {
	data?: IContributor[];
	onSave?: () => void;
	canEdit?: boolean;
}

export interface StepContributorRef {
	getFormData: () => {
		contributors: Contributor[];
	};
}

const StepContributor = forwardRef<StepContributorRef, IStepContributorProps>((props, ref) => {
	const { step, setActiveStep, onCreateProject, data, onSave, canEdit = true } = props;

	const [contributors, setContributors] = useState<Contributor[]>(
		data ?? [
			{
				nickName: '',
				wallet: '',
				role: '',
				permission: PermissionEnum.Owner,
			},
		],
	);

	const [isEdited, setIsEdited] = useState(false);

	const isSettingPage = !!data;

	const handleSubmit = (action: 'BACK' | 'NEXT') => {
		if (action === 'BACK') {
			setActiveStep!(step! - 1);
			return;
		}
		if (!validContributors()) {
			return false;
		}
		if (isContributorRepeat) {
			showToast('Repeated [wallet] address', 'error');
			return false;
		}
		if (isSettingPage) {
			onSave?.();
			setIsEdited(false);
		} else {
			onCreateProject?.();
		}
	};

	const isContributorRepeat = useMemo(() => {
		const wallets = contributors.map((item) => item.wallet);
		const unique = Array.from(new Set(wallets));
		return unique.length !== contributors.length;
	}, [contributors]);

	const validContributors = () => {
		let valid = true;
		contributors.forEach((item) => {
			const { nickName, wallet } = item;
			if (!nickName) {
				showToast('Empty Nickname', 'error');
				valid = false;
				return false;
			}
			if (!wallet) {
				valid = false;
				showToast('Empty [wallet] address', 'error');
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

	const handlePermissionChange = (index: number, value: PermissionEnum) => {
		const newData = [...contributors];
		newData[index].permission = value;
		changeContributors(newData);
	};

	const handleAddRow = () => {
		changeContributors([
			...contributors,
			{ nickName: '', wallet: '', role: '', permission: PermissionEnum.Contributor },
		]);
	};

	const handleDeleteRow = (index: number) => {
		const newData = contributors.filter((_, i) => i !== index);
		changeContributors(newData);
	};

	const handleClick = (type: 'primary' | 'secondary') => {
		const action = type === 'primary' ? 'NEXT' : 'BACK';
		if (!isSettingPage) {
			handleSubmit(action);
			return;
		}
		if (type === 'primary') {
			handleSubmit(action);
		} else {
			setIsEdited(false);
			setContributors(data ?? []);
		}
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
					<Typography variant={'h4'}>Who can post contribution and vote?</Typography>
					<Typography variant={'h4'} sx={{ marginTop: '16px' }}>
						Contributors
					</Typography>
				</>
			) : null}

			<TableContainer component={Paper} sx={{ marginTop: '8px' }}>
				<Table>
					<TableHead sx={{ height: '40px', backgroundColor: '#F1F5F9' }}>
						<TableRow>
							<TableCell width={140}>NickName*</TableCell>
							<TableCell width={300}>Wallet Address*</TableCell>
							<TableCell width={160}>Permission</TableCell>
							<TableCell width={230}>Role</TableCell>
							{contributors.length > 1 ? <TableCell>Action</TableCell> : null}
						</TableRow>
					</TableHead>
					<TableBody>
						{contributors.map((row, index) => (
							<TableRow key={index}>
								<TableCell>
									<TextField
										size="small"
										value={row.nickName}
										disabled={!canEdit}
										onChange={(e) => handleNameChange(index, e.target.value)}
									/>
								</TableCell>
								<TableCell>
									<TextField
										size="small"
										value={row.wallet}
										disabled={!canEdit}
										onChange={(e) =>
											handleWalletAddressChange(index, e.target.value)
										}
									/>
								</TableCell>
								<TableCell>
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
										>
											<MenuItem value={PermissionEnum.Owner}>Owner</MenuItem>
											<MenuItem value={PermissionEnum.Admin}>Admin</MenuItem>
											<MenuItem value={PermissionEnum.Contributor}>
												Contributor
											</MenuItem>
										</Select>
									</FormControl>
								</TableCell>
								<TableCell>
									<TextField
										size="small"
										value={row.role}
										disabled={!canEdit}
										onChange={(e) => handleRoleChange(index, e.target.value)}
									/>
								</TableCell>
								{contributors.length > 1 && canEdit ? (
									<TableCell>
										<IconButton onClick={() => handleDeleteRow(index)}>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								) : null}
							</TableRow>
						))}
					</TableBody>
				</Table>
				{canEdit ? (
					<StyledFlexBox
						sx={{ height: '32px', justifyContent: 'center', cursor: 'pointer' }}
						onClick={handleAddRow}
					>
						<AddIcon sx={{ fontSize: '14px', color: '#475569' }} />
						<Typography variant={'body2'} color={'#475569'}>
							Add
						</Typography>
					</StyledFlexBox>
				) : null}
			</TableContainer>

			<ButtonGroup
				canEdit={canEdit}
				isEdited={isEdited}
				isSettingPage={isSettingPage}
				isLatest
				handlePrimary={() => handleClick('primary')}
				handleSecondary={() => handleClick('secondary')}
			/>
		</>
	);
});

StepContributor.displayName = 'StepContributor';

export default StepContributor;
