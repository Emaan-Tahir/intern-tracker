import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import dns from 'dns';

dns.setServers(["1.1.1.1","8.8.8.8"]);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
