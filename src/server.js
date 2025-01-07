import app from './app.js'; // For ES Modules
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
