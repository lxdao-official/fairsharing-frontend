/**
 * 根据传入数量，随机生成数字，数组之和为100
 * @param len
 */
export function generateWeightArray(len: number, sums?: number): number[] {
	if (len < 1) {
		throw new Error('数组长度必须大于等于1');
	}

	const arr: number[] = [];
	let remainingSum = sums || 100;

	for (let i = 0; i < len; i++) {
		if (i === len - 1) {
			arr.push(remainingSum);
		} else {
			const maxItem = remainingSum - (len - i - 1);
			const item = Math.floor(Math.random() * (maxItem - 1)) + 1;
			arr.push(item);
			remainingSum -= item;
		}
	}

	return arr;
}
