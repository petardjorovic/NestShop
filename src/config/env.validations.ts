import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().required(),
  APP_URL: Joi.string().default('http://localhost:3000'),
  FRONTEND_URL: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required(),
    otherwise: Joi.string().default('http://localhost:5173'),
  }),
  APP_VERSION: Joi.number().default(1),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
  CSRF_SECRET: Joi.string().required(),
  RESEND_API_KEY: Joi.string().required(),
  MAIL_FROM: Joi.string().required(),
});
