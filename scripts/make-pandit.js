const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'sk979780@gmail.com';
  
  // 1. Give this email the PANDIT role
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log(`User ${email} not found. Creating...`);
    user = await prisma.user.create({
      data: {
        email: email,
        name: 'SK Pandit',
        phone: '1234567890',
        passwordHash: 'dummy',
        role: 'PANDIT',
      }
    });
  } else {
    console.log(`User ${email} found. Updating role to PANDIT...`);
    user = await prisma.user.update({
      where: { email },
      data: { role: 'PANDIT' }
    });
  }

  // 2. Make sure they have a Pandit Profile
  const profile = await prisma.panditProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    console.log(`Creating Pandit Profile for ${email}...`);
    await prisma.panditProfile.create({
      data: {
        userId: user.id,
        bio: 'Expert Pandit for all Poojas.',
        experience: 10,
        city: 'New Delhi',
        serviceRadius: 30,
        status: 'APPROVED' // Approved so they can immediately test
      }
    });
  } else {
    console.log(`Pandit Profile already exists for ${email}. Ensuring they are APPROVED.`);
    await prisma.panditProfile.update({
      where: { userId: user.id },
      data: { status: 'APPROVED' }
    });
  }

  console.log('Successfully updated!', email, 'is now an APPROVED PANDIT.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
