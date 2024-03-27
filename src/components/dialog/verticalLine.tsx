interface IProps {
	active: boolean;
}

const VerticalLine = ({ active }: IProps) => {
	return (
		<div
			style={{
				backgroundColor: active ? '#0F172A' : '#94A3B8',
				width: '2px',
				height: '10px',
			}}
		/>
	);
};

export default VerticalLine;
