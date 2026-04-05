import { closeDatabase, initializeDatabase } from '../config/database'

async function migrate() {
  try {
    await initializeDatabase()
    console.log('Database migrations completed successfully')
  } catch (error) {
    console.error('Database migration failed:', error)
    process.exitCode = 1
  } finally {
    await closeDatabase()
  }
}

migrate()
