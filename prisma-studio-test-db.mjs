import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)))
const testDbPath = path.join(root, 'data', 'test.db')
process.env.DATABASE_URL = `file:${testDbPath}`

execSync('npx prisma db push', { cwd: root, env: process.env, stdio: 'pipe' })
execSync('npx prisma studio --port 5556', { cwd: root, env: process.env, stdio: 'inherit' })
