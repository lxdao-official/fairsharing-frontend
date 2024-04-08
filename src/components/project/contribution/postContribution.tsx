import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
	Autocomplete,
	Button,
	Chip,
	IconButton,
	InputAdornment,
	Paper,
	styled,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

import { ethers } from 'ethers';

import axios from 'axios';

import { useAccount } from 'wagmi';

import { useConnectModal } from '@rainbow-me/rainbowkit';

import useSWR, { useSWRConfig } from 'swr';

import { endOfDay, startOfDay } from 'date-fns';

import Image from 'next/image';

import { MoreHoriz } from '@mui/icons-material';

import { StyledFlexBox } from '@/components/styledComponents';
import { IContribution, IContributor } from '@/services/types';
import { closeGlobalLoading, openGlobalLoading, showToast, useUtilsStore } from '@/store/utils';
import {
	createContribution,
	createContributionType,
	deleteContributionType,
	getContributionTypeList,
	getContributorList,
	getProjectDetail,
	updateContributionStatus,
} from '@/services';
import {
	EasSchemaContributionKey,
	EasSchemaData,
	EasSchemaMap,
	EasSchemaTemplateMap,
	EasSchemaVoteKey,
} from '@/constant/contract';

import { useEthersProvider, useEthersSigner } from '@/common/ether';

import { useUserStore } from '@/store/user';
import useEas from '@/hooks/useEas';
import TokenToolTip from '@/components/project/contribution/tokenToolTip';
import usePostContributionCache, {
	IPostContributionCacheItem,
} from '@/components/project/contribution/usePostContributionCache';
import { TagBgColors, TagColorMap, TagTextColors } from '@/components/project/contribution/tag';
import { DeleteIcon } from '@/icons';
import CustomDialog from '@/components/dialog/customDialog';
import LineStatus from '@/components/dialog/lineStatus';
import { IVoteValueEnum } from '@/components/project/contribution/contributionList';
import { useProjectStore } from '@/store/project';

import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export interface IPostContributionProps {
	projectId: string;
	contribution?: IContribution;
	onCancel?: () => void;
	confirmText?: string;
	refresh?: number;
	selectedContributors?: IContributor[];
	isEdit?: boolean;
	showFullPost?: boolean;
	setShowFullPost?: (show: boolean) => void;
	setIsEditing?: (isEditing: boolean) => void;
}

export interface PostData {
	detail: string;
	proof: string;
	contributors: string[];
	credit: string;
	type: string;
}

export interface AutoCompleteValue {
	label: string;
	id: string;

	[key: string]: any;
}

export const DefaultTypeKudos = '❤️ Give kudos';
const ForCreateTagId = '__for_create__';

const PostContribution = ({
	projectId,
	contribution,
	onCancel,
	confirmText,
	selectedContributors,
	isEdit,
	showFullPost = true,
	setShowFullPost,
	setIsEditing,
}: IPostContributionProps) => {
	const [detail, setDetail] = useState(contribution?.detail || '');
	const [proof, setProof] = useState(contribution?.proof || '');
	const [contributors, setContributors] = useState<string[]>([]);
	const [credit, setCredit] = useState(String(contribution?.credit || ''));
	// 目前只允许选择一个to
	const [toValue, setToValue] = useState<AutoCompleteValue | undefined>(
		selectedContributors && selectedContributors.length > 0
			? {
					label: selectedContributors[0].nickName,
					id: selectedContributors[0].id,
					wallet: selectedContributors[0].wallet,
			  }
			: {
				label: '',
				id: '',
				wallet: ''
			},
	);
	const [startDate, setStartDate] = useState<Date>(() => {
		if (!isEdit) return new Date();
		if (contribution?.startDate) return new Date(contribution?.startDate);
		const endDate = JSON.parse(contribution?.contributionDate || '{}').startDate;
		return new Date(endDate);
	});

	const [endDate, setEndDate] = useState<Date>(() => {
		if (!isEdit) return new Date();
		if (contribution?.endDate) return new Date(contribution?.endDate);
		const endDate = JSON.parse(contribution?.contributionDate || '{}').endDate;
		return new Date(endDate);
	});
	const [typeValue, setTypeValue] = useState<AutoCompleteValue[]>([]);
	const [showTypeEdit, setShowTypeEdit] = useState(false);
	const [activeTypeEditId, setActiveTypeEditId] = useState<string | undefined>(undefined);
	const [activeTypeHoverId, setActiveTypeHoverId] = useState<string | undefined>(undefined);

	const { showTokenToolTip } = useUtilsStore();
	const [showTokenTip, setShowTokenTip] = useState(false);
	const [inputText, setInputText] = useState('');
	const [initTo, setInitTo] = useState(false);

	const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
	const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

	const [openDialog, setOpenDialog] = useState(false);
	const [isPosting, setIsPosting] = useState(false);
	const [isPostSuccess, setIsPostSuccess] = useState(false);
	const [isVoting, setIsVoting] = useState(false);
	const [isVoteSuccess, setIsVoteSuccess] = useState(false);
	const [curContribution, setCurContribution] = useState<IContribution>();
	const { contributionUids, contributionListParam } = useProjectStore();

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setIsPosting(false);
		setIsPostSuccess(false);
		setIsVoting(false);
		setIsVoteSuccess(false);
		setCurContribution(undefined);
	};

	const { myInfo } = useUserStore();
	const signer = useEthersSigner();
	const provider = useEthersProvider();
	const { address: myAddress } = useAccount();
	const { openConnectModal } = useConnectModal();
	const { cache, setCache, clearCache } = usePostContributionCache({ projectId });

	const { getEasScanURL, submitSignedAttestation, getOffchain } = useEas();

	const { mutate } = useSWRConfig();
	const { data: contributorList, mutate: mutateContributorList } = useSWR(
		['contributor/list', projectId],
		() => getContributorList(projectId),
		{
			fallbackData: [],
			// onSuccess: (data) => console.log('getContributorList', data),
		},
	);

	const { data: contributionTypeList, mutate: mutateContributionTypeList } = useSWR(
		['project/contributionType', projectId],
		() => getContributionTypeList(projectId),
		{
			fallbackData: [],
			// onSuccess: (data) => console.log('contributionType', data),
		},
	);

	const { data: projectDetail } = useSWR(['project/detail', projectId], () =>
		getProjectDetail(projectId),
	);

	useEffect(() => {
		if (!isEdit && cache) {
			setDetail(cache.detail);
			setTypeValue(cache.typeValue);
			setProof(cache.proof);
			setStartDate(new Date(cache.startDate));
			setEndDate(new Date(cache.endDate));
			setToValue(cache.toValue);
			setContributors([cache.toValue.id]);
			setCredit(cache.credit);
			setIsEditing?.(true);
		}
	}, []);

	useEffect(() => {
		if (!toValue && !initTo) {
			const user = contributorList.filter(
				(contributor) => contributor.wallet === myInfo?.wallet,
			);
			if (user.length > 0) {
				setToValue({
					label: user[0].nickName,
					id: user[0].id,
					wallet: user[0].wallet,
				});
				setContributors([user[0].id]);
				setInitTo(true);
			}
		}
	}, [contributorList, myInfo?.wallet, toValue, initTo]);

	useEffect(() => {
		if (isEdit && contributionTypeList.length > 0) {
			const map = contributionTypeList.reduce(
				(pre, item) => {
					return {
						...pre,
						[item.name]: {
							id: item.id,
							label: item.name,
							color: item.color,
						},
					};
				},
				{} as Record<string, AutoCompleteValue>,
			);
			const tags = contribution!.type.map((typeName) => {
				return map[typeName];
			});
			setTypeValue(tags);
		}
	}, [isEdit, contributionTypeList]);

	const tagOptions = useMemo(() => {
		const realOptions = contributionTypeList.map((item, index) => ({
			label: item.name,
			id: item.id,
			color: TagBgColors.includes(item.color) ? item.color : TagBgColors[index % 10],
		}));
		const label = inputText.trim();
		if (realOptions.find((item) => item.label === label)) {
			return realOptions;
		} else {
			return label
				? [
						...realOptions,
						{
							label: label,
							id: ForCreateTagId,
							color: TagBgColors[realOptions.length % 10],
						},
				  ]
				: realOptions;
		}
	}, [contributionTypeList, inputText]);

	useEffect(() => {
		mutateContributorList();
	}, [projectId]);

	useEffect(() => {
		const cacheData: IPostContributionCacheItem = {
			detail,
			typeValue,
			proof,
			startDate,
			endDate,
			toValue: toValue!,
			credit,
		};
		setCache(cacheData);
	}, [detail, typeValue, proof, startDate, endDate, toValue, credit]);

	const operatorId = useMemo(() => {
		if (contributorList.length === 0 || !myInfo) {
			return '';
		}
		return contributorList.filter((contributor) => contributor.userId === myInfo?.id)[0]?.id;
	}, [contributorList, myInfo]);

	const isProjectMember = useMemo(() => {
		if (!myInfo) return false;
		return !!contributorList.find((contributor) => contributor.userId === myInfo?.id);
	}, [contributorList, myInfo]);

	const contributorOptions = useMemo(() => {
		return contributorList.map((item) => {
			return {
				label: item.nickName,
				wallet: item.wallet,
				id: item.id,
			};
		});
	}, [contributorList]);

	const onClear = () => {
		setDetail('');
		setProof('');
		setToValue({
			label: '',
			id: '',
			wallet: ''
		});
		setContributors([]);
		const inputEle = document.getElementById('contributor-select') as HTMLInputElement
		if (inputEle) {
			inputEle.value = '';
		}
		setCredit('');
		setTypeValue([]);
		setStartDate(new Date());
		setEndDate(new Date());
		setIsEditing?.(false);
	};

	useEffect(() => {
		if (
			!detail &&
			!proof &&
			contributors.length === 0 &&
			!toValue &&
			!credit &&
			typeValue.length === 0
		) {
			setIsEditing?.(false);
		} else {
			setIsEditing?.(true);
		}
	}, [detail, proof, contributors, toValue, credit, typeValue]);

	const handleDetailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDetail(event.target.value);
	};

	const handleProofInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setProof(event.target.value);
	};
	const handleCreditInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCredit(event.target.value);
	};

	const onTypeKeyDown = async (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter') {
			// @ts-ignore
			event.defaultMuiPrevented = true;
			const label = inputText.trim();
			if (tagOptions.find((item) => item.label === label && item.id !== ForCreateTagId)) {
				setInputText('');
				return false;
			}
			createNewTag(label);
		}
	};

	const onTypeChange = async (event: React.SyntheticEvent, newValue: AutoCompleteValue[]) => {
		const createTagOption = newValue.find((option) => option.id === ForCreateTagId);
		if (createTagOption) {
			const label = inputText.trim();
			// console.log('createTagOption', label);
			createNewTag(label);
		} else {
			setTypeValue(newValue);
		}
	};

	const createNewTag = async (label: string) => {
		try {
			const newTagColor = TagBgColors[contributionTypeList.length % 10];
			await mutate(
				['project/contributionType', projectId],
				[
					...contributionTypeList,
					{
						name: label,
						id: '__ready_for_create__',
						color: newTagColor,
						projectId: projectId,
					},
				],
				false,
			);
			setInputText('');
			const { name, id, color } = await createContributionType(projectId, {
				name: label,
				color: newTagColor,
			});
			if (typeValue.find((tag) => tag.label === label)) {
				setInputText('');
				return false;
			}
			setTypeValue([...typeValue, { id, color, label: name, projectId }]);
			mutateContributionTypeList();
		} catch (err) {
			console.error(err);
		} finally {
			setInputText('');
		}
	};

	const onSubmit = () => {
		if (!detail) {
			showToast('Details of contribution are required', 'error');
			return;
		}
		if (!proof) {
			showToast('Proof of contribution is required', 'error');
			return;
		}
		if (contributors.length === 0) {
			showToast('The reward receiver is required', 'error');
			return;
		}
		if (!credit || Number(credit) <= 0) {
			showToast('The token amount must be numeric', 'error');
			return;
		}
		const typeString = typeValue.reduce(
			(pre, cur) => `${pre}${pre ? ', ' : ''}${cur.label}`,
			'',
		);
		const params: PostData = { detail, proof, contributors, credit, type: typeString };
		if (contribution) {
			onEditContribution(params);
		} else {
			onPostContribution(params);
		}
	};

	const onPostContribution = async (postData: PostData) => {
		if (!myAddress) {
			openConnectModal?.();
			return false;
		}
		if (!operatorId) {
			console.error('operatorId not exist');
			return false;
		}
		try {
			setIsPosting(true);
			setIsPostSuccess(false);
			setCurContribution(undefined);
			setOpenDialog(true);

			const contribution = await createContribution({
				projectId: projectId,
				operatorId: operatorId as string,
				...postData,
				credit: Number(postData.credit),
				toIds: postData.contributors,
				type: typeValue.map((item) => item.label),
				startDate: new Date(startDate).getTime(),
				endDate: new Date(endDate).getTime(),
				// contributionDate: JSON.stringify({ startDate, endDate }),
			});
			// UNREADY 状态

			// TODO 如果用户 reject metamask 签名，DB有记录，但EAS上无数据，是否重新唤起小狐狸
			const offchain = getOffchain();
			const contributionSchemaUid = EasSchemaMap.contribution;
			const schemaEncoder = new SchemaEncoder(EasSchemaTemplateMap.contribution);
			const startDay = startOfDay(startDate).getTime().toString();
			const endDay = endOfDay(endDate).getTime().toString();

			const data: EasSchemaData<EasSchemaContributionKey>[] = [
				{ name: 'ProjectAddress', value: projectId, type: 'address' },
				{
					name: 'ContributionID',
					value: contribution.id,
					type: 'bytes32',
				},
				{ name: 'Detail', value: postData.detail, type: 'string' },
				{ name: 'Type', value: postData.type, type: 'string' },
				{ name: 'Proof', value: postData.proof, type: 'string' },
				{ name: 'StartDate', value: ethers.parseUnits(startDay), type: 'uint256' },
				{ name: 'EndDate', value: ethers.parseUnits(endDay), type: 'uint256' },
				{
					name: 'TokenAmount',
					value: ethers.parseUnits(postData.credit.toString()),
					type: 'uint256',
				},
				{ name: 'Extended', value: '', type: 'string' },
			];
			// console.log('[EAS postContribution data]', data);
			const encodedData = schemaEncoder.encodeData(data);
			const block = await provider.getBlock('latest');
			if (!signer) {
				return;
			}
			const toWallet = contributorList.find((item) => item.id === postData.contributors[0])
				?.wallet;
			const defaultRecipient = '0x0000000000000000000000000000000000000000';
			const offchainAttestation = await offchain.signOffchainAttestation(
				{
					recipient: toWallet || defaultRecipient,
					expirationTime: BigInt(0),
					time: BigInt(block ? block.timestamp : 0),
					revocable: true,
					version: 1,
					nonce: BigInt(0),
					schema: contributionSchemaUid,
					refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
					data: encodedData,
				},
				signer,
			);
			const res = await submitSignedAttestation({
				signer: myAddress as string,
				sig: offchainAttestation,
			});
			if (res.data.error) {
				console.error('submitSignedAttestation fail', res.data);
				throw new Error(res.data.error);
			}
			const baseURL = getEasScanURL();
			// Update ENS names
			const getENSRes = await axios.get(`${baseURL}/api/getENS/${myAddress}`);
			// 传eas返回的uid, 更新status为ready
			const updateStatus = await updateContributionStatus(contribution.id, {
				type: 'ready',
				uId: res.data.offchainAttestationId as string,
				operatorId: operatorId,
			});
			clearCache();
			setCurContribution({
				...contribution,
				uId: res.data.offchainAttestationId as string,
			});
			setIsPostSuccess(true);
			showToast('Contribution posted', 'success');
			onClear();
			await mutate(contributionListParam);
		} catch (err: any) {
			console.error(err);
			setIsPostSuccess(false);
			if (err.code && err.code === 'ACTION_REJECTED') {
				showToast('Unsuccessful: Signing request rejected by you', 'error');
				return;
			}
			showToast('post contribution failed', 'error');
		} finally {
			closeGlobalLoading();
			setIsPosting(false);
		}
	};

	const onVoteFor = async () => {
		console.log('onVoteFor');
		if (!curContribution) return;
		if (!isPostSuccess) return;
		if (isVoting) return;
		try {
			setIsVoting(true);
			setIsVoteSuccess(false);

			const offchain = getOffchain();
			const voteSchemaUid = EasSchemaMap.vote;

			const schemaEncoder = new SchemaEncoder(EasSchemaTemplateMap.vote);
			const data: EasSchemaData<EasSchemaVoteKey>[] = [
				{ name: 'ProjectAddress', value: projectId, type: 'address' },
				{
					name: 'ContributionID',
					value: curContribution.id,
					type: 'bytes32',
				},
				{ name: 'VoteChoice', value: IVoteValueEnum.FOR, type: 'uint8' },
				{ name: 'Comment', value: 'Good contribution', type: 'string' },
			];
			const encodedData = schemaEncoder.encodeData(data);
			const block = await provider.getBlock('latest');
			if (!signer) {
				return;
			}
			const defaultRecipient = '0x0000000000000000000000000000000000000000';
			const toWallet = toValue?.wallet;
			const offchainAttestation = await offchain.signOffchainAttestation(
				{
					recipient: toWallet || defaultRecipient,
					expirationTime: BigInt(0),
					time: BigInt(block ? block.timestamp : 0),
					revocable: true,
					version: 1,
					nonce: BigInt(0),
					schema: voteSchemaUid,
					refUID: curContribution.uId as string, // 可用来查询vote信息
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
			setIsVoting(false);
			setIsVoteSuccess(true);
			setTimeout(() => {
				setOpenDialog(false);
				handleCloseDialog();
			}, 1500);
			// Update ENS names
			await axios.get(`${baseURL}/api/getENS/${myAddress}`);
			await mutate(['eas/vote/list', [...contributionUids, curContribution.uId]]);
		} catch (err) {
			console.error('vote for', err);
			setIsVoting(false);
			setIsVoteSuccess(false);
		}
	};

	const onEditContribution = async (postData: PostData) => {
		showToast('Edit contribution is in progress, please wait.', 'warning');
	};
	const onFocusTokenInput = (event: React.FocusEvent<HTMLInputElement>) => {
		setShowTokenTip(true);
	};
	const onBlurTokenInput = () => {
		setShowTokenTip(false);
	};

	const handleTypeEdit = (event: React.MouseEvent<HTMLElement>, option: AutoCompleteValue) => {
		setShowTypeEdit(true);
		setActiveTypeEditId(option.id);
		event.stopPropagation();
	};

	const renderTypeEditEntry = (option: AutoCompleteValue) => {
		if (option.label === DefaultTypeKudos) {
			return null;
		}
		if (activeTypeHoverId !== option.id) {
			return null;
		}
		if (!isProjectMember) {
			return null;
		}
		// 当前已经选中的也不能出现
		if (typeValue.find((item) => item.id === option.id)) {
			return null;
		}
		return (
			<Tooltip
				open={showTypeEdit && activeTypeEditId === option.id}
				title={renderTypeEdit(option)}
				placement={'top-start'}
				PopperProps={{ sx: { '.MuiTooltip-tooltip': { backgroundColor: '#fff' } } }}
				onClose={() => {
					setShowTypeEdit(false);
					setActiveTypeEditId(undefined);
				}}
				disableHoverListener={true}
				disableInteractive={false}
			>
				<TypeEditButton
					aria-describedby={option.id}
					onClick={(event) => handleTypeEdit(event, option)}
				>
					<MoreHoriz color={'disabled'} />
				</TypeEditButton>
			</Tooltip>
		);
	};

	const handleDeleteType = async (
		event: React.MouseEvent<HTMLElement>,
		option: AutoCompleteValue,
	) => {
		event.stopPropagation();
		openGlobalLoading();
		try {
			await deleteContributionType(option.id);
			await mutateContributionTypeList();
			showToast('Delete success', 'success');
			setShowTypeEdit(false);
		} catch (e) {
			console.error('deleteContributionType', e);
		} finally {
			closeGlobalLoading();
		}
	};

	const renderTypeEdit = (option: AutoCompleteValue) => {
		return (
			<Button
				variant="outlined"
				startIcon={<DeleteIcon />}
				onClick={(event) => handleDeleteType(event, option)}
			>
				Delete
			</Button>
		);
	};

	return (
		<PostContainer id="postContainer" showFullPost={showFullPost}>
			{/*detail*/}
			<StyledFlexBox>
				<TagLabel>#details</TagLabel>
				{/*<StyledInput*/}
				{/*	variant={'standard'}*/}
				{/*	InputProps={{ disableUnderline: true }}*/}
				{/*	required*/}
				{/*	value={detail}*/}
				{/*	size={'small'}*/}
				{/*	onChange={handleDetailInputChange}*/}
				{/*	placeholder={'I developed sign in with [wallet] feature'}*/}
				{/*	autoComplete={'off'}*/}
				{/*/>*/}
				<ReactQuill
					theme="snow"
					value={detail}
					onChange={setDetail}
					formats={[
						'header',
						'bold',
						'italic',
						'underline',
						'strike',
						'blockquote',
						'list',
						'bullet',
						'indent',
						'link',
					]}
					placeholder={'Markdown format supported'}
					style={{
						flex: '1',
						border: 'none',
						paddingLeft: '14px',
					}}
					modules={{ toolbar: false }}
				/>
			</StyledFlexBox>

			{showFullPost ? (
				<>
					{/*type*/}
					<StyledFlexBox sx={{ marginTop: '0' }}>
						<TagLabel>#type</TagLabel>
						<Autocomplete
							multiple
							id="type-autocomplete"
							sx={{
								width: '100%',
								border: 'none',
								'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
									border: 'none',
								},
								'& .MuiOutlinedInput-root': {
									border: 'none',
								},
								'& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
									border: 'none',
								},
							}}
							size={'small'}
							options={tagOptions as AutoCompleteValue[]}
							value={typeValue}
							isOptionEqualToValue={(option, value) => option.id === value.id}
							autoFocus={true}
							onKeyDown={onTypeKeyDown}
							popupIcon={''}
							onChange={onTypeChange}
							onInputChange={(event, value) => {
								setInputText(value);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									sx={{ '& input': { color: '#437EF7' } }}
									key={params.id}
								/>
							)}
							renderOption={(props, option, { selected, index }) => {
								return option.id === ForCreateTagId ? (
									<OptionLi selected={selected} {...props}>
										Create
										<OptionLabel index={index} bgColor={option.color}>
											{option.label}
										</OptionLabel>
									</OptionLi>
								) : (
									<OptionLi
										selected={selected}
										{...props}
										sx={{ display: 'flex', justifyContent: 'space-between' }}
										onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
											setActiveTypeHoverId(option.id);
										}}
										onMouseLeave={() => {
											setActiveTypeHoverId(undefined);
											setActiveTypeEditId(undefined);
										}}
									>
										<OptionLabel index={index} bgColor={option.color}>
											{option.label}
										</OptionLabel>
										<StyledFlexBox
											sx={{
												flex: '1',
												justifyContent: 'flex-end',
												width: '32px',
											}}
										>
											{renderTypeEditEntry(option)}
										</StyledFlexBox>
									</OptionLi>
								);
							}}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									// eslint-disable-next-line react/jsx-key
									<OptionChip
										label={option.label}
										{...getTagProps({ index })}
										size={'small'}
										index={index}
										bgColor={option.color}
									/>
								))
							}
							PaperComponent={({ children }) => (
								<Paper style={{ width: '460px' }}>{children}</Paper>
							)}
							ListboxProps={{
								style: {
									maxHeight: '1600px', // 设置下拉菜单的最大高度
									overflow: 'auto', // 添加滚动条
								},
							}}
						/>
					</StyledFlexBox>

					{/*proof*/}
					<StyledFlexBox sx={{ marginTop: '0' }}>
						<TagLabel>#proof</TagLabel>
						<ReactQuill
							theme="snow"
							value={proof}
							onChange={setProof}
							formats={[
								'header',
								'bold',
								'italic',
								'underline',
								'strike',
								'blockquote',
								'list',
								'bullet',
								'indent',
								'link',
							]}
							placeholder={'Markdown format supported'}
							style={{
								flex: '1',
								border: 'none',
								paddingLeft: '14px',
							}}
							modules={{ toolbar: false }}
						/>
						{/*<StyledInput*/}
						{/*	variant={'standard'}*/}
						{/*	InputProps={{ disableUnderline: true }}*/}
						{/*	required*/}
						{/*	value={proof}*/}
						{/*	size={'small'}*/}
						{/*	onChange={handleProofInputChange}*/}
						{/*	placeholder="It can be links or texts."*/}
						{/*	autoComplete={'off'}*/}
						{/*	multiline*/}
						{/*/>*/}
					</StyledFlexBox>

					{/*date*/}
					<StyledFlexBox sx={{ margin: '-4px 0 -16px' }}>
						<TagLabel>#date</TagLabel>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<DatePicker
								format={'MM/dd/yyyy'}
								value={startDate}
								onChange={(date) => setStartDate(date!)}
								open={openStartDatePicker}
								onOpen={() => setOpenStartDatePicker(true)}
								onClose={() => setOpenStartDatePicker(false)}
								sx={{
									width: '120px',
									'& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
										border: 'none',
									},
								}}
								slotProps={{
									openPickerButton: { sx: { display: 'none' } },
									textField: { onClick: () => setOpenStartDatePicker(true) },
								}}
							/>
							<Typography variant={'body2'} sx={{ margin: '0 4px 0 0' }}>
								to
							</Typography>
							<DatePicker
								format={'MM/dd/yyyy'}
								value={endDate}
								onChange={(date) => setEndDate(date!)}
								open={openEndDatePicker}
								onOpen={() => setOpenEndDatePicker(true)}
								onClose={() => setOpenEndDatePicker(false)}
								sx={{
									width: '160px',
									'& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
										border: 'none',
									},
								}}
								slotProps={{
									openPickerIcon: { sx: { opacity: 0.2 } },
									textField: { onClick: () => setOpenEndDatePicker(true) },
								}}
							/>
						</LocalizationProvider>
					</StyledFlexBox>

					{/*to*/}
					<StyledFlexBox sx={{ marginTop: '0' }}>
						<TagLabel>#to</TagLabel>
						<Autocomplete
							id="contributor-select"
							sx={{
								width: 250,
								border: 'none',
								'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
									border: 'none',
								},
								'& .MuiOutlinedInput-root': {
									border: 'none',
								},
								'& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
									border: 'none',
								},
							}}
							size={'small'}
							options={contributorOptions}
							getOptionLabel={(option) => option.label ? `@${option.label}` : ''} // 设置显示格式
							isOptionEqualToValue={(option, value) =>
								option.label === value.label && option.id === value.id
							}
							value={toValue}
							onChange={(event, newValue: AutoCompleteValue | undefined) => {
								setToValue(newValue);
								setContributors(newValue ? [newValue.id] : []);
							}}
							popupIcon={''}
							renderInput={(params) => (
								<TextField {...params} sx={{ '& input': { color: '#437EF7' } }} />
							)}
							disableClearable={true}
						/>
					</StyledFlexBox>
				</>
			) : null}

			{/*credit*/}
			<CreditContainer>
				<Image src={'/images/pizza_gray.png'} alt={'pizza'} width={24} height={24} />
				<Tooltip
					open={showTokenTip && showTokenToolTip}
					title={
						<TokenToolTip
							setShowTokenTip={setShowTokenTip}
							tokenSymbol={projectDetail?.symbol || ''}
						/>
					}
					placement="bottom"
					arrow={true}
					disableTouchListener={true}
					disableHoverListener={true}
					disableFocusListener={true}
					disableInteractive={true}
				>
					<StyledInput
						sx={{ marginLeft: '4px', marginTop: '4px' }}
						variant={'standard'}
						required
						onChange={handleCreditInputChange}
						value={credit}
						size={'small'}
						placeholder={`$${projectDetail?.symbol || ''} tokens, e.g. 60`}
						onFocus={onFocusTokenInput}
						onBlur={onBlurTokenInput}
						InputProps={{
							disableUnderline: true,
							startAdornment: credit ? (
								<InputAdornment position="start">
									<Typography variant="body1">$</Typography>
								</InputAdornment>
							) : null,
							endAdornment: credit ? (
								<InputAdornment position="end">
									<Typography variant="body1">tokens</Typography>
								</InputAdornment>
							) : null,
						}}
						autoComplete={'off'}
					/>
				</Tooltip>
			</CreditContainer>

			<PostButton>
				{onCancel ? (
					<BaseButton
						variant={'outlined'}
						sx={{ marginRight: '16px' }}
						onClick={onCancel}
					>
						Cancel
					</BaseButton>
				) : null}

				<BaseButton
					variant={'contained'}
					sx={{}}
					onClick={onSubmit}
					disabled={!showFullPost}
				>
					{confirmText || 'Re-Post'}
				</BaseButton>
			</PostButton>

			<CustomDialog title={'Post and vote'} open={openDialog} onClose={handleCloseDialog}>
				<>
					<LineStatus
						isLoading={isPosting}
						isDone={isPostSuccess}
						text={`Posting contribution on chain ${isPosting ? '...' : '.'}`}
					/>

					<div
						style={{
							backgroundColor: isPostSuccess ? '#0F172A' : '#94A3B8',
							width: '2px',
							height: '20px',
							marginLeft: '28px',
						}}
					/>

					<LineStatus
						isLoading={isVoting}
						isDone={isVoteSuccess}
						text={`Vote for the contribution you've just made ${
							isVoting ? '...' : '.'
						}`}
					/>
					<Button
						variant={'contained'}
						size={'small'}
						sx={{
							marginLeft: '50px',
							width: '80px',
							minWidth: '80px',
						}}
						onClick={onVoteFor}
						disabled={!isPostSuccess || isVoting || isVoteSuccess}
					>
						For
					</Button>
				</>
			</CustomDialog>
		</PostContainer>
	);
};

export default React.memo(PostContribution);

interface IPostContainerProps {
	showFullPost?: boolean;
}

const PostContainer = styled('div')<IPostContainerProps>(({ showFullPost }) => ({
	minHeight: '90px',
	backgroundColor: 'white',
	padding: '12px 16px',
	borderRadius: '4px',
	position: 'relative',
	border: showFullPost ? '1px solid rgba(18, 194, 156, 1)' : '1px solid rgba(15, 23, 42, 0.16)',
	boxShadow: showFullPost ? '0px 4px 18px 3px #0F172A0A' : 'none',
}));
const PostButton = styled(StyledFlexBox)({
	position: 'absolute',
	right: '16px',
	bottom: '12px',
});
const TagLabel = styled(Typography)({
	color: '#437EF7',
	width: '60px',
});

const StyledInput = styled(TextField)({
	flex: '1',
	border: 'none',
	paddingLeft: '14px',
});

const CreditContainer = styled(StyledFlexBox)({
	justifyContent: 'center',
	marginTop: '0',
	width: '220px',
	height: '30px',
	borderRadius: '5px',
	padding: '3px 8px',
});

const BaseButton = styled(Button)({
	minWidth: '64px',
});

const OptionLi = styled('li')<{ selected: boolean }>(({ selected }) => ({
	height: '36px',
	cursor: 'pointer',
	padding: '8px 16px',
}));

const OptionLabel = styled('span')<{ index: number; bgColor: string }>(({ index, bgColor }) => ({
	fontSize: '14px',
	lineHeight: '20px',
	padding: '0 6px',
	borderRadius: '4px',
	backgroundColor: bgColor || TagBgColors[index % 10],
	color: TagColorMap[bgColor] || TagTextColors[index % 10],
	maxWidth: '400px',
}));
const OptionChip = styled(Chip)<{ index: number; bgColor: string }>(({ index, bgColor }) => ({
	backgroundColor: bgColor || TagBgColors[index % 10],
	color: TagColorMap[bgColor] || TagTextColors[index % 10],
	borderRadius: '4px',
}));

const TypeEditButton = styled(IconButton)({
	width: '24px',
	height: '24px',
	borderRadius: '4px',
	padding: '0',
});
