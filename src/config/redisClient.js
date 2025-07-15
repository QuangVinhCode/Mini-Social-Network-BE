import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on("error", (err) => console.log("Redis Error:", err));

await redisClient.connect();

export default redisClient;
