export type TextElement = {
	type: 'plain' | 'href';
	value: string;
};

const useProof = () => {
	const splitProof = (text: string): Array<{ type: 'plain' | 'href'; value: string }> => {
		const regex =
			/((http|https)\:\/\/)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;
		const result: TextElement[] = [];
		let lastIndex = 0;

		text.replace(regex, (match, ...args) => {
			const index = args[args.length - 2];

			if (index > lastIndex) {
				result.push({ type: 'plain', value: text.substring(lastIndex, index) });
			}

			result.push({ type: 'href', value: match });

			lastIndex = index + match.length;
			return match;
		});

		if (lastIndex < text.length) {
			result.push({ type: 'plain', value: text.substring(lastIndex) });
		}

		return result;
	};

	return { splitProof };
};

export default useProof;
