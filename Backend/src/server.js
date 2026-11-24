require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = Number(process.env.PORT || 5000);

async function start() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in .env');
  }

  await testConnection();

  app.listen(PORT, () => {
    console.log(`TIFFIN FLOW API running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});