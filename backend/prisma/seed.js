const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  // Clean in correct dependency order
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.menuItem.deleteMany({});

  console.log('Seeding admin...');
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: 'admin' }
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password_hash: passwordHash,
      },
    });
    console.log(`Admin created: ${admin.username}`);
  } else {
    console.log('Admin account already exists.');
  }

  console.log('Seeding customers...');
  const customers = [];
  const custPasswordHash = await bcrypt.hash('password123', 10);
  const customerData = [
    { name: 'Kiran Kumar', whatsapp_number: '919876543210', email: 'kiran@gmail.com', password_hash: custPasswordHash, address: 'Flat 402, Sai Residency, Madhapur, Hyderabad' },
    { name: 'Ananya Rao', whatsapp_number: '919876543211', email: 'ananya@gmail.com', password_hash: custPasswordHash, address: 'Plot 12, Kavuri Hills, Jubilee Hills, Hyderabad' },
    { name: 'Srinivas Murthy', whatsapp_number: '919876543212', email: 'srinivas@gmail.com', password_hash: custPasswordHash, address: 'H.No 12-4/A, Gachibowli, Hyderabad' },
    { name: 'Priya Sharma', whatsapp_number: '919876543213', email: 'priya@gmail.com', password_hash: custPasswordHash, address: 'Phase 2, HITEC City, Hyderabad' },
    { name: 'Ramesh Reddy', whatsapp_number: '919876543214', email: 'ramesh@gmail.com', password_hash: custPasswordHash, address: 'Sector 3, Kondapur, Hyderabad' },
  ];

  for (const c of customerData) {
    const cust = await prisma.customer.create({ data: c });
    customers.push(cust);
  }
  console.log(`Created ${customers.length} customers.`);

  console.log('Seeding menu items...');
  const menuItems = [];
  
  let menuItemData = [];
  try {
    const scrapedProducts = require('./scraped_products.json');
    menuItemData = scrapedProducts.map(p => ({
      name: p.name,
      category: p.category,
      price: parseFloat(p.price) || 200.0,
      image_url: p.image || null,
      product_url: p.url || null,
      is_available: p.price > 0
    }));
  } catch (err) {
    console.error('Could not load scraped_products.json, using default seed items:', err);
    menuItemData = [
      { name: 'Avakaya Pickle (Mango)', category: 'Veg Pickles', price: 180.0, is_available: true },
      { name: 'Gongura Pickle', category: 'Veg Pickles', price: 160.0, is_available: true },
      { name: 'Chicken Pickle', category: 'Non Veg Pickles', price: 450.0, is_available: true },
      { name: 'Mutton Pickle', category: 'Non Veg Pickles', price: 650.0, is_available: true },
      { name: 'Kajjikayalu', category: 'Sweets', price: 200.0, is_available: true },
      { name: 'Nuvvula Laddu', category: 'Traditional Laddus', price: 150.0, is_available: true },
      { name: 'Janthikalu', category: 'Snacks Hot Items', price: 120.0, is_available: true },
      { name: 'Chekkalu', category: 'Snacks Hot Items', price: 130.0, is_available: true },
      { name: 'Kandi Podi', category: 'Powders Podis', price: 140.0, is_available: true },
      { name: 'Karivepaku Podi', category: 'Powders Podis', price: 130.0, is_available: false },
    ];
  }

  for (const m of menuItemData) {
    const item = await prisma.menuItem.create({ data: m });
    menuItems.push(item);
  }
  console.log(`Created ${menuItems.length} menu items.`);

  console.log('Seeding orders...');
  // Let's create orders spread across today to populate the Recharts bar chart by hour
  const today = new Date();
  const getTodayWithHour = (hour) => {
    const d = new Date(today);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const orderData = [
    {
      customer_id: customers[0].id,
      items: [
        { name: 'Avakaya Pickle (Mango)', quantity: 2, price: 180.0 },
        { name: 'Janthikalu', quantity: 1, price: 120.0 }
      ],
      total_amount: 480.0,
      payment_status: 'Paid',
      order_status: 'Delivered',
      delivery_address: customers[0].address,
      created_at: getTodayWithHour(9), // 9 AM
    },
    {
      customer_id: customers[1].id,
      items: [
        { name: 'Chicken Pickle', quantity: 1, price: 450.0 },
        { name: 'Kajjikayalu', quantity: 2, price: 200.0 }
      ],
      total_amount: 850.0,
      payment_status: 'Paid',
      order_status: 'Preparing',
      delivery_address: customers[1].address,
      created_at: getTodayWithHour(10), // 10 AM
    },
    {
      customer_id: customers[2].id,
      items: [
        { name: 'Mutton Pickle', quantity: 1, price: 650.0 }
      ],
      total_amount: 650.0,
      payment_status: 'Pending',
      order_status: 'Received',
      delivery_address: customers[2].address,
      created_at: getTodayWithHour(11), // 11 AM
    },
    {
      customer_id: customers[3].id,
      items: [
        { name: 'Gongura Pickle', quantity: 1, price: 160.0 },
        { name: 'Kandi Podi', quantity: 1, price: 140.0 }
      ],
      total_amount: 300.0,
      payment_status: 'Paid',
      order_status: 'Out for Delivery',
      delivery_address: customers[3].address,
      created_at: getTodayWithHour(12), // 12 PM
    },
    {
      customer_id: customers[4].id,
      items: [
        { name: 'Nuvvula Laddu', quantity: 3, price: 150.0 }
      ],
      total_amount: 450.0,
      payment_status: 'Failed',
      order_status: 'Received',
      delivery_address: customers[4].address,
      created_at: getTodayWithHour(13), // 1 PM
    },
    {
      customer_id: customers[0].id,
      items: [
        { name: 'Chekkalu', quantity: 2, price: 130.0 },
        { name: 'Kajjikayalu', quantity: 1, price: 200.0 }
      ],
      total_amount: 460.0,
      payment_status: 'Paid',
      order_status: 'Delivered',
      delivery_address: customers[0].address,
      created_at: getTodayWithHour(14), // 2 PM
    },
    {
      customer_id: customers[1].id,
      items: [
        { name: 'Chicken Pickle', quantity: 2, price: 450.0 }
      ],
      total_amount: 900.0,
      payment_status: 'Paid',
      order_status: 'Preparing',
      delivery_address: customers[1].address,
      created_at: getTodayWithHour(15), // 3 PM
    },
    {
      customer_id: customers[2].id,
      items: [
        { name: 'Avakaya Pickle (Mango)', quantity: 1, price: 180.0 },
        { name: 'Gongura Pickle', quantity: 1, price: 160.0 }
      ],
      total_amount: 340.0,
      payment_status: 'Pending',
      order_status: 'Received',
      delivery_address: customers[2].address,
      created_at: getTodayWithHour(16), // 4 PM
    },
    {
      customer_id: customers[3].id,
      items: [
        { name: 'Mutton Pickle', quantity: 1, price: 650.0 },
        { name: 'Janthikalu', quantity: 2, price: 120.0 }
      ],
      total_amount: 890.0,
      payment_status: 'Paid',
      order_status: 'Out for Delivery',
      delivery_address: customers[3].address,
      created_at: getTodayWithHour(18), // 6 PM
    },
    {
      customer_id: customers[4].id,
      items: [
        { name: 'Nuvvula Laddu', quantity: 1, price: 150.0 },
        { name: 'Chekkalu', quantity: 1, price: 130.0 }
      ],
      total_amount: 280.0,
      payment_status: 'Paid',
      order_status: 'Delivered',
      delivery_address: customers[4].address,
      created_at: getTodayWithHour(19), // 7 PM
    },
  ];

  for (const o of orderData) {
    await prisma.order.create({
      data: {
        ...o,
        items: JSON.stringify(o.items)
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
