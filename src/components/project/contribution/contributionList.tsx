'use client';

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	MenuItem,
	Select,
	SelectChangeEvent,
	styled,
	Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

import { useNetwork } from 'wagmi';

import useSWR from 'swr';

import Checkbox, { CheckboxTypeEnum } from '@/components/checkbox';
import { StyledFlexBox } from '@/components/styledComponents';
import {
	EasAttestation,
	EasAttestationData,
	EasAttestationDecodedData,
	getEASContributionList,
	getEASVoteRecord,
} from '@/services/eas';
import { EasSchemaContributionKey, EasSchemaVoteKey } from '@/constant/eas';
import { useUserStore } from '@/store/user';

import { closeGlobalLoading, openGlobalLoading, showToast } from '@/store/utils';

import {
	deleteContribution,
	getContributionList,
	getContributorList,
	getProjectDetail,
} from '@/services';

import { FilterIcon } from '@/icons';

import CustomCheckbox from '@/components/checkbox';

import useContributionListFilter from '@/components/project/contribution/useContributionListFilter';

import ContributionItem from './contributionItem';

export enum IVoteValueEnum {
	FOR = 1,
	AGAINST = 2,
	ABSTAIN = 3,
}

export interface IVoteParams {
	contributionId: number;
	value: IVoteValueEnum;
	uId: string;
}

export interface IClaimParams {
	contributionId: number;
	uId: string;
	token: number;
	voters: string[];
	voteValues: number[];
	toIds: string[];
}

export interface IContributionListProps {
	projectId: string;
	onUpdate?: () => void;
	showHeader?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
interface BigInt {
	/** Convert to BigInt to string form in JSON.stringify */
	toJSON: () => string;
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

const ContributionList = ({ projectId, showHeader = true }: IContributionListProps) => {
	const { myInfo } = useUserStore();
	const network = useNetwork();

	const [claimTotal, getClaimTotal] = useState(0);
	const [showFilter, setShowFilter] = useState(false);
	const [showMultiSelect, setShowMultiSelect] = useState(false);

	const [selected, setSelected] = useState<Array<number>>([]);
	const [showDialog, setShowDialog] = useState(false);
	const [activeCId, setActiveCId] = useState<number>();

	const { data: projectDetail, mutate: mutateProjectDetail } = useSWR(
		['project/detail', projectId],
		() => getProjectDetail(projectId),
		{
			onSuccess: (data) => console.log('[useSWR] -> getProjectDetail', data),
		},
	);

	const { data: contributorList, mutate: mutateContributorList } = useSWR(
		['contributor/list', projectId],
		() => getContributorList(projectId),
		{
			fallbackData: [],
			onSuccess: (data) => console.log('[useSWR] -> getContributorList', data),
		},
	);

	const { data: contributionList, mutate: mutateContributionList } = useSWR(
		['contribution/list', projectId],
		() => fetchContributionList(projectId),
		{
			fallbackData: [],
			onSuccess: (data) => console.log('[useSWR] -> fetchContributionList', data),
		},
	);

	const contributionUIds = useMemo(() => {
		return contributionList
			.filter((contribution) => !!contribution.uId)
			.map((item) => item.uId) as string[];
	}, [contributionList]);

	const { data: easVoteList } = useSWR(
		['eas/vote/list', contributionUIds],
		() => fetchEasVoteList(contributionUIds),
		{
			fallbackData: [],
			onSuccess: (data) => console.log('[useSWR EAS] -> fetchEasVoteList', data),
		},
	);

	const easVoteMap = useMemo(() => {
		if (easVoteList.length === 0) return {};
		const map = contributionUIds.reduce(
			(pre, cur) => {
				return {
					...pre,
					[cur]: [],
				};
			},
			{} as Record<string, EasAttestation<EasSchemaVoteKey>[]>,
		);
		easVoteList.forEach((item) => {
			map[item.refUID].push(item);
		});
		return map;
	}, [easVoteList, contributionUIds]);

	const operatorId = useMemo(() => {
		if (contributorList.length === 0 || !myInfo) {
			return '';
		}
		return contributorList.filter((contributor) => contributor.userId === myInfo?.id)[0]?.id;
	}, [contributorList, myInfo]);

	const { renderFilter, filterContributionList } = useContributionListFilter({
		contributionList,
		contributorList,
		projectDetail,
		easVoteMap
	});

	useEffect(() => {
		mutateProjectDetail();
		mutateContributorList();
		mutateContributionList();
	}, [projectId]);

	const fetchContributionList = async (projectId: string) => {
		try {
			const { list } = await getContributionList({
				pageSize: 50,
				currentPage: 1,
				projectId: projectId,
			});
			console.log('getContributionList', list);
			return list;
		} catch (err) {
			return Promise.reject(err);
		}
	};

	const fetchEasContributionList = async (uIds: string[]) => {
		try {
			// uids存在才会进行计算
			const ids = uIds.filter((id) => !!id);
			const { attestations } = await getEASContributionList(ids, network.chain?.id);
			const easList = attestations.map((item) => ({
				...item,
				decodedDataJson: JSON.parse(
					item.decodedDataJson as string,
				) as EasAttestationDecodedData<EasSchemaContributionKey>[],
				data: JSON.parse(item.data as string) as EasAttestationData,
			}));
			console.log('EAS Data[graphql] -> ContributionList: ', easList);
		} catch (err) {
			console.error('EAS Data[graphql] -> getEASContributionList error', err);
		}
	};
	const fetchEasVoteList = async (uIds: string[]) => {
		if (uIds.length === 0) return Promise.resolve([]);
		try {
			const { attestations } = await getEASVoteRecord(uIds as string[], network.chain?.id);
			const easVoteList = attestations.map((item) => ({
				...item,
				decodedDataJson: JSON.parse(
					item.decodedDataJson as string,
				) as EasAttestationDecodedData<EasSchemaVoteKey>[],
				data: JSON.parse(item.data as string) as EasAttestationData,
			}));
			return easVoteList;
		} catch (err) {
			console.error('EAS Data[graphql] -> getEASVoteRecord error', err);
			return Promise.reject(err);
		}
	};

	const handleHideSelect = () => {
		setShowMultiSelect(false);
	};

	const onClickFilterBtn = () => {
		setShowFilter((pre) => !pre);
		setShowMultiSelect(false);
	};

	const onClickSelectBtn = () => {
		setShowMultiSelect((pre) => !pre);
		setShowFilter((pre) => !pre);
	};

	const onClickSelectParent = (type: Exclude<CheckboxTypeEnum, 'Partial'>) => {
		console.log('type', type);
		if (type === 'All') {
			setSelected(contributionList.map((item, idx) => item.id));
		} else {
			setSelected([]);
		}
	};

	const onSelect = (idList: number[]) => {
		setSelected(idList);
	};

	const onCloseDialog = () => {
		setShowDialog(false);
	};
	const showDeleteDialog = useCallback((contributionId: number) => {
		setActiveCId(contributionId);
		setShowDialog(true);
	}, []);

	const onDelete = async () => {
		try {
			openGlobalLoading();
			if (!activeCId) return false;
			// TODO 合约也需要revoke
			const res = await deleteContribution(activeCId, operatorId);
			console.log('deleteContribution res', res);
			setShowDialog(false);
			await mutateContributionList();
		} catch (err: any) {
			if (err.message) {
				showToast(err.message, 'error');
			}
			console.error('onDelete error', err);
		} finally {
			closeGlobalLoading();
		}
	};

	return (
		<>
			{showHeader ? (
				<StyledFlexBox sx={{ justifyContent: 'space-between', marginTop: '16px', marginBottom: '16px' }}>
					<Typography variant={'subtitle1'} sx={{ fontWeight: 500 }}>
						Contributions
					</Typography>
					<StyledFlexBox sx={{ cursor: 'pointer' }}>
						<FilterIcon width={24} height={24} onClick={onClickFilterBtn} />
						<Button variant={'outlined'} sx={{ marginLeft: '16px' }}>
							Claim({claimTotal})
						</Button>
					</StyledFlexBox>
				</StyledFlexBox>
			) : null}
			<StyledFlexBox
				sx={{
					marginTop: '16px',
					justifyContent: 'space-between',
					display: showFilter ? 'flex' : 'none',
				}}
			>
				{renderFilter}
				<TextButton onClick={onClickSelectBtn}>Select</TextButton>
			</StyledFlexBox>

			{showMultiSelect ? (
				<StyledFlexBox
					sx={{
						marginTop: '16px',
						marginBottom: '16px',
						justifyContent: 'space-between',
					}}
				>
					<StyledFlexBox>
						<CustomCheckbox
							total={contributionList.length}
							selected={selected.length}
							onChange={onClickSelectParent}
						/>
						<Typography variant={'body1'}>{selected.length} have selected</Typography>
					</StyledFlexBox>
					<StyledFlexBox>
						<StyledButton
							variant="outlined"
							mainColor="#12C29C80"
							textColor="#12C29C"
							hoverColor="rgba(18, 194, 156, 1)"
							startIcon={<DoneOutlinedIcon />}
						>
							For
						</StyledButton>
						<StyledButton
							variant="outlined"
							mainColor="#D32F2F80"
							textColor="#D32F2F"
							hoverColor="rgba(211, 47, 47, 1)"
							startIcon={<ClearOutlinedIcon />}
						>
							Again
						</StyledButton>
						<StyledButton
							variant="outlined"
							mainColor="#0288D180"
							textColor="#437EF7"
							hoverColor="rgba(2, 136, 209, 1)"
							startIcon={<ArrowForwardOutlinedIcon />}
						>
							Abstain
						</StyledButton>
						<StyledButton
							variant="outlined"
							mainColor="#0F172A29"
							textColor="#0F172A"
							hoverColor="rgba(15, 23, 42, 1)"
							onClick={handleHideSelect}
						>
							Cancel
						</StyledButton>
					</StyledFlexBox>
				</StyledFlexBox>
			) : null}

			{projectDetail && contributionList.length > 0
				? contributionList.map((contribution, idx) => (
						<ContributionItem
							key={contribution.id}
							contribution={contribution}
							showSelect={showMultiSelect}
							selected={selected}
							onSelect={onSelect}
							showDeleteDialog={showDeleteDialog}
							projectDetail={projectDetail}
							easVoteList={easVoteMap[contribution.uId as string]}
							contributorList={contributorList}
							contributionList={filterContributionList}
						/>
				  ))
				: null}

			<Dialog
				open={showDialog}
				onClose={onCloseDialog}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Are you sure to revoke this contribution?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<DialogButton onClick={onCloseDialog} variant={'outlined'}>
						Cancel
					</DialogButton>
					<DialogConfirmButton onClick={onDelete} autoFocus>
						Revoke
					</DialogConfirmButton>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default ContributionList;

export const DialogButton = styled(Button)({
	minWidth: 80,
	width: 80,
	height: 34,
	borderRadius: 4,
	padding: 0,
});

export const DialogConfirmButton = styled(DialogButton)({
	backgroundColor: '#0F172A',
	color: '#fff',
	'&:hover': {
		background: 'rgba(15, 23, 42, .8)',
	},
});

const TextButton = styled('span')({
	cursor: 'pointer',
	fontWeight: '500',
	'&:hover': {
		opacity: '0.5',
	},
});

const StyledButton = styled(Button)<{ mainColor: string; textColor: string; hoverColor: string }>(
	({ mainColor, textColor, hoverColor }) => ({
		minWidth: '112px',
		width: '112px',
		height: '40px',
		marginLeft: '12px',
		borderColor: mainColor,
		color: textColor,
		'&:hover': {
			borderColor: hoverColor,
		},
	}),
);
