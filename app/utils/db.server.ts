import {
  type Document,
  type ObjectId,
  type PipelineStage,
  Types,
  createConnection,
} from 'mongoose';
import { dotenv } from '~/services/dotenv.server';

const mongoClientBE = createConnection(`${dotenv.MONGO_URI}/${dotenv.DB_NAME}`);
// eslint-disable-next-line no-console
console.log(`Connected db backend ${dotenv.MONGO_URI}/${dotenv.DB_NAME}`);
export { mongoClientBE };

export type Projection = PipelineStage.Project['$project'];

export { Document, Types, ObjectId, PipelineStage };
