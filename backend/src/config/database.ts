import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
    mongoose.connection.on('connected', () => {
        const { host, port, name } = mongoose.connection;
        console.log(`✅ MongoDB Connected — Host: ${host}, Port: ${port}, Database: ${name}`);
    });

    mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
    });


}