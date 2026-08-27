import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with dynamic system roles...');

  const passwordHashSuper = await bcrypt.hash('SuperAdmin123!', 10);
  const passwordHashAdmin = await bcrypt.hash('Admin123!', 10);
  const passwordHashStaff = await bcrypt.hash('Staff123!', 10);

  // 1. Create System Default Roles
  const superAdminRole = await prisma.role.upsert({
    where: { id: 'role-super-admin' },
    update: {
      permissions: ['*'],
    },
    create: {
      id: 'role-super-admin',
      name: 'Super Admin',
      description: 'Platform Super Administrator with unrestricted access',
      permissions: ['*'],
      isSystem: true,
      businessId: null,
    },
  });

  const businessAdminRole = await prisma.role.upsert({
    where: { id: 'role-business-admin' },
    update: {
      permissions: [
        'menu:dashboard',
        'menu:staff',
        'menu:roles',
        'menu:customers',
        'menu:orders',
        'menu:invoices',
        'staff:manage',
        'role:manage',
        'customer:*',
        'order:*',
        'invoice:*',
        'payment:*',
      ],
    },
    create: {
      id: 'role-business-admin',
      name: 'Business Admin',
      description: 'Full business management control within tenant',
      permissions: [
        'menu:dashboard',
        'menu:staff',
        'menu:roles',
        'menu:customers',
        'menu:orders',
        'menu:invoices',
        'staff:manage',
        'role:manage',
        'customer:*',
        'order:*',
        'invoice:*',
        'payment:*',
      ],
      isSystem: true,
      businessId: null,
    },
  });

  const staffFullRole = await prisma.role.upsert({
    where: { id: 'role-staff-full' },
    update: {
      permissions: [
        'menu:dashboard',
        'menu:customers',
        'menu:orders',
        'menu:invoices',
        'customer:*',
        'order:*',
        'invoice:view',
        'payment:create',
      ],
    },
    create: {
      id: 'role-staff-full',
      name: 'Staff Full',
      description: 'Access to customers, measurements, orders, and payments',
      permissions: [
        'menu:dashboard',
        'menu:customers',
        'menu:orders',
        'menu:invoices',
        'customer:*',
        'order:*',
        'invoice:view',
        'payment:create',
      ],
      isSystem: true,
      businessId: null,
    },
  });

  const staffBasicRole = await prisma.role.upsert({
    where: { id: 'role-staff-basic' },
    update: {
      permissions: [
        'menu:dashboard',
        'menu:customers',
        'customer:view',
        'customer:create',
        'customer:edit',
      ],
    },
    create: {
      id: 'role-staff-basic',
      name: 'Staff Basic',
      description: 'Basic access to view and manage customer records and measurements',
      permissions: [
        'menu:dashboard',
        'menu:customers',
        'customer:view',
        'customer:create',
        'customer:edit',
      ],
      isSystem: true,
      businessId: null,
    },
  });

  console.log('✅ System roles seeded: Super Admin, Business Admin, Staff Full, Staff Basic');

  // 2. Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@platform.com' },
    update: { roleId: superAdminRole.id },
    create: {
      name: 'Super Admin',
      email: 'superadmin@platform.com',
      passwordHash: passwordHashSuper,
      roleId: superAdminRole.id,
      businessId: null,
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);

  // 3. Create Sample Business
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

  // 4. Create Business Admin
  const businessAdmin = await prisma.user.upsert({
    where: { email: 'admin@stitchandstyle.com' },
    update: { roleId: businessAdminRole.id, businessId: business.id },
    create: {
      name: 'Master Tailor Admin',
      email: 'admin@stitchandstyle.com',
      passwordHash: passwordHashAdmin,
      roleId: businessAdminRole.id,
      businessId: business.id,
    },
  });
  console.log('✅ Business Admin created:', businessAdmin.email);

  // 5. Create Staff Full
  const staffFull = await prisma.user.upsert({
    where: { email: 'staff.full@stitchandstyle.com' },
    update: { roleId: staffFullRole.id, businessId: business.id },
    create: {
      name: 'Full Staff Member',
      email: 'staff.full@stitchandstyle.com',
      passwordHash: passwordHashStaff,
      roleId: staffFullRole.id,
      businessId: business.id,
    },
  });
  console.log('✅ Staff Full created:', staffFull.email);

  // 6. Create Staff Basic
  const staffBasic = await prisma.user.upsert({
    where: { email: 'staff.basic@stitchandstyle.com' },
    update: { roleId: staffBasicRole.id, businessId: business.id },
    create: {
      name: 'Basic Staff Member',
      email: 'staff.basic@stitchandstyle.com',
      passwordHash: passwordHashStaff,
      roleId: staffBasicRole.id,
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
