const { cleanEnv, str, num, port } = require('envalid');

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 3000 }),
  DATABASE_URL: str({ desc: 'PostgreSQL connection string' }),
  JWT_SECRET: str({ desc: 'JWT signing secret' }),
});

module.exports = env;