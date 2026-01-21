import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    url: process.env.TURSO_DATABASE_URL!,
  },
  migrate: {
    adapter: async () => {
      const { createClient } = await import('@libsql/client')
      const { PrismaLibSQL } = await import('@prisma/adapter-libsql')

      const libsql = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })

      return new PrismaLibSQL(libsql)
    },
  },
})
