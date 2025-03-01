import app from './app.js';
import dbConnection from './config/dbConfig.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 9000;

const startServer = async () => {
  try {
    // Connect to the database
    await dbConnection();
    
    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
