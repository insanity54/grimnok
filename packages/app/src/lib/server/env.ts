// ensure that environment variables are loaded and available and valid types

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL env var missing');
if (!process.env.ORIGIN) throw new Error('ORIGIN env var missing');
if (!process.env.IPC_SECRET) throw new Error('ORIGIN env var missing');

const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    ORIGIN: process.env.ORIGIN,
    IPC_SECRET: process.env.IPC_SECRET,
}

export default env