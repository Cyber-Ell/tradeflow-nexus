import Joi from 'joi'

const priceTierSchema = Joi.object({
  minQuantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().positive().required(),
})

const specificationSchema = Joi.object().pattern(
  Joi.string().min(1).max(100),
  Joi.string().allow('').max(300)
)

const productImageSchema = Joi.alternatives().try(
  Joi.string().uri(),
  Joi.string().pattern(/^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/)
)

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
  moq: Joi.number().integer().min(1).default(1),
  category: Joi.string().optional().max(50),
  imageUrl: productImageSchema.optional().allow(''),
  size: Joi.string().optional().max(100).allow(''),
  length: Joi.string().optional().max(100).allow(''),
  colors: Joi.array().items(Joi.string().max(50)).optional(),
  specifications: specificationSchema.optional(),
  priceTiers: Joi.array().items(priceTierSchema).optional(),
})

export const updateProductSchema = Joi.object({
  name: Joi.string().optional().min(3).max(200),
  description: Joi.string().optional().max(1000),
  price: Joi.number().positive().optional(),
  quantity: Joi.number().integer().positive().optional(),
  moq: Joi.number().integer().min(1).optional(),
  category: Joi.string().optional().max(50),
  imageUrl: productImageSchema.optional().allow(''),
  size: Joi.string().optional().max(100).allow(''),
  length: Joi.string().optional().max(100).allow(''),
  colors: Joi.array().items(Joi.string().max(50)).optional(),
  specifications: specificationSchema.optional(),
  priceTiers: Joi.array().items(priceTierSchema).optional(),
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

export const verificationSubmissionSchema = Joi.object({
  documentType: Joi.string().valid('cac', 'tin', 'national_id', 'business_license').required(),
  documentNumber: Joi.string().required().max(100),
  notes: Joi.string().optional().max(500),
})

export const verificationReviewSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  notes: Joi.string().optional().max(500),
})

export const validateRequest = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false })
  if (error) {
    const messages = error.details.map(d => d.message).join(', ')
    throw new Error(messages)
  }
  return value
}
