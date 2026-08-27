import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHashSuper = await bcrypt.hash('SuperAdmin123!', 10);
  const passwordHashAdmin = await bcrypt.hash('Admin123!', 10);
  const passwordHashStaff = await bcrypt.hash('Staff123!', 10);

  // 1. Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@platform.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@platform.com',
      passwordHash: passwordHashSuper,
      role: Role.SUPER_ADMIN,
      businessId: null,
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);

  // 2. Create Sample Business
  let business = await prisma.business.findFirst({
    where: { name: 'Stitch & Style Tailors' },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'Stitch & Style Tailors',
        address: '123 Fashion Street, Suit City',
        phone: '+1-555-0199',
      },
    });
    console.log('✅ Sample Business created:', business.name);
  }

  // 3. Create Business Admin
  const businessAdmin = await prisma.user.upsert({
    where: { email: 'admin@stitchandstyle.com' },
    update: {},
    create: {
      name: 'Master Tailor Admin',
      email: 'admin@stitchandstyle.com',
      passwordHash: passwordHashAdmin,
      role: Role.BUSINESS_ADMIN,
      businessId: business.id,
    },
  });
  console.log('✅ Business Admin created:', businessAdmin.email);

  // 4. Create Staff Full
  const staffFull = await prisma.user.upsert({
    where: { email: 'staff.full@stitchandstyle.com' },
    update: {},
    create: {
      name: 'Full Staff Member',
      email: 'staff.full@stitchandstyle.com',
      passwordHash: passwordHashStaff,
      role: Role.STAFF_FULL,
      businessId: business.id,
    },
  });
  console.log('✅ Staff Full created:', staffFull.email);

  // 5. Create Staff Basic
  const staffBasic = await prisma.user.upsert({
    where: { email: 'staff.basic@stitchandstyle.com' },
    update: {},
    create: {
      name: 'Basic Staff Member',
      email: 'staff.basic@stitchandstyle.com',
      passwordHash: passwordHashStaff,
      role: Role.STAFF_BASIC,
      businessId: business.id,
    },
  });
  console.log('✅ Staff Basic created:', staffBasic.email);

  console.log('🎉 Seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
