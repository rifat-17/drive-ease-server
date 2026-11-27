import 'dotenv/config';
import app from './app.js';
import { connectToMongoDB } from './config/db.js';

const port = process.env.PORT || 5001;

await connectToMongoDB();

app.listen(port, () => {
  console.log(`Driving on port ${port}`);
});

export default app;
