const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy Pandit...');

  const email = 'dummy_pandit@hgmer.com';
  
  // Check if exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Dummy pandit already exists!');
    return;
  }

  const passwordHash = await bcrypt.hash('pandit123', 10);

  const panditUser = await prisma.user.create({
    data: {
      name: 'Rameshwar Pandit',
      email: email,
      phone: '9988776655',
      passwordHash: passwordHash,
      role: 'PANDIT',
      panditProfile: {
        create: {
          bio: 'Experienced priest in Satyanarayan Katha and Griha Pravesh.',
          experience: 15,
          city: 'Varanasi',
          serviceRadius: 20,
          status: 'PENDING'
        }
      }
    }
  });

  console.log('Successfully seeded dummy Pandit:', panditUser.name);
  console.log('Email:', email);
  console.log('Password:', 'pandit123');
  console.log('Status: PENDING (Needs admin verification)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
