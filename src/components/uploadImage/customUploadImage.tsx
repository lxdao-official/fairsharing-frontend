import { ChangeEvent, CSSProperties, FC, useEffect, useState } from 'react';

import { Box, CircularProgress, styled } from '@mui/material';

import { AddRoundIcon, RemoveIcon } from '@/icons';
import { StyledFlexBox } from '@/components/styledComponents';
import PreviewImageModal from '@/components/previewImageModal';

export interface IUploadResponseItem {
	name: string;
	url: string;
}
interface IProps {
	initData: string[];
	onChange: (list: string[]) => void;
}

const CustomUploadImage: FC<IProps> = (props) => {
	const [imageList, setImageList] = useState<string[]>([]);

	const [uploading, setUploading] = useState(false);

	const [open, setOpen] = useState(false);
	const [previewUrl, setPreviewUrl] = useState('');

	useEffect(() => {
		setImageList(props.initData);
	}, [props.initData]);

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (!files || files.length === 0) return;

		console.log('handleUpload files', files);

		const formData = new FormData();
		files.forEach((file, idx) => {
			formData.append('file', file, file.name);
		});

		try {
			setUploading(true);
			const uploadResult = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			}).then(async (res) => {
				return res.json();
			});
			console.log('uploadResult', uploadResult);
			if (uploadResult.data && uploadResult.data.length > 0) {
				const list = (uploadResult.data as IUploadResponseItem[]).map((item) => item.url);
				const newList = [...imageList, ...list];
				setImageList(newList);
				props.onChange(newList);
			}
		} catch (err) {
			console.error('upload fail', err);
		} finally {
			setUploading(false);
		}
	};

	const onRemove = (idx: number) => {
		const newList = [...imageList];
		newList.splice(idx, 1);
		setImageList(newList);
		props.onChange(newList);
	};

	const onPreview = (url: string) => {
		setOpen(true);
		setPreviewUrl(url);
	};

	const onClose = () => {
		setOpen(false);
		setPreviewUrl('');
	};

	const uploadInputStyle: CSSProperties = {
		opacity: '0',
		position: 'absolute',
		width: '100%',
		height: '100%',
		top: 0,
		left: 0,
		cursor: 'pointer',
	};

	return (
		<UploadContainer>
			<UploadArea onClick={(e) => e.stopPropagation()}>
				{imageList.length > 0 ? (
					<UploadButton>
						<div>+</div>
					</UploadButton>
				) : (
					<>
						<AddRoundIcon />
						<UploadText>Attach</UploadText>
					</>
				)}
				<input
					type="file"
					accept="image/*"
					multiple={true}
					style={uploadInputStyle}
					onChange={handleFileChange}
				/>

				{uploading ? (
					<Uploading onClick={(e) => e.stopPropagation()}>
						<CircularProgress size={24} />
					</Uploading>
				) : null}
			</UploadArea>

			{imageList.map((url, idx) => {
				return (
					<ImageItem key={url} onClick={() => onPreview(url)}>
						<img
							src={url}
							width={48}
							height={48}
							style={{ objectFit: 'cover' }}
							alt="image"
						/>
						<RemoveContainer
							onClick={(e) => {
								e.stopPropagation();
								onRemove(idx);
							}}
						>
							<RemoveIcon />
						</RemoveContainer>
					</ImageItem>
				);
			})}

			<PreviewImageModal open={open} url={previewUrl} onClose={() => setOpen(false)} />
		</UploadContainer>
	);
};

export default CustomUploadImage;

const UploadContainer = styled(StyledFlexBox)({
	paddingLeft: '70px',
	marginTop: '8px',
	gap: '8px',
	flexWrap: 'wrap',
});

const UploadArea = styled(StyledFlexBox)({
	position: 'relative',

	'&:active': {
		opacity: '0.7',
	},
	'&:hover': {
		opacity: '0.85',
	},
});

const UploadButton = styled(StyledFlexBox)({
	justifyContent: 'center',
	width: '48px',
	height: '48px',
	borderRadius: '4px',
	border: '0.5px solid rgba(15, 23, 42, 0.16)',
	color: '#94A3B8',
	fontSize: '24px',
	fontWeight: 'normal',
	cursor: 'pointer',
	textAlign: 'center',
	'&:hover': {
		borderStyle: 'dotted',
	},
});

const Uploading = styled(StyledFlexBox)({
	justifyContent: 'center',
	position: 'absolute',
	zIndex: '5',
	top: '0',
	bottom: '0',
	left: '0',
	right: '0',
});

const UploadText = styled('span')({
	color: '#94A3B8',
	fontSize: '14px',
});

const ImageItem = styled('div')({
	width: '48px',
	height: '48px',
	borderRadius: '4px',
	overflow: 'hidden',
	position: 'relative',
	cursor: 'pointer',
});
const RemoveContainer = styled('div')({
	position: 'absolute',
	top: '4px',
	right: '4px',
	cursor: 'pointer',
	width: '12px',
	height: '12px',
});

const PreviewContainer = styled(Box)({
	width: '100vw',
	height: '100vh',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	position: 'relative',
});

const CloseContainer = styled(StyledFlexBox)({
	position: 'absolute',
	justifyContent: 'center',
	top: '60px',
	right: '60px',
	width: '56px',
	height: '56px',
	borderRadius: '56px',
	overflow: 'hidden',
	cursor: 'pointer',
	backgroundColor: '#1f1f1f',
});
