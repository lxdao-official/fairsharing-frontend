import { Box, styled } from '@mui/material';

export interface IProjectListProps {

}

const ProjectList = (props: IProjectListProps) => {
	return <Container>ProjectList</Container>
};

export default ProjectList;

const Container = styled(Box)({
	width: '280px',
	height: '256px',
	border: '1px solid #0F172A29',
	borderRadius: '8px',
	cursor: 'pointer',
	'&:hover': {
		backgroundColor: 'primary.main',
		opacity: [0.9, 0.8, 0.7],
	},
})
