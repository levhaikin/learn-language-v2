import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';


dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// console.log(process.env.DATABASE_URL);

export const sql = neon(process.env.DATABASE_URL);

// Test the connection
// sql.connect()
//   .then(() => console.log('Connected to Neon PostgreSQL database'))
//   .catch((err) => console.error('Error connecting to database:', err)); 