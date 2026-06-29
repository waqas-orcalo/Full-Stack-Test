/**
 * Full-application seed script — populates every feature with sample data.
 *
 *   npm run seed
 *
 * Wipes and recreates: 10 users, 10 categories, 40 products (with downloaded
 * category images), shopping carts for several users, and 10 orders with varied
 * statuses and dates.
 *
 * Credentials (all passwords = 123456):
 *   admin  -> admin@gmail.com
 *   users  -> user1@gmail.com … user9@gmail.com
 *
 * Image download needs internet at seed time; failures degrade to no image.
 */
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import * as https from 'https';
import * as http from 'http';
import { createWriteStream, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import mongoose, { Types } from 'mongoose';
import { UserSchema, UserRole } from './modules/users/schemas/user.schema';
import { ProductSchema } from './modules/products/schemas/product.schema';
import { CategorySchema } from './modules/categories/schemas/category.schema';
import { CartSchema } from './modules/cart/schemas/cart.schema';
import { OrderSchema, OrderStatus } from './modules/orders/schemas/order.schema';

const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/ecom_starter';
const IMAGES_DIR = join(process.cwd(), 'images');

const CATEGORIES: { name: string; keyword: string; products: string[] }[] = [
  { name: 'Audio', keyword: 'headphones', products: ['Studio Headphones Pro', 'Wireless Earbuds Air', 'Portable Bluetooth Speaker', 'USB Condenser Mic'] },
  { name: 'Wearables', keyword: 'smartwatch', products: ['Smart Watch Series 2', 'Fitness Band Lite', 'GPS Sport Watch', 'Sleep Tracker Ring'] },
  { name: 'Cameras', keyword: 'camera', products: ['Mirrorless Camera X', 'Action Cam 4K', 'Vlogging Camera Kit', 'Instant Photo Printer'] },
  { name: 'Accessories', keyword: 'gadget', products: ['USB-C 7-in-1 Hub', 'Wireless Charger Pad', 'Laptop Sleeve 14"', 'Cable Organizer Set'] },
  { name: 'Computers', keyword: 'laptop', products: ['UltraBook 14 Pro', 'Gaming Laptop RTX', 'Mini Desktop PC', '2-in-1 Convertible'] },
  { name: 'Phones', keyword: 'smartphone', products: ['Flagship Phone 5G', 'Budget Smartphone', 'Rugged Phone Max', 'Foldable Phone'] },
  { name: 'Gaming', keyword: 'videogame', products: ['Game Controller Pro', 'Mechanical Keyboard RGB', 'Gaming Mouse 16K', 'VR Headset'] },
  { name: 'Smart Home', keyword: 'smarthome', products: ['Smart Bulb Pack', 'Video Doorbell', 'Robot Vacuum', 'Smart Thermostat'] },
  { name: 'Office', keyword: 'office', products: ['Ergonomic Chair', 'Standing Desk', 'Desk Lamp LED', 'Document Scanner'] },
  { name: 'Storage', keyword: 'harddrive', products: ['Portable SSD 1TB', 'NAS 2-Bay', 'USB Flash 256GB', 'MicroSD 512GB'] },
];

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];

function download(url: string, dest: string, redirects = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (seed)' } }, (res) => {
      const status = res.statusCode ?? 0;
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume();
        if (redirects <= 0) return reject(new Error('Too many redirects'));
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        return resolve(download(next, dest, redirects - 1));
      }
      if (status !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${status}`));
      }
      const file = createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
      file.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('timeout')));
  });
}

async function downloadCategoryImages(): Promise<Record<string, string>> {
  if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });
  for (const f of readdirSync(IMAGES_DIR)) {
    if (/^seed-.*\.svg$/i.test(f)) unlinkSync(join(IMAGES_DIR, f));
  }
  const map: Record<string, string> = {};
  console.log('Downloading category images...');
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const file = `cat-${i + 1}-${cat.keyword}.jpg`;
    try {
      await download(`https://loremflickr.com/600/450/${cat.keyword}`, join(IMAGES_DIR, file));
      map[cat.name] = `/images/${file}`;
      console.log(`  ✓ ${cat.name} -> ${file}`);
    } catch (err) {
      console.warn(`  ✗ ${cat.name}: ${(err as Error).message}`);
      map[cat.name] = '';
    }
  }
  return map;
}

async function run() {
  const images = await downloadCategoryImages();

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to ${MONGODB_URI}`);

  const User = mongoose.model('User', UserSchema);
  const Category = mongoose.model('Category', CategorySchema);
  const Product = mongoose.model('Product', ProductSchema);
  const Cart = mongoose.model('Cart', CartSchema);
  const Order = mongoose.model('Order', OrderSchema);

  // Fresh start.
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
  ]);
  console.log('Cleared existing data.');

  // ---- Users (all password 123456) ----
  const passwordHash = await bcrypt.hash('123456', 10);
  const userDocs = [
    { name: 'Admin', email: 'admin@gmail.com', passwordHash, role: UserRole.ADMIN, deletedAt: null },
    ...Array.from({ length: 9 }, (_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@gmail.com`,
      passwordHash,
      role: UserRole.CUSTOMER,
      deletedAt: null,
    })),
  ];
  const users = await User.insertMany(userDocs);
  const customers = users.filter((u) => u.role === UserRole.CUSTOMER);
  console.log(`Seeded ${users.length} users (admin@gmail.com + user1..9@gmail.com).`);

  // ---- Categories ----
  await Category.insertMany(
    CATEGORIES.map((c) => ({ name: c.name, description: `${c.name} products`, deletedAt: null })),
  );
  console.log(`Seeded ${CATEGORIES.length} categories.`);

  // ---- Products (4 per category = 40) ----
  const productDocs = CATEGORIES.flatMap((cat, ci) =>
    cat.products.map((name, pi) => ({
      name,
      sku: `${cat.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}-${ci + 1}${pi + 1}`,
      description: `${name} — quality ${cat.name.toLowerCase()} product.`,
      price: rand(15, 800) + 0.99,
      stockQuantity: rand(0, 120),
      category: cat.name,
      imageUrl: images[cat.name] ?? '',
      isActive: true,
      deletedAt: null,
    })),
  );
  const products = await Product.insertMany(productDocs);
  console.log(`Seeded ${products.length} products.`);

  // ---- Carts (first 4 customers get 1–3 items) ----
  let cartCount = 0;
  for (const customer of customers.slice(0, 4)) {
    const n = rand(1, 3);
    const chosen = new Set<number>();
    const items: { product: Types.ObjectId; quantity: number }[] = [];
    while (items.length < n) {
      const idx = rand(0, products.length - 1);
      if (chosen.has(idx)) continue;
      chosen.add(idx);
      const p = products[idx];
      if (p.stockQuantity < 1) continue;
      items.push({ product: p._id as Types.ObjectId, quantity: rand(1, Math.min(3, p.stockQuantity)) });
    }
    if (items.length) {
      await Cart.create({ user: customer._id, items });
      cartCount++;
    }
  }
  console.log(`Seeded ${cartCount} shopping carts.`);

  // ---- Orders (10, varied status + dates) ----
  const statuses = [
    OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED,
    OrderStatus.SHIPPED, OrderStatus.SHIPPED,
    OrderStatus.PROCESSING, OrderStatus.PROCESSING,
    OrderStatus.PENDING, OrderStatus.PENDING,
    OrderStatus.CANCELLED,
  ];
  for (let i = 0; i < 10; i++) {
    const customer = customers[i % customers.length];
    const itemCount = rand(1, 4);
    const chosen = new Set<number>();
    const items: { product: Types.ObjectId; name: string; priceAtPurchase: number; quantity: number }[] = [];
    let total = 0;
    while (items.length < itemCount) {
      const idx = rand(0, products.length - 1);
      if (chosen.has(idx)) continue;
      chosen.add(idx);
      const p = products[idx];
      const quantity = rand(1, 3);
      total += p.price * quantity;
      items.push({
        product: p._id as Types.ObjectId,
        name: p.name,
        priceAtPurchase: p.price,
        quantity,
      });
    }
    const order = await Order.create({
      user: customer._id,
      items,
      totalAmount: Math.round(total * 100) / 100,
      status: statuses[i],
    });
    // Spread createdAt over the last ~60 days for nicer history/charts.
    const created = new Date(Date.now() - rand(0, 60) * 24 * 60 * 60 * 1000);
    await Order.updateOne({ _id: order._id }, { $set: { createdAt: created } }, { timestamps: false });
  }
  console.log('Seeded 10 orders.');

  await mongoose.disconnect();
  console.log('Done. Login with admin@gmail.com / 123456 (or user1@gmail.com … user9@gmail.com).');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
