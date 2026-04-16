import pgPkg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import prismaPkg from '@prisma/client'

const { Pool } = pgPkg
const { PrismaClient } = prismaPkg

const connectionString = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/delivery_db?schema=public"

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })
