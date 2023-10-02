import { Button, Stack } from '@mui/material';
import React, { useMemo } from 'react';

interface IButtonGroupProps {
	canEdit: boolean;
	isEdited: boolean;
	isSettingPage: boolean;
	handlePrimary: () => void;
	handleSecondary: () => void;
}

export default function ButtonGroup(props: IButtonGroupProps) {
	const { canEdit, isEdited, isSettingPage, handleSecondary, handlePrimary } = props;

	const content = useMemo(() => {
		if (!isSettingPage) {
			return (
				<Button variant="outlined" onClick={handleSecondary}>
					Back
				</Button>
			);
		}
		if (isEdited) {
			return (
				<Button variant="outlined" onClick={handleSecondary}>
					Cancel
				</Button>
			);
		}
	}, [isSettingPage, isEdited]);

	return (
		<>
			{canEdit ? (
				<Stack
					direction={!isSettingPage ? 'row-reverse' : 'row'}
					justifyContent={!isSettingPage ? 'flex-end' : 'flex-start'}
					spacing={2}
					sx={{ marginTop: '40px' }}
				>
					<Button
						variant={'contained'}
						onClick={handlePrimary}
						disabled={!isSettingPage ? false : !isEdited}
					>
						{isSettingPage ? 'Save' : 'Next'}
					</Button>
					{content}
				</Stack>
			) : null}
		</>
	);
}
