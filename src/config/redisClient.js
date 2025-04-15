import { createClient } from 'redis';

const redisClient = createClient({
    socket: {
        host: 'redis-12107.c10.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 12107
    },
    username: 'default',
    password: 'CL9uuIBK8czFCNcxqLs7ipeZrpddVPOu'
});

redisClient.on('error', (err) => console.log('Redis Error:', err));

await redisClient.connect();

export default redisClient;
