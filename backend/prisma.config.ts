import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  schema: 'prisma/schema.prisma',
})