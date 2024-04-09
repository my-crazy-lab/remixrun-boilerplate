import { BSON, MongoClient } from 'mongodb';
import type { Db } from 'mongodb';
import { dotenv } from '~/services/dotenv.server';

const connectionString = dotenv.URI_APP;

if (!connectionString) {
  throw new Error(
    'No connection string provided. \n\nPlease create a `.env` file in the root of this project. Add a CONNECTION_STRING variable to that file with the connection string to your MongoDB cluster. \nRefer to the README.md file for more information.',
  );
}

let mongodb: Db;

if (process.env.NODE_ENV === 'production') {
  const client = new MongoClient(connectionString);
  client.connect();

  mongodb = client.db(process.env.DB_APP);
} else {
  if (!global?.__db) {
    global.__db = new MongoClient(connectionString);
  }
  global.__db.connect();

  mongodb = global.__db.db(process.env.DB_APP);
}

const ObjectId = BSON.ObjectId;

export { mongodb, ObjectId };
