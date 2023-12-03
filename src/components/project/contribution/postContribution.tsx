import React, { useEffect, useMemo, useState } from 'react';

import {
	Autocomplete,
	Button,
	Chip,
	InputAdornment,
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

import useSWR, { useSWRConfig, mutate } from 'swr';

import { endOfDay, startOfDay } from 'date-fns';

import Image from 'next/image';

import { StyledFlexBox } from '@/components/styledComponents';
import { IContribution, IContributor } from '@/services/types';
import { closeGlobalLoading, openGlobalLoading, showToast, useUtilsStore } from '@/store/utils';
import {
	createContribution,
	createContributionType,
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
} from '@/constant/eas';

import { useEthersProvider, useEthersSigner } from '@/common/ether';

import { useUserStore } from '@/store/user';
import useEas from '@/hooks/useEas';
import TokenToolTip from '@/components/project/contribution/tokenToolTip';

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
}: IPostContributionProps) => {
	const [detail, setDetail] = useState(contribution?.detail || '');
	const [proof, setProof] = useState(contribution?.proof || '');
	const [contributors, setContributors] = useState<string[]>([]);
	const [credit, setCredit] = useState(String(contribution?.credit || ''));
	// 目前只允许选择一个to
	const [value, setValue] = React.useState<AutoCompleteValue | null>(
		selectedContributors && selectedContributors.length > 0
			? {
					label: selectedContributors[0].nickName,
					id: selectedContributors[0].id,
					wallet: selectedContributors[0].wallet,
			  }
			: null,
	);
	const { showTokenToolTip } = useUtilsStore();
	const [showTokenTip, setShowTokenTip] = useState(false);

	const [startDate, setStartDate] = useState<Date>(() => {
		if (!isEdit) return new Date();
		const endDate = JSON.parse(contribution?.contributionDate || '{}').startDate;
		return new Date(endDate);
	});

	const [endDate, setEndDate] = useState<Date>(() => {
		if (!isEdit) return new Date();
		const endDate = JSON.parse(contribution?.contributionDate || '{}').endDate;
		return new Date(endDate);
	});

	const [tags, setTags] = useState<AutoCompleteValue[]>([]);
	const [inputText, setInputText] = useState('');
	const [initTo, setInitTo] = useState(false);

	const { myInfo } = useUserStore();
	const signer = useEthersSigner();
	const provider = useEthersProvider();
	const { address: myAddress } = useAccount();
	const { openConnectModal } = useConnectModal();

	const { getEasScanURL, submitSignedAttestation, getOffchain } = useEas();

	const { mutate } = useSWRConfig();
	const { data: contributorList, mutate: mutateContributorList } = useSWR(
		['contributor/list', projectId],
		() => getContributorList(projectId),
		{
			fallbackData: [],
			onSuccess: (data) => console.log('getContributorList', data),
		},
	);

	const { data: contributionTypeList, mutate: mutateContributionTypeList } = useSWR(
		['project/contributionType', projectId],
		() => getContributionTypeList(projectId),
		{
			fallbackData: [],
			onSuccess: (data) => console.log('contributionType', data),
		},
	);

	const { data: projectDetail } = useSWR(['project/detail', projectId], () =>
		getProjectDetail(projectId),
	);

	useEffect(() => {
		if (!value && !initTo) {
			const user = contributorList.filter(
				(contributor) => contributor.wallet === myInfo?.wallet,
			);
			if (user.length > 0) {
				setValue({
					label: user[0].nickName,
					id: user[0].id,
					wallet: user[0].wallet,
				});
				setContributors([user[0].id]);
				setInitTo(true);
			}
		}
	}, [contributorList, myInfo?.wallet, value, initTo]);

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
			setTags(tags);
		}
	}, [isEdit, contributionTypeList]);

	const tagOptions = useMemo(() => {
		const realOptions = contributionTypeList.map((item) => ({
			label: item.name,
			id: item.id,
			color: item.color,
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
							color: 'red',
						},
				  ]
				: realOptions;
		}
	}, [contributionTypeList, inputText]);

	useEffect(() => {
		mutateContributorList();
	}, [projectId]);

	const operatorId = useMemo(() => {
		if (contributorList.length === 0 || !myInfo) {
			return '';
		}
		return contributorList.filter((contributor) => contributor.userId === myInfo?.id)[0]?.id;
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
		setValue(null);
		setContributors([]);
		setCredit('');
		setTags([]);
		setStartDate(new Date());
		setEndDate(new Date());
	};

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
			console.log('createTagOption', label);
			createNewTag(label);
		} else {
			setTags(newValue);
		}
	};

	const createNewTag = async (label: string) => {
		try {
			await mutate(
				['project/contributionType', projectId],
				[
					...contributionTypeList,
					{
						name: label,
						id: '__ready_for_create__',
						color: 'red',
						projectId: projectId,
					},
				],
				false,
			);
			setInputText('');
			const { name, id, color } = await createContributionType(projectId, {
				name: label,
				color: 'red',
			});
			if (tags.find((tag) => tag.label === label)) {
				setInputText('');
				return false;
			}
			setTags([...tags, { id, color, label: name, projectId }]);
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
		const typeString = tags.reduce((pre, cur) => `${pre}${pre ? ', ' : ''}${cur.label}`, '');
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
			openGlobalLoading();
			const contribution = await createContribution({
				projectId: projectId,
				operatorId: operatorId as string,
				...postData,
				credit: Number(postData.credit),
				toIds: postData.contributors,
				type: tags.map((item) => item.label),
				contributionDate: JSON.stringify({ startDate, endDate }),
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
			console.log('[EAS postContribution data]', data);
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
			showToast('Contribution posted', 'success');
			setShowFullPost?.(false);
			onClear();
			mutate(['contribution/list', projectId]);
		} catch (err: any) {
			console.error(err);
			if (err.message) {
				showToast(err.message, 'error');
			}
		} finally {
			closeGlobalLoading();
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

	return (
		<PostContainer id="postContainer" showFullPost={showFullPost}>
			{/*detail*/}
			<StyledFlexBox>
				<TagLabel>#details</TagLabel>
				<StyledInput
					variant={'standard'}
					InputProps={{ disableUnderline: true }}
					required
					value={detail}
					size={'small'}
					onChange={handleDetailInputChange}
					placeholder={'I developed sign in with [wallet] feature'}
					onFocus={() => setShowFullPost?.(true)}
				/>
			</StyledFlexBox>

			{showFullPost ? (
				<>
					{/*type*/}
					<StyledFlexBox sx={{ marginTop: '8px' }}>
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
							value={tags}
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
								return (
									<OptionLi selected={selected} {...props}>
										{option.id === ForCreateTagId ? 'Create' : ''}
										<OptionLabel index={index}>{option.label}</OptionLabel>
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
									/>
								))
							}
						/>
					</StyledFlexBox>

					{/*proof*/}
					<StyledFlexBox sx={{ marginTop: '8px' }}>
						<TagLabel>#proof</TagLabel>
						<StyledInput
							variant={'standard'}
							InputProps={{ disableUnderline: true }}
							required
							value={proof}
							size={'small'}
							onChange={handleProofInputChange}
							placeholder="It can be links or texts."
						/>
					</StyledFlexBox>

					{/*date*/}
					<StyledFlexBox sx={{ marginTop: '16px' }}>
						<TagLabel>#date</TagLabel>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<DatePicker
								format={'MM/dd/yyyy'}
								label={'Start Date'}
								value={startDate}
								onChange={(date) => setStartDate(date!)}
							/>
							<Typography variant={'body2'} sx={{ margin: '0 12px' }}>
								to
							</Typography>
							<DatePicker
								format={'MM/dd/yyyy'}
								label={'End Date'}
								value={endDate}
								onChange={(date) => setEndDate(date!)}
							/>
						</LocalizationProvider>
					</StyledFlexBox>

					{/*to*/}
					<StyledFlexBox sx={{ marginTop: '8px' }}>
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
							getOptionLabel={(option) => `@${option.label}`} // 设置显示格式
							value={value}
							onChange={(event, newValue: AutoCompleteValue | null) => {
								setValue(newValue);
								setContributors(newValue ? [newValue.id] : []);
							}}
							popupIcon={''}
							renderInput={(params) => (
								<TextField {...params} sx={{ '& input': { color: '#437EF7' } }} />
							)}
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
	marginTop: '8px',
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

const OptionBgColors = [
	'#FEEDEB',
	'#FFF3E0',
	'#E6F7FF',
	'#E1F3E2',
	'#FBF6C7',
	'#F2F4F6',
	'#EDE7F6',
	'#EDF1DA',
	'#E9EBF7',
	'#FCE8F9',
];
const OptionFontColors = [
	'#491410',
	'#391A00',
	'#002338',
	'#00200D',
	'#4D2100',
	'#181D24',
	'#180038',
	'#182700',
	'#0E184C',
	'#3A071B',
];

const OptionLabel = styled('span')<{ index: number }>(({ index }) => ({
	fontSize: '14px',
	lineHeight: '20px',
	padding: '0 6px',
	borderRadius: '4px',
	backgroundColor: OptionBgColors[index % 10],
	color: OptionFontColors[index % 10],
}));
const OptionChip = styled(Chip)<{ index: number }>(({ index }) => ({
	backgroundColor: OptionBgColors[index % 10],
	color: OptionFontColors[index % 10],
	borderRadius: '4px',
}));
