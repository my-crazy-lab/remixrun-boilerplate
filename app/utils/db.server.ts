import { MongoClient, BSON, Db } from 'mongodb';
import { dotenv } from '~/services/dotenv.server';

let connectionString = dotenv.URI_APP;

if (!connectionString) {
  throw new Error(
    'No connection string provided. \n\nPlease create a `.env` file in the root of this project. Add a CONNECTION_STRING variable to that file with the connection string to your MongoDB cluster. \nRefer to the README.md file for more information.',
  );
}
if (connectionString.indexOf('appName') === -1)
  connectionString +=
    connectionString.indexOf('?') > -1 ? '&appName=remix|' : '?appName=remix|';
else
  connectionString = connectionString.replace(
    /appName\=([a-z0-9]*)/i,
    (m, p) => `appName=remix|${p}`,
  );

let mongodb: Db;

declare global {
  var __db: MongoClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  mongodb = new MongoClient(connectionString).db(process.env.DB_APP);
} else {
  if (!global.__db) {
    global.__db = new MongoClient(connectionString);
  }
  mongodb = global.__db.db(process.env.DB_APP);
}

let ObjectId = BSON.ObjectId;

export { mongodb, ObjectId };
