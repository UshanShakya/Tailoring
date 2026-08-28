import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up database: removing demo data and non-system records...');

  // 1. Wipe transactional and demo data
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.measurement.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.roleGroupMapping.deleteMany({});
  await prisma.roleGroup.deleteMany({});

  // Wipe custom tenant templates and product types
  await prisma.templateField.deleteMany({ where: { template: { isSystemDefault: false } } });
  await prisma.measurementTemplate.deleteMany({ where: { isSystemDefault: false } });
  await prisma.garmentType.deleteMany({ where: { isSystemDefault: false } });
  await prisma.role.deleteMany({ where: { isSystem: false } });
  await prisma.business.deleteMany({});

  console.log('✅ Demo data wiped successfully.');

  // 2. Create System Default Roles
  console.log('🌱 Seeding system default roles...');
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

  await prisma.role.upsert({
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

  await prisma.role.upsert({
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

  await prisma.role.upsert({
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

  console.log('✅ System roles created.');

  // 3. Create Main Admin Company Business
  console.log('🌱 Seeding Main Admin Company business...');
  const mainBusiness = await prisma.business.create({
    data: {
      name: 'Main Tailoring HQ',
      address: 'Durbar Marg, Kathmandu, Nepal',
      phone: '+977-1-4200000',
      email: 'contact@tailor.com',
      panNumber: '100200300',
      isVatRegistered: true,
      taxRate: 13.0,
      invoiceNote: 'Thank you for choosing Main Tailoring HQ.',
    },
  });

  // 4. Create Single Super Admin Account (admin@tailor.com / Password@123)
  console.log('🔑 Creating SINGLE Super Admin account (admin@tailor.com)...');
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const superAdminUser = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@tailor.com',
      passwordHash: passwordHash,
      roleId: superAdminRole.id,
      businessId: mainBusiness.id,
    },
  });

  console.log(`✅ Super Admin created: ${superAdminUser.email}`);

  // 5. Seed System Default Garment Types & Measurement Templates
  console.log('🌱 Seeding system default product types and templates...');

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

    await prisma.templateField.deleteMany({ where: { templateId: template.id } });

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
  }

  console.log('🎉 Database cleaned and single Super Admin account initialized!');
  console.log('🔑 Credentials: admin@tailor.com | Password: Password@123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
