import {
  type UploadHandlerPart,
  writeAsyncIterableToWritable,
} from '@remix-run/node';
import AWS from 'aws-sdk';
import { PassThrough } from 'stream';
import { dotenv } from '~/services/dotenv.server';

export const s3UploadHandler = async ({
  name,
  filename,
  data,
}: UploadHandlerPart) => {
  const s3 = new AWS.S3({
    credentials: {
      accessKeyId: dotenv.STORAGE_ACCESS_KEY,
      secretAccessKey: dotenv.STORAGE_SECRET,
    },
    region: dotenv.STORAGE_REGION,
  });

  const writable = new PassThrough();
  await writeAsyncIterableToWritable(data, writable);

  const file = await s3
    .upload({
      Bucket: dotenv.STORAGE_BUCKET,
      Key: `image/${Date.now()}_${filename || ''}`,
      Body: writable,
    })
    .promise();

  return file.Location;
};
