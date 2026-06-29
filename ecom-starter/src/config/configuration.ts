import * as Joi from 'joi';

/**
 * Centralised, typed environment configuration.
 *
 * `validationSchema` is enforced by @nestjs/config at boot — the app refuses
 * to start with a missing or malformed MONGODB_URI rather than failing later
 * at the first database call.
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(8000),
  CORS_ORIGINS: Joi.string().default('http://localhost:8000'),
  MONGODB_URI: Joi.string().required(),
  SWAGGER_USER: Joi.string().optional().allow(''),
  SWAGGER_PASSWORD: Joi.string().optional().allow(''),
});

export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '8000', 10),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:8000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  mongodbUri: process.env.MONGODB_URI,
});
