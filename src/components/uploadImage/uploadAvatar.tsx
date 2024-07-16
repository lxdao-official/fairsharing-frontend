import React, { ChangeEvent, FC, useMemo, useRef, useState } from 'react';
import { Box, Avatar, CircularProgress } from '@mui/material';

export interface IProps {
	defaultAvatar: string;
	uploadSuccess: (url: string) => void;
	uploading?: () => void;
}

const UploadAvatar: FC<IProps> = (props) => {
	const { defaultAvatar, uploadSuccess, uploading } = props;
	const [loading, setLoading] = useState(false);
	const inputFile = useRef<HTMLInputElement>(null);

	const [successUrl, setSuccessUrl] = useState('');

	const avatarUrl = useMemo(() => {
		if (successUrl) return successUrl;
		return defaultAvatar || '';
	}, [successUrl, defaultAvatar]);

	const clickImg = () => {
		inputFile.current?.click();
	};

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (!files || files.length === 0) return;

		console.log('handleUpload files', files);

		const formData = new FormData();
		files.forEach((file, idx) => {
			formData.append('file', file, file.name);
		});

		try {
			setLoading(true);
			uploading?.();
			const uploadResult = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			}).then(async (res) => {
				return res.json();
			});
			console.log('uploadResult', uploadResult);
			if (uploadResult.data && uploadResult.data.length > 0) {
				const url = uploadResult.data[0].url as string;
				setSuccessUrl(url);
				uploadSuccess(url);
			}
		} catch (err) {
			console.error('upload fail', err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box>
			<Avatar
				alt="avatar"
				src={avatarUrl}
				onClick={clickImg}
				style={{
					cursor: 'pointer',
					width: '100px',
					height: '100px',
					border: '0.5px solid #f1f1f1',
				}}
			>
				{loading && <CircularProgress color="inherit" />}
			</Avatar>
			<input
				type="file"
				name="files"
				multiple={false}
				style={{ display: 'none' }}
				ref={inputFile}
				onChange={handleFileChange}
			/>
		</Box>
	);
};

export default UploadAvatar;
