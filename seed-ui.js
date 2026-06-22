const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Categories
  await prisma.category.createMany({
    data: [
      { name: 'पूजा सामग्री', iconUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=200&fit=crop' },
      { name: 'त्यौहार विशेष', iconUrl: 'https://images.unsplash.com/photo-1582376432754-b63cc6a9b8c3?w=200&fit=crop', isFestival: true },
      { name: 'उपहार सामग्री', iconUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&fit=crop' },
      { name: 'मंदिर सजावट', iconUrl: 'https://images.unsplash.com/photo-1604068340176-59f134be11b8?w=200&fit=crop' },
      { name: 'धार्मिक पुस्तकें', iconUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&fit=crop' },
      { name: 'ऑफर / सेल', iconUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&fit=crop' },
    ]
  });

  // Banners
  await prisma.banner.create({
    data: {
      title: 'पूजा का हर सामान',
      subtitle: 'शुद्ध • उत्तम • विश्वसनीय',
      imageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop',
    }
  });

  await prisma.banner.create({
    data: {
      title: 'पंडित सेवा',
      subtitle: 'अनुभवी पंडित से पूजा, पाठ, अनुष्ठान कराएं घर बैठे',
      imageUrl: 'https://images.unsplash.com/photo-1590053403348-1db241852026?w=400&fit=crop',
    }
  });

  // Festivals
  await prisma.festival.createMany({
    data: [
      { name: 'गणेश चतुर्थी', date: '17 सितम्बर', linkText: 'विशेष सामग्री देखें →', imageUrl: 'https://images.unsplash.com/photo-1567360425618-1594206637d2?w=400&fit=crop' },
      { name: 'नवरात्रि', date: '3 अक्टूबर से', linkText: 'विशेष संग्रह देखें →', imageUrl: 'https://images.unsplash.com/photo-1601058269781-64508ec39fbc?w=400&fit=crop' },
      { name: 'दीपावली', date: '31 अक्टूबर', linkText: 'विशेष ऑफर देखें →', imageUrl: 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=400&fit=crop' },
      { name: 'छठ पूजा', date: '7 नवम्बर', linkText: 'सामग्री देखें →', imageUrl: 'https://images.unsplash.com/photo-1582376432754-b63cc6a9b8c3?w=400&fit=crop' },
    ]
  });

  console.log('UI Seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
