import {
  type Document,
  type ObjectId,
  type PipelineStage,
  Types,
  createConnection,
} from 'mongoose';
import { dotenv } from '~/services/dotenv.server';

export type Projection = PipelineStage.Project['$project'];

export { Document, ObjectId, PipelineStage, Types };

const mongoClientBE = createConnection(`${dotenv.MONGO_URI}/${dotenv.DB_NAME}`);
// eslint-disable-next-line no-console
console.log(`Connected db backend ${dotenv.MONGO_URI}/${dotenv.DB_NAME}`);

const mongoClientApp = createConnection(
  `${dotenv.MONGO_URI_APP}/${dotenv.APP_DB_NAME}`,
);
// eslint-disable-next-line no-console
console.log(`Connected db app ${dotenv.MONGO_URI_APP}/${dotenv.APP_DB_NAME}`);

export { mongoClientApp, mongoClientBE };
