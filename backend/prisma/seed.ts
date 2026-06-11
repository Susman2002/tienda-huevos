//import { PrismaClient, ProductFamily, EggGrade, PackSize, BaseStockUnit } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, ProductFamily, EggGrade, PackSize, BaseStockUnit } from '@prisma/client'

//const prisma = new PrismaClient()

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

const ALERT_THRESHOLD_EGGS = 600
const ALERT_THRESHOLD_PACKS = 20

async function main() {
  console.log('🌱 Seeding products...')

  // ─── HUEVOS NORMALES ───────────────────────────────────────────
  const normalGrades: { grade: EggGrade; name: string }[] = [
    { grade: 'EXTRA',    name: 'Huevo Normal Extra'    },
    { grade: 'ESPECIAL', name: 'Huevo Normal Especial' },
    { grade: 'PRIMERA',  name: 'Huevo Normal Primera'  },
    { grade: 'SEGUNDA',  name: 'Huevo Normal Segunda'  },
    { grade: 'TERCERA',  name: 'Huevo Normal Tercera'  },
    { grade: 'CUARTA',   name: 'Huevo Normal Cuarta'   },
    { grade: 'QUINTA',   name: 'Huevo Normal Quinta'   },
  ]

  for (const { grade, name } of normalGrades) {
    const sku = `NORM-${grade}`
    const product = await prisma.product.upsert({
      where: { sku },
      update: {},
      create: {
        sku,
        name,
        family: ProductFamily.NORMAL,
        grade,
        baseStockUnit: BaseStockUnit.EGG,
        alertThreshold: ALERT_THRESHOLD_EGGS,
        isActive: true,
      },
    })
    await prisma.stock.upsert({
      where: { productId: product.id },
      update: {},
      create: { productId: product.id, onHand: 0, averageUnitCost: 0 },
    })
    console.log(`  ✅ ${name}`)
  }

  // ─── HUEVOS BLANCOS ────────────────────────────────────────────
  const whiteGrades: { grade: EggGrade; name: string }[] = [
    { grade: 'PRIMERA', name: 'Huevo Blanco Primera' },
    { grade: 'SEGUNDA', name: 'Huevo Blanco Segunda' },
    { grade: 'TERCERA', name: 'Huevo Blanco Tercera' },
    { grade: 'CUARTA',  name: 'Huevo Blanco Cuarta'  },
  ]

  for (const { grade, name } of whiteGrades) {
    const sku = `BLANC-${grade}`
    const product = await prisma.product.upsert({
      where: { sku },
      update: {},
      create: {
        sku,
        name,
        family: ProductFamily.WHITE,
        grade,
        baseStockUnit: BaseStockUnit.EGG,
        alertThreshold: ALERT_THRESHOLD_EGGS,
        isActive: true,
      },
    })
    await prisma.stock.upsert({
      where: { productId: product.id },
      update: {},
      create: { productId: product.id, onHand: 0, averageUnitCost: 0 },
    })
    console.log(`  ✅ ${name}`)
  }

  // ─── HUEVOS EMBALADOS ──────────────────────────────────────────
  const packaged: { packSize: PackSize; units: number; name: string }[] = [
    { packSize: 'P30', units: 30, name: 'Huevo Embalado x30' },
    { packSize: 'P20', units: 20, name: 'Huevo Embalado x20' },
    { packSize: 'P10', units: 10, name: 'Huevo Embalado x10' },
    { packSize: 'P6',  units: 6,  name: 'Huevo Embalado x6'  },
  ]

  for (const { packSize, units, name } of packaged) {
    const sku = `EMB-${packSize}`
    const product = await prisma.product.upsert({
      where: { sku },
      update: {},
      create: {
        sku,
        name,
        family: ProductFamily.PACKAGED,
        packSize,
        baseStockUnit: BaseStockUnit.PACK,
        unitsPerPack: units,
        alertThreshold: ALERT_THRESHOLD_PACKS,
        isActive: true,
      },
    })
    await prisma.stock.upsert({
      where: { productId: product.id },
      update: {},
      create: { productId: product.id, onHand: 0, averageUnitCost: 0 },
    })
    console.log(`  ✅ ${name}`)
  }

  // ─── ADMIN POR DEFECTO ─────────────────────────────────────────
  const { hash } = await import('bcryptjs')
  const adminPassword = await hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@tiendahuevos.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@tiendahuevos.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log('  ✅ Admin user: admin@tiendahuevos.com / admin123')

  console.log('\n🎉 Seed completado!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })