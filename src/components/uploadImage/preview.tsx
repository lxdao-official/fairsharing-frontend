import type { CroppedFile, SelectedFile, UploadFile, UploadResult } from '@lxdao/uploader3';
import { Icon } from '@iconify/react';
import React from 'react';
import { Img3 } from '@lxdao/img3';

import { styled } from '@mui/material';

export const PreviewFile = (props: {
	file: SelectedFile | UploadFile | UploadResult | CroppedFile;
	style?: React.CSSProperties;
}) => {
	const { file } = props;

	let src: string;
	if (file.status === 'uploading') {
		src = file.thumbData || file.imageData;
	} else if (file.status === 'done') {
		src = file.url;
	} else if (file.status === 'cropped') {
		src = file.thumbData;
	} else {
		src = file.previewUrl;
	}

	return (
		<>
			<Img3 style={{ maxHeight: '100%', maxWidth: '100%' }} src={src} alt={file.name} />
			{file.status === 'uploading' && (
				<Status>
					<Icon icon={'line-md:uploading-loop'} color={'#65a2fa'} width={40} />
				</Status>
			)}
			{file.status === 'error' && (
				<Status>
					<Icon icon={'iconoir:cloud-error'} color={'#ffb7b7'} width={40} />
				</Status>
			)}
		</>
	);
};

export const PreviewWrapper = styled('div')({
	width: 200,
	height: 200 * 0.75, // 4:3
	backgroundColor: '#f2f4f6',
	color: '#333',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	border: '2px solid #fff',
	borderRadius: 200,
	overflow: 'hidden',
	position: 'relative',
	marginRight: 10,
	marginBottom: 10,
});

const Status = styled('div')({
	position: 'absolute',
	top: '0px',
	left: '0px',
	width: '100%',
	height: '100%',
	backgroundColor: 'rgba(0, 0, 0, 0.5)',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	color: '#fff',
});
