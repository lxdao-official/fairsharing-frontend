import React, { useState } from 'react';
import { CroppedFile, SelectedFile, Uploader3, UploadFile, UploadResult } from '@lxdao/uploader3';
import { Icon } from '@iconify/react';

import { createConnector } from '@lxdao/uploader3-connector';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { Typography } from '@mui/material';

import { PreviewFile, PreviewWrapper } from '@/components/uploadImage/preview';

export interface IUploadImageProps {
	uploadSuccess?: (url: string) => void;
}

export default function UploadImage(props: IUploadImageProps) {
	const [file, setFile] = useState<SelectedFile | UploadFile | UploadResult | CroppedFile | null>(
		null,
	);

	const connector = createConnector('NFT.storage', {
		token: process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN as string,
	});

	return (
		<div style={{ padding: 10 }}>
			<Typography>Avatar</Typography>
			<Uploader3
				connector={connector}
				multiple={false}
				onChange={(files) => {
					setFile(files[0]);
				}}
				onUpload={(file) => {
					setFile(file);
				}}
				onComplete={(file) => {
					setFile(file);
					console.log('onComplete file', file);
					if (file.status === 'done' && props.uploadSuccess) {
						props.uploadSuccess(file.url);
					}
				}}
				onCropCancel={(file) => {
					setFile(null);
				}}
				onCropEnd={(file) => {
					setFile(file);
				}}
			>
				<PreviewWrapper style={{ height: 200, width: 200 }}>
					{file ? (
						<PreviewFile file={file} />
					) : (
						<span>
							<AccountCircleIcon sx={{ color: '#94a3b8', fontSize: 200 }} />
						</span>
					)}
				</PreviewWrapper>
			</Uploader3>
		</div>
	);
}
