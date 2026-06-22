const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products and inventory...');

  // 1. Get or Create a User for Vendor
  let user = await prisma.user.findFirst({ where: { role: 'VENDOR' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test Vendor User',
        email: 'vendor@example.com',
        phone: '9876543210',
        passwordHash: 'dummyhash',
        role: 'VENDOR',
      }
    });
  }

  // 2. Get or Create a Vendor Profile
  let vendor = await prisma.vendorProfile.findFirst({ where: { userId: user.id } });
  if (!vendor) {
    vendor = await prisma.vendorProfile.create({
      data: {
        userId: user.id,
        businessName: 'Premium Pooja Supplies',
        status: 'APPROVED',
      }
    });
  }

  // 3. Get a Category
  let category = await prisma.category.findFirst();
  if (!category) {
    category = await prisma.category.create({
      data: { name: 'Pooja Samagri', isFestival: false }
    });
  }

  // 4. Create Standard Products
  const diya = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: category.id,
      name: 'Brass Diya',
      description: 'High quality brass diya for daily pooja',
      price: 150,
      type: 'STANDARD',
      weight: 0.2,
    }
  });

  const kumkum = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: category.id,
      name: 'Pure Kumkum (50g)',
      description: 'Organic red kumkum powder',
      price: 50,
      type: 'STANDARD',
      weight: 0.05,
    }
  });

  const thali = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: category.id,
      name: 'Pooja Thali Set',
      description: 'Complete pooja thali set in steel',
      price: 350,
      type: 'STANDARD',
      weight: 0.5,
    }
  });

  // 5. Create a Bundle Product
  const diwaliKit = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: category.id,
      name: 'Diwali Special Combo Kit',
      description: 'Contains 4 Diyas, 1 Thali and 2 Kumkum packets',
      price: 999,
      type: 'BUNDLE',
      weight: 1.5,
    }
  });

  // 6. Link Bundle Components
  await prisma.bundleComponent.createMany({
    data: [
      { bundleId: diwaliKit.id, componentId: diya.id, quantity: 4 },
      { bundleId: diwaliKit.id, componentId: thali.id, quantity: 1 },
      { bundleId: diwaliKit.id, componentId: kumkum.id, quantity: 2 },
    ]
  });

  // 7. Get or Create Warehouse
  let warehouse = await prisma.warehouse.findFirst({ where: { name: 'Main Warehouse' } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: { name: 'Main Warehouse', pincode: '110001' }
    });
  }

  // 8. Add Inventory Stock
  const inventoryData = [
    { warehouseId: warehouse.id, productId: diya.id, quantity: 200 },
    { warehouseId: warehouse.id, productId: kumkum.id, quantity: 500 },
    { warehouseId: warehouse.id, productId: thali.id, quantity: 50 }, // Thali is the bottleneck (max kits = 50)
  ];

  for (const inv of inventoryData) {
    const createdInv = await prisma.inventory.create({ data: inv });
    await prisma.inventoryAuditLog.create({
      data: {
        inventoryId: createdInv.id,
        changeType: 'RESTOCK',
        quantityChanged: inv.quantity,
        previousQuantity: 0,
        newQuantity: inv.quantity,
        reason: 'Initial Seeding',
      }
    });
  }

  console.log('Seeded successfully! Check the NextJS admin panel now.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
