import React, { useState } from 'react';
import { CroppedFile, SelectedFile, Uploader3, UploadFile, UploadResult } from '@lxdao/uploader3';
import { Icon } from '@iconify/react';

import { createConnector } from '@lxdao/uploader3-connector';

import { PreviewFile, PreviewWrapper } from '@/components/uploadImage/preview';

export default function UploadImage() {
	const [file, setFile] = useState<SelectedFile | UploadFile | UploadResult | CroppedFile | null>(
		null,
	);

	const connector = createConnector('NFT.storage', {
		token: process.env.NFT_STORAGE_TOKEN as string,
	});

	return (
		<div style={{ padding: 10 }}>
			<Uploader3
				connector={connector}
				// api={'/api/upload/file?name=your-name'}
				multiple={false}
				// crop={true} // use default crop options
				onChange={(files) => {
					setFile(files[0]);
				}}
				onUpload={(file) => {
					setFile(file);
				}}
				onComplete={(file) => {
					setFile(file);
					console.log('onComplete file', file)
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
							<Icon
								icon={'material-symbols:cloud-upload'}
								color={'#65a2fa'}
								fontSize={60}
							/>
						</span>
					)}
				</PreviewWrapper>
			</Uploader3>
		</div>
	);
}
