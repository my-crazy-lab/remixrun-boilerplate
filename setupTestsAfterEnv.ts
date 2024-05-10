afterAll(() => {
  if (global.__db) {
    global.__db.mongoClientApp.close();
    global.__db.mongoClientBE.close();
  }
});
