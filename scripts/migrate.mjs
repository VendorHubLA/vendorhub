/**
 * VendorHub database migration runner
 * Usage: node scripts/migrate.mjs
 * Reads DATABASE_URL from .env.local or environment
 */
import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = join(__dirname, '../.env.local')
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=')
    if (key && val.length && !key.startsWith('#')) {
      process.env[key.trim()] = val.join('=').trim()
    }
  })
} catch {}

const DB_URL = process.env.DATABASE_URL
if (!DB_URL) {
  console.error('DATABASE_URL not set in .env.local')
  process.exit(1)
}

const SQL = readFileSync(
  join(__dirname, '../supabase/migrations/001_initial_schema.sql'),
  'utf8'
)

async function main() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
    // Force IPv4 to avoid IPv6 timeout issues
    family: 4,
  })

  console.log('Connecting to Supabase Postgres...')
  await client.connect()
  console.log('Connected. Running migration...')

  try {
    await client.query(SQL)
    console.log('✓ Migration complete.')
  } catch (err) {
    console.error('✗ Migration failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
