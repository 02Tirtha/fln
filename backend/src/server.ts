import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/environment';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']); // Yeh Node.js ka DNS bug fix karega
async function start(): Promise<void> {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`🚀 Server running on port ${env.port}`);
  });
}

start();
