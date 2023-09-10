import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import { Button, styled, TextField, Typography } from '@mui/material';

import { StyledFlexBox } from '@/components/styledComponents';
import { IContribution, IContributor } from '@/services/types';
import MultipleContributorSelector from '@/components/project/contribution/contributorSelector';

export interface IPostContributionProps {
	onPost: (data: PostData) => void;
	contribution?: IContribution;
	onCancel?: () => void;
	confirmText?: string;
	contributorList: IContributor[];
}

export interface PostData {
	detail: string;
	proof: string;
	contributors: string[];
	credit: string;
}

const PostContribution = ({
	contribution,
	onPost,
	onCancel,
	confirmText,
	contributorList,
}: IPostContributionProps) => {
	const [detail, setDetail] = useState(contribution?.detail || 'contribution detail');
	const [proof, setProof] = useState(contribution?.proof || 'https://google.com');
	const [contributors, setContributors] = useState<string[]>([]);
	const [credit, setCredit] = useState(String(contribution?.credit || '9'));

	useEffect(() => {
		if (contributorList.length > 0) {
			console.log('props contributorList', contributorList);
		}
	}, [contributorList]);

	const handleDetailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDetail(event.target.value);
	};

	const handleProofInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setProof(event.target.value);
	};
	const handleCreditInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCredit(event.target.value);
	};

	const handleContributorChange = (wallets: string[]) => {
		setContributors(wallets);
	};

	const onSubmit = () => {
		const params: PostData = { detail, proof, contributors, credit };
		onPost(params);
	};

	return (
		<PostContainer>
			<StyledFlexBox>
				<TagLabel>#detail</TagLabel>
				<StyledInput
					variant={'standard'}
					InputProps={{ disableUnderline: true }}
					required
					value={detail}
					size={'small'}
					onChange={handleDetailInputChange}
					placeholder={'I developed sign in with wallet feature'}
				/>
			</StyledFlexBox>

			<StyledFlexBox sx={{ marginTop: '8px' }}>
				<TagLabel>#proof</TagLabel>
				<StyledInput
					variant={'standard'}
					InputProps={{ disableUnderline: true }}
					required
					value={proof}
					size={'small'}
					onChange={handleProofInputChange}
					placeholder={'https: //notion.so/1234'}
				/>
			</StyledFlexBox>

			<StyledFlexBox sx={{ marginTop: '8px' }}>
				<TagLabel>#to</TagLabel>
				<MultipleContributorSelector
					contributorList={contributorList}
					onChange={handleContributorChange}
				/>
			</StyledFlexBox>

			<CreditContainer>
				<Image src={'/images/pizza2.png'} width={24} height={24} alt={'pizza'} />
				<StyledInput
					sx={{ marginLeft: '4px', marginTop: '4px' }}
					variant={'standard'}
					InputProps={{ disableUnderline: true }}
					required
					value={credit}
					size={'small'}
					onChange={handleCreditInputChange}
					placeholder={'Pizza slices, e.g. 120'}
				/>
			</CreditContainer>

			<PostButton>
				{onCancel ? (
					<Button
						variant={'contained'}
						color={'info'}
						sx={{ marginRight: '24px' }}
						onClick={onCancel}
					>
						Cancel
					</Button>
				) : null}

				<Button variant={'contained'} onClick={onSubmit}>
					{confirmText || 'Re-Post'}
				</Button>
			</PostButton>
		</PostContainer>
	);
};

export default PostContribution;

const PostContainer = styled('div')({
	minHeight: '90px',
	backgroundColor: 'white',
	marginTop: '16px',
	padding: '12px 16px',
	borderRadius: '4px',
	position: 'relative',
	border: '1px solid rgba(18, 194, 156, 1)',
	boxShadow: '0px 4px 18px 3px #0F172A0A',
});
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
});

const CreditContainer = styled(StyledFlexBox)({
	justifyContent: 'center',
	marginTop: '8px',
	width: '200px',
	height: '30px',
	border: '1px solid rgba(15, 23, 42, 0.16)',
	borderRadius: '5px',
	padding: '3px 8px',
});
