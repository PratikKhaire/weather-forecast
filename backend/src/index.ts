import app from './app';
import { config } from './config';

const PORT = parseInt(config.PORT);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});