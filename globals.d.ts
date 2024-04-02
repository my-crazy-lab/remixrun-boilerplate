export {};

declare global {
  var __db: MongoClient | undefined;
  type BtaskeeErrorConstructor = Error;
}
