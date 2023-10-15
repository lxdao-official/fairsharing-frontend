import { SvgIcon, SvgIconProps } from '@mui/material';

import LogoSvg from './svg/logo.svg';
import AddSvg from './svg/add.svg';
import HomeSvg from './svg/home.svg';

import ForSvg from './svg/for.svg';
import ForReadySvg from './svg/for_ready.svg';
import ForDisabledSvg from './svg/for_disabled.svg';
import ForActionSvg from './svg/action_for.svg';
import AgainstSvg from './svg/against.svg';
import AgainstReadySvg from './svg/against_ready.svg';
import AgainstDisabledSvg from './svg/against_disabled.svg';
import AgainstActionSvg from './svg/action_against.svg';
import AbstainSvg from './svg/abstain.svg';
import AbstainReadySvg from './svg/abstain_ready.svg';
import AbstainDisabledSvg from './svg/abstain_disbaled.svg';
import AbstainActionSvg from './svg/action_abstain.svg';

import PizzaGraySvg from './svg/pizza_gray.svg';
import PizzaOrangeSvg from './svg/pizza_orange.svg';

import FileSvg from './svg/file.svg';
import EasLogoSvg from './svg/eas.svg';
import MoreSvg from './svg/more-horizontal.svg';
import FilterSvg from './svg/filter.svg';
import LinkSvg from './svg/link.svg'

const LogoIcon = (props: SvgIconProps) => <LogoSvg {...props} />;

const HomeIcon = (props: SvgIconProps) => <HomeSvg {...props} />;
const AddIcon = (props: SvgIconProps) => <AddSvg {...props} />;
const ForIcon = (props: SvgIconProps) => <ForSvg {...props} />;
const ForReadyIcon = (props: SvgIconProps) => <ForReadySvg {...props} />;
const ForDisabledIcon = (props: SvgIconProps) => <ForDisabledSvg {...props} />;
const ForActionIcon = (props: SvgIconProps) => <ForActionSvg {...props} />;

const AgainstIcon = (props: SvgIconProps) => <AgainstSvg {...props} />;
const AgainstReadyIcon = (props: SvgIconProps) => <AgainstReadySvg {...props} />;
const AgainstDisabledIcon = (props: SvgIconProps) => <AgainstDisabledSvg {...props} />;
const AgainstActionIcon = (props: SvgIconProps) => <AgainstActionSvg {...props} />;

const AbstainIcon = (props: SvgIconProps) => <AbstainSvg {...props} />;
const AbstainReadyIcon = (props: SvgIconProps) => <AbstainReadySvg {...props} />;
const AbstainDisabledIcon = (props: SvgIconProps) => <AbstainDisabledSvg {...props} />;
const AbstainActionIcon = (props: SvgIconProps) => <AbstainActionSvg {...props} />;

const PizzaGrayIcon = (props: SvgIconProps) => <PizzaGraySvg {...props} />;
const PizzaOrangeIcon = (props: SvgIconProps) => <PizzaOrangeSvg {...props} />;
const FileIcon = (props: SvgIconProps) => <FileSvg {...props} />;
const EasLogoIcon = (props: SvgIconProps) => <EasLogoSvg {...props} />;
const MoreIcon = (props: SvgIconProps) => <MoreSvg {...props} />;
const FilterIcon = (props: SvgIconProps) => <FilterSvg {...props} />;
const LinkIcon = (props: SvgIconProps) => <LinkSvg {...props} />;

const ContributionIcon = (props: SvgIconProps) => (
	<SvgIcon {...props}>
		<path
			d="M20 3H19V1H17V3H7V1H5V3H4C2.9 3 2 3.9 2 5V21C2 22.1 2.9 23 4 23H20C21.1 23 22 22.1 22 21V5C22 3.9 21.1 3 20 3ZM20 21H4V8H20V21Z"
			fill={props.fill}
		/>
	</SvgIcon>
);
const ContributorIcon = (props: SvgIconProps) => (
	<SvgIcon {...props}>
		<path
			d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
			fill={props.fill}
		/>
	</SvgIcon>
);
const DashboardIcon = (props: SvgIconProps) => (
	<SvgIcon {...props}>
		<path
			d="M11.99 18.54L4.62 12.81L3 14.07L12 21.07L21 14.07L19.37 12.8L11.99 18.54ZM12 16L19.36 10.27L21 9L12 2L3 9L4.63 10.27L12 16Z"
			fill={props.fill}
		/>
	</SvgIcon>
);
const SettingIcon = (props: SvgIconProps) => (
	<SvgIcon {...props}>
		<path
			d="M19.1401 12.94C19.1801 12.64 19.2001 12.33 19.2001 12C19.2001 11.68 19.1801 11.36 19.1301 11.06L21.1601 9.47999C21.3401 9.33999 21.3901 9.06999 21.2801 8.86999L19.3601 5.54999C19.2401 5.32999 18.9901 5.25999 18.7701 5.32999L16.3801 6.28999C15.8801 5.90999 15.3501 5.58999 14.7601 5.34999L14.4001 2.80999C14.3601 2.56999 14.1601 2.39999 13.9201 2.39999H10.0801C9.84011 2.39999 9.65011 2.56999 9.61011 2.80999L9.25011 5.34999C8.66011 5.58999 8.12011 5.91999 7.63011 6.28999L5.24011 5.32999C5.02011 5.24999 4.77011 5.32999 4.65011 5.54999L2.74011 8.86999C2.62011 9.07999 2.66011 9.33999 2.86011 9.47999L4.89011 11.06C4.84011 11.36 4.80011 11.69 4.80011 12C4.80011 12.31 4.82011 12.64 4.87011 12.94L2.84011 14.52C2.66011 14.66 2.61011 14.93 2.72011 15.13L4.64011 18.45C4.76011 18.67 5.01011 18.74 5.23011 18.67L7.62011 17.71C8.12011 18.09 8.65011 18.41 9.24011 18.65L9.60011 21.19C9.65011 21.43 9.84011 21.6 10.0801 21.6H13.9201C14.1601 21.6 14.3601 21.43 14.3901 21.19L14.7501 18.65C15.3401 18.41 15.8801 18.09 16.3701 17.71L18.7601 18.67C18.9801 18.75 19.2301 18.67 19.3501 18.45L21.2701 15.13C21.3901 14.91 21.3401 14.66 21.1501 14.52L19.1401 12.94ZM12.0001 15.6C10.0201 15.6 8.40011 13.98 8.40011 12C8.40011 10.02 10.0201 8.39999 12.0001 8.39999C13.9801 8.39999 15.6001 10.02 15.6001 12C15.6001 13.98 13.9801 15.6 12.0001 15.6Z"
			fill={props.fill}
		/>
	</SvgIcon>
);

export {
	LogoIcon,
	AddIcon,
	HomeIcon,
	ForIcon,
	ForReadyIcon,
	ForDisabledIcon,
	ForActionIcon,
	AgainstIcon,
	AgainstReadyIcon,
	AgainstDisabledIcon,
	AgainstActionIcon,
	AbstainIcon,
	AbstainReadyIcon,
	AbstainDisabledIcon,
	AbstainActionIcon,
	PizzaGrayIcon,
	PizzaOrangeIcon,
	FileIcon,
	EasLogoIcon,
	MoreIcon,
	FilterIcon,
	ContributionIcon,
	ContributorIcon,
	DashboardIcon,
	SettingIcon,
	LinkIcon
};
