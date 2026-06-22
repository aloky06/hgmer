const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categories...');
  
  // 1. Pooja Samagri
  const c1 = await prisma.category.create({
    data: {
      name: 'Pooja Samagri',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3663/3663365.png',
      children: {
        create: [
          { name: 'Agarbatti' },
          { name: 'Dhoop' },
          { name: 'Kapoor' },
          { name: 'Roli & Chandan' },
          { name: 'Diya & Batti' },
          { name: 'Hawan Samagri' },
          { name: 'Kalash' },
          { name: 'Gangajal' },
        ]
      }
    }
  });

  // 2. Festival Kits
  const c2 = await prisma.category.create({
    data: {
      name: 'Festival Kits',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/11261/11261175.png',
      isFestival: true,
      children: {
        create: [
          { name: 'Diwali Kit' },
          { name: 'Navratri Kit' },
        ]
      }
    }
  });

  // 3. Mandir & Decor
  const c3 = await prisma.category.create({
    data: {
      name: 'Mandir & Decor',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/8207/8207398.png',
      children: {
        create: [
          { name: 'Mandir' },
          { name: 'Murti' },
          { name: 'Bell' },
        ]
      }
    }
  });

  // 4. Religious Books
  const c4 = await prisma.category.create({
    data: {
      name: 'Religious Books',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3389/3389081.png',
    }
  });

  // 5. Prasad & Bhog
  const c5 = await prisma.category.create({
    data: {
      name: 'Prasad & Bhog',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3081/3081162.png',
    }
  });

  // 6. Pandit Services
  const c6 = await prisma.category.create({
    data: {
      name: 'Pandit Services',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/4205/4205934.png',
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
