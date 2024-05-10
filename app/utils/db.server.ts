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
mongoClientBE.on('connected', () => {
  // eslint-disable-next-line no-console
  console.log(`Connected db ${dotenv.MONGO_URI}/${dotenv.DB_NAME}`);
});

const mongoClientApp = createConnection(
  `${dotenv.MONGO_URI_APP}/${dotenv.APP_DB_NAME}`,
);
mongoClientApp.on('connected', () => {
  // eslint-disable-next-line no-console
  console.log(`Connected db app ${dotenv.MONGO_URI_APP}/${dotenv.APP_DB_NAME}`);
});

export { mongoClientApp, mongoClientBE };

if (process.env.NODE_ENV === 'test') {
  if (!global.__db) {
    global.__db = { mongoClientApp, mongoClientBE };
  }
}
