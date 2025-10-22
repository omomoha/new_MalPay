import { Pool, PoolConfig } from 'pg';
import { logger } from '../utils/logger';

// Database configuration for Railway
const dbConfig: PoolConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'malpay',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    logger.info('Database connection established');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    logger.info('Database test query successful:', result.rows[0]);
    
    client.release();
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

// Database query helper
export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Database query error:', { text, error });
    throw error;
  }
};

// Transaction helper
export const transaction = async (callback: (client: any) => Promise<any>): Promise<any> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  await pool.end();
  logger.info('Database connection closed');
};
