import React, { useState } from 'react';
import { CroppedFile, SelectedFile, Uploader3, UploadFile, UploadResult } from '@lxdao/uploader3';

import { createConnector } from '@lxdao/uploader3-connector';

import { Typography } from '@mui/material';

import { Img3 } from '@lxdao/img3';

import { PreviewFile, PreviewWrapper } from '@/components/uploadImage/preview';

export interface IUploadImageProps {
	uploadSuccess?: (url: string) => void;
	defaultAvatar: string;
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
						<Img3
							style={{ maxHeight: '100%', maxWidth: '100%' }}
							src={props.defaultAvatar}
							alt={'FS'}
						/>
					)}
				</PreviewWrapper>
			</Uploader3>
		</div>
	);
}
