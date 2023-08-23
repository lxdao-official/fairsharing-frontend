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

interface Row {
	name: string;
	walletAddress: string;
	role: string;
}

const StepContributor = forwardRef<StepContributorRef, IStepContributorProps>((props, ref) => {
	const { step, setActiveStep } = props;
	const [contributors, setContributors] = useState([]);

	const [data, setData] = useState<Row[]>([{ name: '', walletAddress: '', role: roles[0] }]);

	const handleNameChange = (index: number, value: string) => {
		const newData = [...data];
		newData[index].name = value;
		setData(newData);
	};

	const handleWalletAddressChange = (index: number, value: string) => {
		const newData = [...data];
		newData[index].walletAddress = value;
		setData(newData);
	};

	const handleRoleChange = (index: number, value: string) => {
		const newData = [...data];
		newData[index].role = value;
		setData(newData);
	};

	const handleAddRow = () => {
		setData([...data, { name: '', walletAddress: '', role: roles[0] }]);
	};

	const handleDeleteRow = (index: number) => {
		const newData = data.filter((_, i) => i !== index);
		setData(newData);
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
			<Typography variant={'h4'}>Contributors</Typography>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Wallet Address</TableCell>
							<TableCell>Role</TableCell>
							<TableCell>Action</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{data.map((row, index) => (
							<TableRow key={index}>
								<TableCell>
									<TextField
										value={row.name}
										onChange={(e) => handleNameChange(index, e.target.value)}
									/>
								</TableCell>
								<TableCell>
									<TextField
										value={row.walletAddress}
										onChange={(e) =>
											handleWalletAddressChange(index, e.target.value)
										}
									/>
								</TableCell>
								<TableCell>
									<FormControl>
										<Select
											value={row.role}
											onChange={(e) =>
												handleRoleChange(index, e.target.value)
											}
										>
											{roles.map((role, idx) => (
												<MenuItem key={idx} value={role}>
													{role}
												</MenuItem>
											))}
										</Select>
									</FormControl>
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
				<Button variant="outlined" onClick={handleAddRow}>
					Add Row
				</Button>
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
