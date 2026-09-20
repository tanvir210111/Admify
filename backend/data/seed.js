import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import University from '../models/University.js';
import Scholarship from '../models/Scholarship.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Checking platform administrator account...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@admify.world';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Admify Administrator';

    let admin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        phone: '+1 (800) 555-0199',
        role: 'admin',
        status: 'active',
      });
      console.log(`[Seed] Administrator created: ${adminEmail}`);
    } else {
      console.log(`[Seed] Administrator already exists: ${adminEmail}`);
    }

    console.log('[Seed] Checking universities catalog...');
    const uniCount = await University.countDocuments();
    if (uniCount === 0) {
      const universitiesData = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'universities.json'), 'utf-8')
      );
      await University.insertMany(universitiesData);
      console.log(`[Seed] Inserted ${universitiesData.length} universities`);
    } else {
      console.log(`[Seed] Universities already seeded (${uniCount} found)`);
    }

    console.log('[Seed] Checking scholarships catalog...');
    const scholarshipCount = await Scholarship.countDocuments();
    if (scholarshipCount === 0) {
      const scholarshipsData = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'scholarships.json'), 'utf-8')
      );
      await Scholarship.insertMany(scholarshipsData);
      console.log(`[Seed] Inserted ${scholarshipsData.length} scholarships`);
    } else {
      console.log(`[Seed] Scholarships already seeded (${scholarshipCount} found)`);
    }

    console.log('[Seed] Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    throw error;
  }
};

// If run directly: node data/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedDatabase;
