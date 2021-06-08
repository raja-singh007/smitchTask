module.exports = {
    env: 'dev',
    db: 'mongodb://localhost:27017/smitch-task',
    port: 9001,
    jwtSecret: 'SmitchTask123',
    passportOptions: false,
    redisHost:'127.0.0.1' ,
    redisPort: '6379',
};