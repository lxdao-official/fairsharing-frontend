import { Box, Modal, styled } from '@mui/material';

import { FC } from 'react';

import { CloseIcon } from '@/icons';
import { StyledFlexBox } from '@/components/styledComponents';


interface IProps {
	url: string;
	open: boolean;
	onClose: () => void;
}

const PreviewImageModal: FC<IProps> = (props) => {
	const onClose = () => {
		props.onClose();
	};

	return (
		<Modal open={props.open} keepMounted>
			<PreviewContainer>
				<img
					src={props.url}
					style={{ maxHeight: '80vh', maxWidth: '80vw' }}
					alt={'preview'}
				/>
				<CloseContainer onClick={onClose}>
					<CloseIcon width={24} height={24} />
				</CloseContainer>
			</PreviewContainer>
		</Modal>
	);
};

export default PreviewImageModal;

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
