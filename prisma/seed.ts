import { PrismaClient, ProductType } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCTS = [
  { name: 'Premium Brass Pooja Thali Set', price: 499, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'A beautiful brass thali set for your daily pooja needs.' },
  { name: 'Original Rudraksha Mala (108 beads)', price: 299, img: 'https://images.unsplash.com/photo-1542037920-569dfd048995?w=400&fit=crop', desc: 'Authentic 5-mukhi Rudraksha mala with 108+1 beads.' },
  { name: 'Pure Cow Ghee (500ml)', price: 450, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: '100% pure cow ghee perfect for lighting diyas.' },
  { name: 'Sandalwood (Chandan) Stick', price: 150, img: 'https://images.unsplash.com/photo-1611077544837-77b31a31b673?w=400&fit=crop', desc: 'Natural sandalwood stick for daily tilak.' },
  { name: 'Kumkum & Haldi Combo', price: 99, img: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&fit=crop', desc: 'Pure turmeric and kumkum for auspicious rituals.' },
  { name: 'Incense Sticks (Agarbatti) - Rose', price: 120, img: 'https://images.unsplash.com/photo-1608408843594-5b43063eb7b6?w=400&fit=crop', desc: 'Premium rose scented agarbatti.' },
  { name: 'Incense Sticks (Agarbatti) - Sandalwood', price: 120, img: 'https://images.unsplash.com/photo-1608408843594-5b43063eb7b6?w=400&fit=crop', desc: 'Premium sandalwood scented agarbatti.' },
  { name: 'Camphor (Kapur) 100g', price: 180, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Pure camphor tablets for aarti.' },
  { name: 'Cotton Wicks (Batti) 1000 pcs', price: 50, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Long lasting cotton wicks for diyas.' },
  { name: 'Ganga Jal (Bottle)', price: 110, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Holy water from the Ganges.' },
  { name: 'Brass Diya', price: 250, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Traditional brass diya for aarti.' },
  { name: 'Brass Bell (Ghanti)', price: 300, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Handheld brass bell with a clear sound.' },
  { name: 'Panchpatra and Achmani', price: 350, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Brass panchpatra for keeping holy water.' },
  { name: 'Tulsi Mala', price: 150, img: 'https://images.unsplash.com/photo-1542037920-569dfd048995?w=400&fit=crop', desc: 'Original Tulsi mala for chanting.' },
  { name: 'Lotus Seeds (Kamal Gatta) Mala', price: 200, img: 'https://images.unsplash.com/photo-1542037920-569dfd048995?w=400&fit=crop', desc: 'Used for Goddess Lakshmi pooja.' },
  { name: 'Crystal (Sphatik) Mala', price: 450, img: 'https://images.unsplash.com/photo-1542037920-569dfd048995?w=400&fit=crop', desc: 'Cooling crystal beads mala.' },
  { name: 'Navgraha Yantra', price: 500, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Copper yantra for all nine planets.' },
  { name: 'Shree Yantra', price: 600, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Auspicious Shree Yantra for wealth.' },
  { name: 'Havan Samagri (500g)', price: 180, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Mixture of pure herbs for havan.' },
  { name: 'Dried Coconut (Gola)', price: 80, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Used for purnahuti in havan.' },
  { name: 'Mango Wood for Havan', price: 120, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Pure dry mango wood (Samidha).' },
  { name: 'Red Cloth (Lal Kapda)', price: 60, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: '1 meter red cloth for deity.' },
  { name: 'Yellow Cloth (Peela Kapda)', price: 60, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: '1 meter yellow cloth for pooja.' },
  { name: 'Mouli / Kalawa', price: 30, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Sacred red thread.' },
  { name: 'Janeu (Sacred Thread) Set of 5', price: 50, img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&fit=crop', desc: 'Set of 5 high quality janeu.' }
];

async function main() {
  console.log('Seeding database with 25 products...');

  // Ensure a category exists
  let category = await prisma.category.findFirst({ where: { name: 'Pooja Samagri' } });
  if (!category) {
    category = await prisma.category.create({
      data: { name: 'Pooja Samagri', description: 'All items required for Pooja' }
    });
    console.log('Created category Pooja Samagri');
  }

  let count = 0;
  for (const item of PRODUCTS) {
    const exists = await prisma.product.findFirst({ where: { name: item.name } });
    if (!exists) {
      await prisma.product.create({
        data: {
          name: item.name,
          description: item.desc,
          price: item.price,
          imageUrl: item.img,
          categoryId: category.id,
          type: ProductType.STANDARD,
          stock: 100,
        }
      });
      count++;
    }
  }

  console.log(`Seeded ${count} new products successfully!`);

  // Seed Astrology & Vidhi
  const vidhi = await prisma.poojaVidhi.findFirst();
  if (!vidhi) {
    await prisma.poojaVidhi.create({
      data: {
        title: 'Satyanarayan Pooja Vidhi',
        procedure: '<p>Standard procedure for Sri Satyanarayan Pooja. Start with Ganapati invocation.</p>',
        imageUrl: 'https://images.unsplash.com/photo-1542037920-569dfd048995?w=400&fit=crop'
      }
    });
    console.log('Created dummy PoojaVidhi');
  }

  const consultancy = await prisma.consultancyService.findFirst();
  if (!consultancy) {
    await prisma.consultancyService.create({
      data: {
        title: 'Kundali Matching',
        description: '<p>Detailed astrological compatibility analysis for marriage.</p>',
        price: 501,
        imageUrl: 'https://images.unsplash.com/photo-1611077544837-77b31a31b673?w=400&fit=crop'
      }
    });
    console.log('Created dummy ConsultancyService');
  }

  const horoscope = await prisma.horoscope.findFirst();
  if (!horoscope) {
    await prisma.horoscope.create({
      data: {
        sign: 'Aries',
        prediction: '<p>Today brings new opportunities for growth and prosperity. A good time to start new ventures.</p>',
        date: new Date()
      }
    });
    console.log('Created dummy Horoscope');
  }

  const panchang = await prisma.panchang.findFirst();
  if (!panchang) {
    await prisma.panchang.create({
      data: {
        date: new Date(),
        tithi: 'Ekadashi',
        nakshatra: 'Rohini',
        sunrise: '06:00',
        sunset: '18:30',
        details: '<p>Auspicious time is between 10:00 AM to 12:00 PM.</p>'
      }
    });
    console.log('Created dummy Panchang');
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
