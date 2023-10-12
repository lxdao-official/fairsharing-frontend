import { SvgIconProps } from '@mui/material';
import AddSvg from './svg/add.svg';
import HomeSvg from './svg/home.svg';

const HomeIcon = (props: SvgIconProps) => {
	return <HomeSvg {...props} />;
};
const AddIcon = (props: SvgIconProps) => {
	return <AddSvg {...props} />;
};

export {
	AddIcon,
	HomeIcon,
};
