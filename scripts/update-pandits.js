const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.panditProfile.updateMany({
    data: {
      photoUrl: 'https://cdn-icons-png.flaticon.com/512/3588/3588636.png',
      rating: 4.8,
      price: 6000,
      languages: 'Hindi, Sanskrit',
      specializations: 'All Hindu Ceremonies, Havan Ceremonies, Satyanarayan Katha, Temple Ceremonies, Vastu Shanti',
    }
  });
  console.log('Updated existing Pandit Profiles with new fields');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
