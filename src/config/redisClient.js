import { createClient } from 'redis';

const redisClient = createClient({
    socket: {
        host: 'redis-14691.c8.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 14691
    },
    username: 'default',
    password: 'h1k3zbf3nCIIZps1oiXYMgx3xYevEUeA'
});

redisClient.on('error', (err) => console.log('Redis Error:', err));

await redisClient.connect();

export default redisClient;
