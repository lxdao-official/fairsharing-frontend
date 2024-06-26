import { ChangeEvent, CSSProperties, FC } from 'react';
import { AddRoundIcon } from '@/icons';
import { StyledFlexBox } from '@/components/styledComponents';
import { styled } from '@mui/material';

export interface IUploadResponseItem {
	name: string;
	url: string;
}
interface IProps {
	onUploadSuccess: (list: IUploadResponseItem[]) => void;
}

const CustomUploadImage: FC<IProps> = (props) => {
	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (!files || files.length === 0) return;

		console.log('handleUpload files', files);

		const formData = new FormData();
		files.forEach((file, idx) => {
			formData.append('file', file, file.name);
		});

		try {
			const uploadResult = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			}).then(async (res) => {
				return res.json();
			});
			console.log('uploadResult', uploadResult);
			if (uploadResult.data && uploadResult.data.length > 0) {
				props.onUploadSuccess(uploadResult.data as IUploadResponseItem[])
			}
		} catch (err) {
			console.error('upload fail', err)
		}
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
		<UploadArea onClick={e => e.stopPropagation()}>
			<AddRoundIcon />
			<UploadText>Attach</UploadText>
			<input
				type="file" accept="image/*"
				multiple={true}
				style={uploadInputStyle}
				onChange={handleFileChange}
			/>
		</UploadArea>
	);
};


export default CustomUploadImage;

const UploadArea = styled(StyledFlexBox)({
	position: 'relative',
	'&:active': {
		opacity: '0.7',
	},
	'&:hover': {
		opacity: '0.85',
	},
});

const UploadText = styled('span')({
	color: '#94A3B8',
	fontSize: '14px',
});
