export function generateUUID(): string {
	const uuidVersion = 4;

	// 生成一个随机的UUID变体号（8、9、A、B表示RFC4122规定的变体）
	const uuidVariant = '89ab'[Math.floor(Math.random() * 4)];

	// 生成16个随机的十六进制字符
	let uuid = '';
	for (let i = 0; i < 16; i++) {
		uuid += Math.floor(Math.random() * 16).toString(16);
	}

	uuid =
		uuid.substring(0, 8) +
		'-' +
		uuid.substring(8, 12) +
		'-' +
		uuidVersion.toString(16) +
		uuid.substring(13, 16) +
		'-' +
		uuidVariant +
		uuid.substring(17);

	return uuid;
}
