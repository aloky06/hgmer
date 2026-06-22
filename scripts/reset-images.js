const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    data: { imageUrl: null }
  });
  console.log('All images reset to null to use reliable fallback!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
