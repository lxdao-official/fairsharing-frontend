import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

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

import { useAccount, useContractRead } from 'wagmi';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import { ethers } from 'ethers';

import { TransactionResponse } from '@ethersproject/abstract-provider';

import { useEthersSigner } from '@/common/ether';
import { StyledFlexBox } from '@/components/styledComponents';
import { IStepBaseProps } from '@/components/createProject/step/start';

// @ts-ignore
import project_register_abi = require('../../../../abi/project_register_abi.json');
import process from 'process';

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

export interface IContributor {
	name: string;
	walletAddress: string;
	permission: PermissionEnum;
	role: string;
}

const StepContributor = forwardRef<StepContributorRef, IStepContributorProps>((props, ref) => {
	const { step, setActiveStep } = props;

	const [contributors, setContributors] = useState<IContributor[]>([
		{
			name: '',
			walletAddress: '',
			role: '',
			permission: PermissionEnum.Contributor,
		},
	]);

	const signer = useEthersSigner();
	const { address: myAddress } = useAccount();

	// todo: test
	useContractRead({
		address: '0x5C0340AD34f7284f9272E784FF76638E8dDb5dE4',
		abi: project_register_abi,
		functionName: 'owner',
		onSuccess(data) {
			console.log('get project register owner:', data);
		},
	});

	// const {
	// 	data: registerResult,
	// 	isLoading,
	// 	isSuccess,
	// 	write,
	// } = useContractWrite({
	// 	address: '0x5C0340AD34f7284f9272E784FF76638E8dDb5dE4',
	// 	abi: project_register_abi,
	// 	functionName: 'register',
	// });
	//
	// const waitForTransaction = useWaitForTransaction({
	// 	hash: registerResult?.hash,
	// });

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

	const handleCreateProject = async () => {
		console.log('handleCreateProject', contributors);
		// TODO 合约调用生成 project -> 后端生成
		// 需要考虑 合约调用成功, 但后端调用失败的问题, 需要做好数据同步.
		const owner = myAddress;
		const members = [
			'0x9324AD72F155974dfB412aB6078e1801C79A8b78',
			'0x314eFc96F7c6eCfF50D7A75aB2cde9531D81cbe4',
			'0x6Aa6dC80405d10b0e1386EB34D1A68cB2934c5f3',
		];
		const symbol = 'tokenSymbol';

		const contract = new ethers.Contract(
			`${process.env.NEXT_PUBLIC_CONTRACT}`,
			project_register_abi,
			signer,
		);

		const tx: TransactionResponse = await contract.register(owner, members, symbol);
		const response = await tx.wait(1);
		if (response.status === 1) {
			const result = await contract.register.staticCallResult(owner, members, symbol);
			const projectContract = result[0];
			const pid = result[1];
			console.log('callStatic projectContract:', projectContract, 'pid:', pid);
		}

		// sync to backend
		// const params: CreateProjectParams = {
		// 	logo: '',
		// 	name: '',
		// 	intro: '',
		// 	symbol: '',
		// 	network: 1,
		// 	votePeriod: 1,
		// 	contributors: [],
		// };
		// const result = await createProject(params);
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
				{/*	Add IContributor*/}
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
