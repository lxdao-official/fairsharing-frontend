'use client';

import { Button, styled, TextField, Typography } from '@mui/material';
import { StyledFlexBox } from '@/components/styledComponents';
import Image from 'next/image';
import React, { useState } from 'react';
import { AccountCircle } from '@mui/icons-material';

export default function Page({ params }: { params: { id: string } }) {
	const [detail, setDetail] = useState('');

	const handleDetailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDetail(event.target.value);
	};

	return <div style={{ flex: '1' }}>
		<StyledFlexBox>
			<Typography typography={'h3'}>Post your contribution</Typography>
			<Image src={'/images/book.png'} width={24} height={24} alt={'contribution'}
				   style={{ marginLeft: '10px' }} />
		</StyledFlexBox>

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

			<StyledFlexBox sx={{marginTop: '8px'}}>
				<TagLabel>#proof</TagLabel>
				<StyledInput
					variant={'standard'}
					InputProps={{ disableUnderline: true }}
					required
					value={detail}
					size={'small'}
					onChange={handleDetailInputChange}
					placeholder={'https: //notion.so/1234'}
				/>
			</StyledFlexBox>

			<StyledFlexBox sx={{marginTop: '8px'}}>
				<TagLabel>#to</TagLabel>
				<StyledInput
					variant={'standard'}
					InputProps={{ disableUnderline: true }}
					required
					value={detail}
					size={'small'}
					onChange={handleDetailInputChange}
					placeholder={'Type @ to select contributor'}
				/>
			</StyledFlexBox>

			<PostButton>
				<Button variant={'contained'}>Post</Button>
			</PostButton>
		</PostContainer>

		<Typography typography={'h3'} sx={{ marginTop: '16px' }}>contributions: {params.id}</Typography>

	</div>;
}

const PostContainer = styled('div')({
	minHeight: '90px',
	backgroundColor: 'white',
	marginTop: '16px',
	padding: '12px 16px',
	border: '0.5px solid rgba(15, 23, 42, 0.16)',
	borderRadius: '4px',
	position: 'relative',
});
const PostButton = styled('div')({
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
