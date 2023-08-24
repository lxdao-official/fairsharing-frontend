import React, { forwardRef, useImperativeHandle, useState } from 'react';

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

import { IStepBaseProps } from '@/components/createProject/step/start';
import { StyledFlexBox } from '@/components/styledComponents';

export interface IStepContributorProps extends IStepBaseProps {}

export interface FromContributor {}

export interface StepContributorRef {
	getFormData: () => {
		contributors: FromContributor[];
	};
}

const roles: string[] = ['Admin', 'User', 'Guest'];

export enum PermissionEnum {
	Admin = 'Admin',
	Contributor = 'Contributor',
}

interface Row {
	name: string;
	walletAddress: string;
	permission: PermissionEnum;
	role: string;
}

const StepContributor = forwardRef<StepContributorRef, IStepContributorProps>((props, ref) => {
	const { step, setActiveStep } = props;
	// const [contributors, setContributors] = useState([]);

	const [contributors, setContributors] = useState<Row[]>([
		{
			name: '',
			walletAddress: '',
			role: '',
			permission: PermissionEnum.Contributor,
		},
	]);

	const handleNameChange = (index: number, value: string) => {
		const newData = [...contributors];
		newData[index].name = value;
		setContributors(newData);
	};

	const handleWalletAddressChange = (index: number, value: string) => {
		const newData = [...contributors];
		newData[index].walletAddress = value;
		setContributors(newData);
	};

	const handleRoleChange = (index: number, value: string) => {
		const newData = [...contributors];
		newData[index].role = value;
		setContributors(newData);
	};

	const handlePermissionChange = (index: number, value: PermissionEnum) => {
		const newData = [...contributors];
		newData[index].permission = value;
		setContributors(newData);
	};

	const handleAddRow = () => {
		setContributors([
			...contributors,
			{ name: '', walletAddress: '', role: '', permission: PermissionEnum.Contributor },
		]);
	};

	const handleDeleteRow = (index: number) => {
		const newData = contributors.filter((_, i) => i !== index);
		setContributors(newData);
	};

	useImperativeHandle(
		ref,
		() => ({
			getFormData: () => ({ contributors }),
		}),
		[contributors],
	);

	const handleCreateProject = () => {
		console.log('handleCreateProject');
	};

	return (
		<>
			<Typography variant={'h4'}>Who can post contribution and vote?</Typography>
			<Typography variant={'h4'} sx={{ marginTop: '16px' }}>
				Contributors
			</Typography>

			<TableContainer component={Paper} sx={{ marginTop: '8px' }}>
				<Table>
					<TableHead sx={{ height: '40px', backgroundColor: '#F1F5F9' }}>
						<TableRow>
							<TableCell width={140}>NickName*</TableCell>
							<TableCell width={300}>Wallet Address*</TableCell>
							<TableCell width={160}>Permission</TableCell>
							<TableCell width={230}>Role</TableCell>
							<TableCell>Action</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{contributors.map((row, index) => (
							<TableRow key={index}>
								<TableCell>
									<TextField
										size="small"
										value={row.name}
										onChange={(e) => handleNameChange(index, e.target.value)}
									/>
								</TableCell>
								<TableCell>
									<TextField
										size="small"
										value={row.walletAddress}
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
											onChange={(e) =>
												handlePermissionChange(
													index,
													e.target.value as PermissionEnum,
												)
											}
										>
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
										onChange={(e) => handleRoleChange(index, e.target.value)}
									/>
								</TableCell>
								<TableCell>
									<IconButton onClick={() => handleDeleteRow(index)}>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{/*<Button variant="outlined" onClick={handleAddRow}>*/}
				{/*	Add Row*/}
				{/*</Button>*/}
				<StyledFlexBox
					sx={{ height: '32px', justifyContent: 'center', cursor: 'pointer' }}
					onClick={handleAddRow}
				>
					<AddIcon sx={{ fontSize: '14px', color: '#475569' }} />
					<Typography variant={'body2'} color={'#475569'}>
						Add
					</Typography>
				</StyledFlexBox>
			</TableContainer>

			<StyledFlexBox sx={{ marginTop: '40px' }}>
				<Button
					variant={'outlined'}
					sx={{ backgroundColor: 'transparent' }}
					onClick={() => setActiveStep(step - 1)}
				>
					Back
				</Button>
				<Button
					variant={'contained'}
					sx={{ marginLeft: '16px' }}
					onClick={handleCreateProject}
				>
					Create
				</Button>
			</StyledFlexBox>
		</>
	);
});

StepContributor.displayName = 'StepContributor';

export default StepContributor;
