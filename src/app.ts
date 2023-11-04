import express from 'express';
import mongoose from 'mongoose';
import config from 'config';
import movieRoutes from './routes/movie.route';
import redis  from './services/redisClient';
const app = express();

mongoose.connect(config.get('mongodbURL'));

app.use(express.json());
app.use('/', movieRoutes);

export const closeConnections = () =>{
  redis.disconnect();
  mongoose.connection.close();
}
export default app;
