import fs from 'fs';
import path from 'path';

export async function GET(request: Request, res: Response) {
	const filePath = path.join(process.cwd(), 'public/safe', 'manifest.json');
	const jsonData = fs.readFileSync(filePath, 'utf8');
	return new Response(jsonData, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET',
			'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
		},
	});
}
