import 'dotenv/config';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

let database = null;

export async function connectToMongoDB() {
  try {
    await client.connect();
    database = client.db('driveEase');
    console.log('You successfully connected to MongoDB!');
    return client;
  } catch (err) {
    console.dir(err);
    throw err;
  }
}

export function getDb() {
  if (!database) {
    throw new Error('MongoDB is not connected');
  }

  return database;
}

export function getCollection(name) {
  return getDb().collection(name);
}
