const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy order for Shiprocket testing...');

  // Ensure a customer exists
  let customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
  if (!customer) {
    customer = await prisma.user.create({
      data: {
        name: 'Test Customer',
        email: 'testcustomer@hgmer.com',
        phone: '9876543210',
        passwordHash: 'dummyhash',
        role: 'CUSTOMER'
      }
    });
  }

  // Ensure a product exists
  let product = await prisma.product.findFirst();
  if (!product) {
    const category = await prisma.category.create({ data: { name: 'Test Category' } });
    product = await prisma.product.create({
      data: {
        categoryId: category.id,
        name: 'Test Product (Shiprocket)',
        description: 'Testing shiprocket integration',
        price: 500,
        type: 'STANDARD',
        status: 'APPROVED'
      }
    });
  }

  // Ensure a warehouse exists
  let warehouse = await prisma.warehouse.findFirst();
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        name: 'Central Hub',
        pincode: '110001'
      }
    });
  }

  // Create an order
  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      totalAmount: 500,
      shippingAddress: '123 Test Street, New Delhi, 110001',
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      hgmrCommission: 75,
      vendorAmount: 425,
      orderItems: {
        create: [
          {
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: 1,
            price: 500
          }
        ]
      }
    }
  });

  console.log(`Created mock Order #${order.id}`);
  console.log('You can now go to Admin Panel -> Orders and test Shiprocket flow!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
