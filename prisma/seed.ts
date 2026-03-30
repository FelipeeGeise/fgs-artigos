import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Rodando seed...")

  // teste simples
  await prisma.$executeRaw`SELECT 1`

  console.log("✅ Seed finalizado!")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })