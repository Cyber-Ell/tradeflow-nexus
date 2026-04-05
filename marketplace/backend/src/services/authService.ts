import { getDatabase } from '../config/database'
import { generateToken } from '../utils/jwt'
import { validateRequest, registerSchema, loginSchema } from '../utils/validation'
import { User } from '../types'
import bcryptjs from 'bcryptjs'
import { v4 as uuid } from 'uuid'

export async function registerUser(data: any): Promise<{ user: Omit<User, 'password'>, token: string }> {
  const validated = validateRequest(registerSchema, data)
  
  const db = await getDatabase()
  const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [validated.email])
  
  if (existingUser) {
    throw new Error('Email already registered')
  }

  const hashedPassword = await bcryptjs.hash(validated.password, 10)
  const userId = uuid()
  const initialStatus = validated.role === 'vendor' ? 'pending' : 'active'

  await db.run(
    `INSERT INTO users (id, name, email, password, role, status, company) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, validated.name, validated.email, hashedPassword, validated.role, initialStatus, validated.company || null]
  )

  const user = await db.get('SELECT * FROM users WHERE id = ?', [userId])
  delete user.password

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  return { user, token }
}

export async function loginUser(data: any): Promise<{ user: Omit<User, 'password'>, token: string }> {
  const validated = validateRequest(loginSchema, data)

  const db = await getDatabase()
  const user = await db.get('SELECT * FROM users WHERE email = ?', [validated.email])

  if (!user) {
    throw new Error('Invalid email or password')
  }

  if (user.status === 'rejected') {
    throw new Error('Account has been rejected')
  }

  if (user.role === 'vendor' && user.status !== 'approved' && user.status !== 'active') {
    throw new Error('Vendor account is pending approval')
  }

  if (user.role === 'wholesaler' && user.status !== 'active' && user.status !== 'approved') {
    throw new Error('Wholesaler account is not active')
  }

  const passwordMatch = await bcryptjs.compare(validated.password, user.password)
  if (!passwordMatch) {
    throw new Error('Invalid email or password')
  }

  delete user.password

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  return { user, token }
}

export async function getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
  const db = await getDatabase()
  const user = await db.get('SELECT * FROM users WHERE id = ?', [userId])
  if (user) {
    delete user.password
  }
  return user || null
}

export async function updateUserProfile(userId: string, data: any): Promise<Omit<User, 'password'>> {
  const db = await getDatabase()
  const { name, company, profileImage } = data

  const existingUser = await db.get(
    'SELECT name, company, profileImage FROM users WHERE id = ?',
    [userId]
  )

  if (!existingUser) {
    throw new Error('User not found')
  }

  await db.run(
    `UPDATE users SET name = ?, company = ?, profileImage = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [
      name ?? existingUser.name,
      company ?? existingUser.company ?? null,
      profileImage ?? existingUser.profileImage ?? null,
      userId,
    ]
  )

  const user = await getUserById(userId)
  if (!user) throw new Error('User not found')
  return user
}
