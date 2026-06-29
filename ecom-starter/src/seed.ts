/**
 * Database seed script.
 *
 * Seeds one admin, one customer, and 5 sample products. For each product it
 * downloads a real, topically-relevant photo (from LoremFlickr) into the
 * on-disk `images/` folder so images are self-hosted and served at /images/*.
 *
 *   npm run seed
 *
 * Requires internet access at seed time to fetch the photos. If a download
 * fails (offline), that product is seeded without an image and the rest
 * continue. Old auto-generated placeholders (seed-*.svg) are removed first.
 *
 * Idempotent: users are upserted; the 5 sample products are deleted and reseeded.
 */
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import * as https from 'https';
import * as http from 'http';
import { createWriteStream, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import mongoose from 'mongoose';
import { UserSchema, UserRole } from './modules/users/schemas/user.schema';
import { ProductSchema } from './modules/products/schemas/product.schema';

const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/ecom_starter';
const IMAGES_DIR = join(process.cwd(), 'images');

const PRODUCTS = [
  { name: 'Studio Headphones Pro', sku: 'AUD-001', price: 129, stockQuantity: 24, category: 'audio', description: 'Over-ear ANC headphones with 40-hour battery.', keyword: 'headphones' },
  { name: 'Smart Watch Series 2', sku: 'WEA-001', price: 199, stockQuantity: 8, category: 'wearables', description: 'Fitness tracking and notifications, 7-day battery.', keyword: 'smartwatch' },
  { name: 'Mirrorless Camera X', sku: 'CAM-001', price: 749, stockQuantity: 5, category: 'cameras', description: '24MP mirrorless camera with kit lens.', keyword: 'camera' },
  { name: 'Mechanical Keyboard', sku: 'ACC-001', price: 89, stockQuantity: 30, category: 'accessories', description: 'Hot-swappable mechanical keyboard, RGB.', keyword: 'keyboard' },
  { name: 'USB-C 7-in-1 Hub', sku: 'ACC-002', price: 39, stockQuantity: 60, category: 'accessories', description: 'HDMI, USB-A, SD and 100W PD charging.', keyword: 'usb' },
];

/** Download a URL to a file, following redirects. */
function download(url: string, dest: string, redirects = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(
      url,
      { headers: { 'User-Agent': 'Mozilla/5.0 (seed-script)' } },
      (res) => {
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
      },
    );
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('timeout')));
  });
}

async function fetchImages(): Promise<Record<string, string>> {
  if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });
  // Clean up old auto-generated placeholders.
  for (const f of readdirSync(IMAGES_DIR)) {
    if (/^seed-.*\.svg$/i.test(f)) unlinkSync(join(IMAGES_DIR, f));
  }

  const urls: Record<string, string> = {};
  for (const p of PRODUCTS) {
    const file = `${p.sku.toLowerCase()}.jpg`;
    const url = `https://loremflickr.com/600/450/${encodeURIComponent(p.keyword)}`;
    try {
      await download(url, join(IMAGES_DIR, file));
      urls[p.sku] = `/images/${file}`;
      console.log(`  ✓ ${p.name} -> ${file}`);
    } catch (err) {
      console.warn(`  ✗ ${p.name}: image download failed (${(err as Error).message})`);
    }
  }
  return urls;
}

async function run() {
  console.log('Downloading product images...');
  const images = await fetchImages();

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

  // Remove the previous seed and insert the fresh set.
  await Product.deleteMany({ sku: { $in: PRODUCTS.map((p) => p.sku) } });
  const docs = PRODUCTS.map((p) => ({
    name: p.name,
    sku: p.sku,
    price: p.price,
    stockQuantity: p.stockQuantity,
    category: p.category,
    description: p.description,
    imageUrl: images[p.sku] ?? '',
    isActive: true,
    deletedAt: null,
  }));
  await Product.insertMany(docs);
  console.log(`Seeded ${docs.length} products.`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
