require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB, closeDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP Server
const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🍲 BhojanSeva Backend Server is LIVE!`);
    console.log(`🚀 Port: ${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n[${signal}] Received. Shutting down gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      await closeDB();
      process.exit(0);
    });

    // Force exit after 10s if dangling connections
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('[Unhandled Rejection]', err);
  });

  process.on('uncaughtException', (err) => {
    console.error('[Uncaught Exception]', err);
  });
};

startServer();
