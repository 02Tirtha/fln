const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'fln_platform';
(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const cursor = db.collection('users').find({ role: 'teacher' }).project({ email: 1, password: 1, passwordHash: 1 }).limit(10);
    const docs = await cursor.toArray();
    console.log(JSON.stringify(docs, null, 2));
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await client.close();
  }
})();
