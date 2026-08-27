import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with dynamic roles and measurement templates with Nepali labels...');

  const passwordHashSuper = await bcrypt.hash('SuperAdmin123!', 10);
  const passwordHashAdmin = await bcrypt.hash('Admin123!', 10);
  const passwordHashStaff = await bcrypt.hash('Staff123!', 10);

  // 1. Create System Default Roles with Template Permissions
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
        'menu:templates',
        'menu:orders',
        'menu:invoices',
        'staff:manage',
        'role:manage',
        'customer:*',
        'template:*',
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
        'menu:templates',
        'menu:orders',
        'menu:invoices',
        'staff:manage',
        'role:manage',
        'customer:*',
        'template:*',
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
        'menu:templates',
        'menu:orders',
        'menu:invoices',
        'customer:*',
        'template:view',
        'order:*',
        'invoice:view',
        'payment:create',
      ],
    },
    create: {
      id: 'role-staff-full',
      name: 'Staff Full',
      description: 'Access to customers, measurements, templates, orders, and payments',
      permissions: [
        'menu:dashboard',
        'menu:customers',
        'menu:templates',
        'menu:orders',
        'menu:invoices',
        'customer:*',
        'template:view',
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
        'menu:templates',
        'customer:view',
        'customer:create',
        'customer:edit',
        'template:view',
      ],
    },
    create: {
      id: 'role-staff-basic',
      name: 'Staff Basic',
      description: 'Basic access to view customers, measurements, and templates',
      permissions: [
        'menu:dashboard',
        'menu:customers',
        'menu:templates',
        'customer:view',
        'customer:create',
        'customer:edit',
        'template:view',
      ],
      isSystem: true,
      businessId: null,
    },
  });

  console.log('✅ System roles seeded.');

  // 2. Create Users
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
  }

  await prisma.user.upsert({
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

  await prisma.user.upsert({
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

  await prisma.user.upsert({
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

  console.log('✅ Base users seeded.');

  // 3. Seed System Default Garment Types & Measurement Templates (with Nepali Labels)
  console.log('🌱 Seeding standard system default garment templates with English & Nepali labels...');

  const systemGarments = [
    {
      id: 'garment-shirt',
      name: 'Shirt',
      nameNp: 'सर्ट',
      templateName: 'Standard Shirt Template',
      templateNameNp: 'साधारण सर्ट नाप ढाँचा',
      fields: [
        { label: 'Chest', labelNp: 'छाती', key: 'chest', unit: 'in', dataType: 'number', order: 1 },
        { label: 'Shoulder', labelNp: 'काँध', key: 'shoulder', unit: 'in', dataType: 'number', order: 2 },
        { label: 'Sleeve Length', labelNp: 'हातको लम्बाइ', key: 'sleeveLength', unit: 'in', dataType: 'number', order: 3 },
        { label: 'Shirt Length', labelNp: 'सर्टको लम्बाइ', key: 'shirtLength', unit: 'in', dataType: 'number', order: 4 },
        { label: 'Neck / Collar', labelNp: 'घाँटी / कलर', key: 'neck', unit: 'in', dataType: 'number', order: 5 },
        { label: 'Cuff', labelNp: 'कफ', key: 'cuff', unit: 'in', dataType: 'number', order: 6 },
      ],
    },
    {
      id: 'garment-trousers',
      name: 'Trousers / Pants',
      nameNp: 'प्यान्ट',
      templateName: 'Standard Trousers Template',
      templateNameNp: 'साधारण प्यान्ट नाप ढाँचा',
      fields: [
        { label: 'Waist', labelNp: 'कमर', key: 'waist', unit: 'in', dataType: 'number', order: 1 },
        { label: 'Hip', labelNp: 'हिप', key: 'hip', unit: 'in', dataType: 'number', order: 2 },
        { label: 'Total Length', labelNp: 'कुल लम्बाइ', key: 'length', unit: 'in', dataType: 'number', order: 3 },
        { label: 'Inseam', labelNp: 'इनसिम / भित्री लम्बाइ', key: 'inseam', unit: 'in', dataType: 'number', order: 4 },
        { label: 'Thigh', labelNp: 'तिघ्रा', key: 'thigh', unit: 'in', dataType: 'number', order: 5 },
        { label: 'Leg Opening (Mori)', labelNp: 'मोरी / पाउ', key: 'legOpening', unit: 'in', dataType: 'number', order: 6 },
      ],
    },
    {
      id: 'garment-suit',
      name: 'Suit / Jacket',
      nameNp: 'सूट / कोट',
      templateName: 'Standard Suit Coat Template',
      templateNameNp: 'साधारण कोट नाप ढाँचा',
      fields: [
        { label: 'Chest', labelNp: 'छाती', key: 'chest', unit: 'in', dataType: 'number', order: 1 },
        { label: 'Waist', labelNp: 'कमर', key: 'waist', unit: 'in', dataType: 'number', order: 2 },
        { label: 'Shoulder', labelNp: 'काँध', key: 'shoulder', unit: 'in', dataType: 'number', order: 3 },
        { label: 'Sleeve Length', labelNp: 'बाहुलाको लम्बाइ', key: 'sleeveLength', unit: 'in', dataType: 'number', order: 4 },
        { label: 'Coat Length', labelNp: 'कोटको लम्बाइ', key: 'coatLength', unit: 'in', dataType: 'number', order: 5 },
        { label: 'Cross Back', labelNp: 'ढाडको चौडाइ', key: 'crossBack', unit: 'in', dataType: 'number', order: 6 },
      ],
    },
    {
      id: 'garment-kurta',
      name: 'Kurta / Daura',
      nameNp: 'कुर्ता / दौरा',
      templateName: 'Standard Kurta Template',
      templateNameNp: 'साधारण कुर्ता नाप ढाँचा',
      fields: [
        { label: 'Chest', labelNp: 'छाती', key: 'chest', unit: 'in', dataType: 'number', order: 1 },
        { label: 'Shoulder', labelNp: 'काँध', key: 'shoulder', unit: 'in', dataType: 'number', order: 2 },
        { label: 'Sleeve Length', labelNp: 'हातको लम्बाइ', key: 'sleeveLength', unit: 'in', dataType: 'number', order: 3 },
        { label: 'Kurta Length', labelNp: 'कुर्ताको लम्बाइ', key: 'kurtaLength', unit: 'in', dataType: 'number', order: 4 },
        { label: 'Neck', labelNp: 'घाँटी', key: 'neck', unit: 'in', dataType: 'number', order: 5 },
      ],
    },
    {
      id: 'garment-blazer',
      name: 'Blazer',
      nameNp: 'ब्लेजर',
      templateName: 'Standard Blazer Template',
      templateNameNp: 'साधारण ब्लेजर नाप ढाँचा',
      fields: [
        { label: 'Chest', labelNp: 'छाती', key: 'chest', unit: 'in', dataType: 'number', order: 1 },
        { label: 'Waist', labelNp: 'कमर', key: 'waist', unit: 'in', dataType: 'number', order: 2 },
        { label: 'Shoulder', labelNp: 'काँध', key: 'shoulder', unit: 'in', dataType: 'number', order: 3 },
        { label: 'Sleeve Length', labelNp: 'हातको लम्बाइ', key: 'sleeveLength', unit: 'in', dataType: 'number', order: 4 },
        { label: 'Back Length', labelNp: 'पछाडिको लम्बाइ', key: 'backLength', unit: 'in', dataType: 'number', order: 5 },
      ],
    },
  ];

  for (const item of systemGarments) {
    const garment = await prisma.garmentType.upsert({
      where: { id: item.id },
      update: { name: item.name, nameNp: item.nameNp },
      create: {
        id: item.id,
        name: item.name,
        nameNp: item.nameNp,
        isSystemDefault: true,
        businessId: null,
      },
    });

    const templateId = `template-${item.id}`;
    const template = await prisma.measurementTemplate.upsert({
      where: { id: templateId },
      update: { name: item.templateName, nameNp: item.templateNameNp },
      create: {
        id: templateId,
        garmentTypeId: garment.id,
        name: item.templateName,
        nameNp: item.templateNameNp,
        isSystemDefault: true,
        businessId: null,
      },
    });

    // Delete existing fields to re-seed cleanly
    await prisma.templateField.deleteMany({ where: { templateId: template.id } });

    // Seed Template Fields
    for (const f of item.fields) {
      await prisma.templateField.create({
        data: {
          templateId: template.id,
          label: f.label,
          labelNp: f.labelNp,
          key: f.key,
          unit: f.unit,
          dataType: f.dataType,
          order: f.order,
          required: true,
        },
      });
    }
    console.log(`  ✓ Template seeded for ${item.name} (${item.nameNp})`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
