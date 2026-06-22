import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting stock migration...');

  // 1. Create a default Main Warehouse if it doesn't exist
  let mainWarehouse = await prisma.warehouse.findFirst({
    where: { name: 'Main Warehouse' },
  });

  if (!mainWarehouse) {
    mainWarehouse = await prisma.warehouse.create({
      data: {
        name: 'Main Warehouse',
        pincode: '110001', // Dummy default pincode
        address: 'Default Address',
      },
    });
    console.log('Created Main Warehouse with ID:', mainWarehouse.id);
  } else {
    console.log('Main Warehouse already exists with ID:', mainWarehouse.id);
  }

  // 2. Find all products that have stock > 0
  const products = await prisma.product.findMany({
    where: {
      stock: { gt: 0 },
    },
  });

  console.log(`Found ${products.length} products with stock to migrate.`);

  // 3. Migrate stock
  for (const product of products) {
    // Check if inventory already exists
    let inventory = await prisma.inventory.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId: mainWarehouse.id,
          productId: product.id,
        },
      },
    });

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          warehouseId: mainWarehouse.id,
          productId: product.id,
          quantity: product.stock,
        },
      });

      // Create an audit log for the migration
      await prisma.inventoryAuditLog.create({
        data: {
          inventoryId: inventory.id,
          changeType: 'RESTOCK', // Initial stock migration
          quantityChanged: product.stock,
          previousQuantity: 0,
          newQuantity: product.stock,
          reason: 'Initial stock migration from legacy Product table',
        },
      });

      console.log(`Migrated stock (${product.stock}) for Product ID: ${product.id}`);
    } else {
      console.log(`Inventory already exists for Product ID: ${product.id}`);
    }
  }

  console.log('Stock migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
