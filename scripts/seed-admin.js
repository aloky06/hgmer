const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Admin User...');

  const email = 'admin@hgmer.com';
  
  // Check if exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Force role to ADMIN and reset password
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', passwordHash }
    });
    console.log('Admin user updated!');
    return;
  }

  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: email,
      phone: '1122334455',
      passwordHash: passwordHash,
      role: 'ADMIN',
    }
  });

  console.log('Successfully seeded admin:', adminUser.name);
  console.log('Email:', email);
  console.log('Password:', 'admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
