const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Export pool for use in other files
module.exports = {
  pool,
  
  // Helper method for running queries
  query: (text, params) => pool.query(text, params),
  
  // Get a client from the pool for transactions
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Override client.query to add logging in development
    client.query = (...args) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('QUERY:', args[0]);
      }
      return query.apply(client, args);
    };
    
    // Override client.release to handle errors
    client.release = () => {
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    
    return client;
  }
};