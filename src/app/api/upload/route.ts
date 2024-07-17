import { NextResponse, NextRequest } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const S3Prefix = 'images/';
const S3Bucket = process.env.AWS_S3_BUCKET || 'fs-imgs';
const S3Region = process.env.AWS_S3_REGION || 'us-east-1';

const s3 = new S3Client({
	region: S3Region,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
	},
});

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();
		const files = formData.getAll('file') as File[];
		const uploadPromises = files.map(async (file) => {
			const Body = (await file.arrayBuffer()) as Buffer;
			const filename = uuidv4();
			await s3.send(
				new PutObjectCommand({
					Bucket: S3Bucket,
					Key: `${S3Prefix}${filename}`,
					Body,
					ContentDisposition: 'inline',
					ContentType: file.type,
				}),
			);
			return {
				// originalName: file.name,
				name: filename,
				// originUrl: `https://${S3Bucket}.s3.${S3Region}.amazonaws.com/${S3Prefix}${filename}`,
				url: `https://cdn.fairsharing.xyz/${S3Prefix}${filename}`,
				// ContentType: file.type,
			};
		});

		const responses = await Promise.all(uploadPromises);

		return NextResponse.json(
			{
				message: 'upload success',
				data: responses,
				code: 0,
				success: true,
			},
			{ status: 201 },
		);
	} catch (error: any) {
		console.error('upload fail', error);
		return NextResponse.json(
			{ message: 'upload fail', error: error.message, success: false, code: 1001 },
			{ status: 500 },
		);
	}
}
