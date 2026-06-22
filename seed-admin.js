const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@hargharmandir.com';
  const password = 'admin123';
  
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Super Admin',
        phone: '1234567890',
        role: 'ADMIN',
      }
    });
    console.log('Admin user created successfully!');
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
