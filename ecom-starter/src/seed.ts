/**
 * Database seed script.
 *
 * Populates: one admin user, one customer, and 5 sample products — each with a
 * generated image written to the on-disk `images/` folder (served at
 * /images/*). Self-contained: no external downloads required.
 *
 *   npm run seed
 *
 * Idempotent: users are upserted by email; products are reset to the 5 samples.
 */
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import mongoose from 'mongoose';
import { UserSchema, UserRole } from './modules/users/schemas/user.schema';
import { ProductSchema } from './modules/products/schemas/product.schema';

const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/ecom_starter';

const IMAGES_DIR = join(process.cwd(), 'images');

interface SeedProduct {
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  color: [string, string];
  glyph: string;
}

const PRODUCTS: SeedProduct[] = [
  { name: 'Studio Headphones Pro', sku: 'AUD-001', price: 129, stock: 24, category: 'audio', description: 'Over-ear ANC headphones with 40-hour battery.', color: ['#6366F1', '#312E81'], glyph: 'Headphones' },
  { name: 'Smart Watch Series 2', sku: 'WEA-001', price: 199, stock: 8, category: 'wearables', description: 'Fitness tracking and notifications, 7-day battery.', color: ['#7C3AED', '#4B11A2'], glyph: 'Smart Watch' },
  { name: 'Mirrorless Camera X', sku: 'CAM-001', price: 749, stock: 5, category: 'cameras', description: '24MP mirrorless camera with kit lens.', color: ['#0EA5E9', '#075985'], glyph: 'Camera' },
  { name: 'Mechanical Keyboard', sku: 'ACC-001', price: 89, stock: 30, category: 'accessories', description: 'Hot-swappable mechanical keyboard, RGB.', color: ['#10B981', '#065F46'], glyph: 'Keyboard' },
  { name: 'USB-C 7-in-1 Hub', sku: 'ACC-002', price: 39, stock: 60, category: 'accessories', description: 'HDMI, USB-A, SD and 100W PD charging.', color: ['#F59E0B', '#92400E'], glyph: 'USB-C Hub' },
];

/** Write a simple branded SVG placeholder image for a product to disk. */
function generateImage(p: SeedProduct): string {
  const file = `seed-${p.sku.toLowerCase()}.svg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${p.color[0]}"/><stop offset="1" stop-color="${p.color[1]}"/>
  </linearGradient></defs>
  <rect width="600" height="450" fill="url(#g)"/>
  <text x="50%" y="46%" fill="#ffffff" font-family="Arial, sans-serif" font-size="40" font-weight="700" text-anchor="middle">${p.glyph}</text>
  <text x="50%" y="58%" fill="#ffffff" opacity="0.85" font-family="Arial, sans-serif" font-size="22" text-anchor="middle">${p.sku}</text>
</svg>`;
  writeFileSync(join(IMAGES_DIR, file), svg, 'utf8');
  return `/images/${file}`;
}

async function run() {
  if (!existsSync(IMAGES_DIR)) {
    mkdirSync(IMAGES_DIR, { recursive: true });
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to ${MONGODB_URI}`);

  const User = mongoose.model('User', UserSchema);
  const Product = mongoose.model('Product', ProductSchema);

  const adminHash = await bcrypt.hash('admin123', 10);
  const customerHash = await bcrypt.hash('customer123', 10);

  await User.updateOne(
    { email: 'admin@aurora.test' },
    { $set: { name: 'Admin User', email: 'admin@aurora.test', passwordHash: adminHash, role: UserRole.ADMIN, deletedAt: null } },
    { upsert: true },
  );
  await User.updateOne(
    { email: 'customer@aurora.test' },
    { $set: { name: 'Jane Customer', email: 'customer@aurora.test', passwordHash: customerHash, role: UserRole.CUSTOMER, deletedAt: null } },
    { upsert: true },
  );
  console.log('Seeded users:');
  console.log('  admin    -> admin@aurora.test / admin123');
  console.log('  customer -> customer@aurora.test / customer123');

  // Reset products to the 5 samples (idempotent re-seed).
  await Product.deleteMany({ sku: { $in: PRODUCTS.map((p) => p.sku) } });
  const docs = PRODUCTS.map((p) => ({
    name: p.name,
    sku: p.sku,
    price: p.price,
    stock: p.stock,
    category: p.category,
    description: p.description,
    imageUrl: generateImage(p),
    isActive: true,
    deletedAt: null,
  }));
  await Product.insertMany(docs);
  console.log(`Seeded ${docs.length} products with images (written to ${IMAGES_DIR}).`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
