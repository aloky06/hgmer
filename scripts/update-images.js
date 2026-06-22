const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    where: { name: { contains: 'Diya' } },
    data: { imageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop' }
  });
  await prisma.product.updateMany({
    where: { name: { contains: 'Kumkum' } },
    data: { imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&fit=crop' }
  });
  await prisma.product.updateMany({
    where: { name: { contains: 'Thali' } },
    data: { imageUrl: 'https://images.unsplash.com/photo-1582376432754-b63cc6a9b8c3?w=400&fit=crop' }
  });
  await prisma.product.updateMany({
    where: { name: { contains: 'Combo' } },
    data: { imageUrl: 'https://images.unsplash.com/photo-1604068340176-59f134be11b8?w=400&fit=crop' }
  });
  console.log('Images updated!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
