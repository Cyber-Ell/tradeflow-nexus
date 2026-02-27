import Joi from 'joi'

export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(100),
  role: Joi.string().valid('vendor', 'wholesaler').required(),
  company: Joi.string().optional().max(100),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

export const createProductSchema = Joi.object({
  name: Joi.string().required().min(3).max(200),
  description: Joi.string().optional().max(1000),
  price: Joi.number().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  category: Joi.string().optional().max(50),
})

export const updateProductSchema = Joi.object({
  name: Joi.string().optional().min(3).max(200),
  description: Joi.string().optional().max(1000),
  price: Joi.number().positive().optional(),
  quantity: Joi.number().integer().positive().optional(),
  category: Joi.string().optional().max(50),
})

export const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().positive().required(),
    })
  ).required(),
  deliveryAddress: Joi.string().required(),
})

export const validateRequest = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false })
  if (error) {
    const messages = error.details.map(d => d.message).join(', ')
    throw new Error(messages)
  }
  return value
}