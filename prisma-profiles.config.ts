import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema_profiles.prisma',
  datasource: {
    url: env('DATABASE_URL_PROFILES')
  },
})