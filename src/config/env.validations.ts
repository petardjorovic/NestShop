import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string().valid('production', 'development', 'test'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().required(),
});
