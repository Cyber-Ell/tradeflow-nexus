import fs from 'fs'
import path from 'path'
import { Database } from 'sqlite'

export async function runMigrations(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      appliedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const migrationDir = path.resolve(__dirname, 'migrations')
  if (!fs.existsSync(migrationDir)) {
    return
  }

  const files = fs.readdirSync(migrationDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const applied = await db.get(
      'SELECT filename FROM schema_migrations WHERE filename = ?',
      [file]
    )

    if (applied) {
      continue
    }

    const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8')
    await db.exec('BEGIN')

    try {
      await db.exec(sql)
      await db.run(
        'INSERT INTO schema_migrations (filename) VALUES (?)',
        [file]
      )
      await db.exec('COMMIT')
    } catch (error) {
      await db.exec('ROLLBACK')
      throw error
    }
  }
}
