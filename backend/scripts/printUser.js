const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'fln_platform';
(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const user = await db.collection('users').findOne({ email: 'superadmin@fln.org' });
    console.log(JSON.stringify(user, null, 2));
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await client.close();
  }
})();
