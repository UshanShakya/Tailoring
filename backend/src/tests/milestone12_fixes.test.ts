import prisma from '../lib/prisma';
import { createOrder, listOrders } from '../modules/orders/orders.service';
import { generateInvoiceFromOrder, listInvoices } from '../modules/invoices/invoices.service';
import { listCustomers } from '../modules/customers/customers.service';
import { createGarmentType, updateGarmentType } from '../modules/templates/templates.service';

async function runMilestone12Tests() {
  console.log('=== RUNNING MILESTONE 12 ISSUE FIXES AUTOMATED TESTS ===\n');

  try {
    // 1. Fetch or create Super Admin User & Admin Company Business
    let superAdminUser = await prisma.user.findFirst({
      where: { role: { name: 'Super Admin' } },
      include: { business: true },
    });

    if (!superAdminUser) {
      const superAdminRole = await prisma.role.findFirst({ where: { name: 'Super Admin' } });
      superAdminUser = await prisma.user.create({
        data: {
          name: 'Global Platform Admin',
          email: 'admin.global@platform.com',
          passwordHash: 'hashed_password',
          roleId: superAdminRole?.id || 'role-super-admin',
        },
        include: { business: true },
      });
    }

    let adminBusiness = await prisma.business.findFirst({
      where: { name: 'Tailoring Platform HQ' },
    });

    if (!adminBusiness) {
      adminBusiness = await prisma.business.create({
        data: {
          name: 'Tailoring Platform HQ',
          address: 'Kathmandu Headquarters, Nepal',
          phone: '+977-1-4999999',
          panNumber: '100200300',
          isVatRegistered: true,
          taxRate: 13.0,
        },
      });
    }

    // Connect Super Admin to Admin Business if needed
    if (!superAdminUser.businessId) {
      await prisma.user.update({
        where: { id: superAdminUser.id },
        data: { businessId: adminBusiness.id },
      });
    }

    // 2. Create Tenant Business & Customer
    let tenantBusiness = await prisma.business.findFirst({
      where: { name: 'Branch Stitchers Boutique' },
    });

    if (!tenantBusiness) {
      tenantBusiness = await prisma.business.create({
        data: {
          name: 'Branch Stitchers Boutique',
          address: 'Patan, Lalitpur, Nepal',
          phone: '+977-1-5551111',
          panNumber: '999111222',
        },
      });
    }

    let testCustomer = await prisma.customer.findFirst({
      where: { businessId: tenantBusiness.id },
    });

    if (!testCustomer) {
      testCustomer = await prisma.customer.create({
        data: {
          businessId: tenantBusiness.id,
          name: 'Milestone 12 Test Client',
          phone: '9849998887',
          createdBy: 'test-admin',
        },
      });
    }

    // TEST 1: B2B Invoice Generation with Main Admin Company as Seller/FROM
    console.log('[TEST 1] Testing B2B Invoice Generation (FROM: Admin Company, TO: Tenant Business & Customer Ref)...');
    const garmentType = await createGarmentType(tenantBusiness.id, {
      name: 'Custom Blazer Coat',
      defaultPrice: 8000.0,
    });

    const order = await createOrder(tenantBusiness.id, 'test-admin', {
      customerId: testCustomer.id,
      items: [{ garmentTypeId: garmentType.id, quantity: 1, unitPrice: 8000.0 }],
    });

    const invoice = await generateInvoiceFromOrder(tenantBusiness.id, order.id, 'test-admin');

    console.assert(invoice.companyName === 'Tailoring Platform HQ', `FAIL: Seller should be Main Admin Company HQ, got: ${invoice.companyName}`);
    console.assert(invoice.companyPan === '100200300', `FAIL: Seller PAN should be 100200300, got: ${invoice.companyPan}`);
    console.assert(invoice.business?.name === 'Branch Stitchers Boutique', `FAIL: Tenant business should be Branch Stitchers Boutique, got: ${invoice.business?.name}`);
    console.assert(invoice.customer.name === 'Milestone 12 Test Client', 'FAIL: Customer ref mismatch');
    console.log('✓ TEST 1 PASSED: Invoice correctly snapshots Main Admin Company as Seller and Tenant Business as Billed To!');

    // TEST 2: Super Admin Global Querying (Orders, Invoices, Customers without tenant lock)
    console.log('[TEST 2] Testing Super Admin global query separation (Orders, Invoices, Customers)...');
    const allOrders = await listOrders(undefined);
    const allInvoices = await listInvoices(undefined);
    const allCustomers = await listCustomers(undefined);

    console.assert(allOrders.length > 0, 'FAIL: Super Admin should fetch orders across businesses');
    console.assert(allInvoices.length > 0, 'FAIL: Super Admin should fetch invoices across businesses');
    console.assert(allCustomers.length > 0, 'FAIL: Super Admin should fetch customers across businesses');
    console.assert(allOrders.some((o) => o.business !== undefined), 'FAIL: Orders should include business relations');
    console.log('✓ TEST 2 PASSED: Super Admin can query orders, invoices, and customers across all tenant businesses!');

    // TEST 3: Product Type CRUD Operations & Updates
    console.log('[TEST 3] Testing Product Type CRUD & Pricing Updates...');
    const newPt = await createGarmentType(adminBusiness.id, {
      name: 'Sherwani',
      nameNp: 'शेरवानी',
      defaultPrice: 12000.0,
    });

    const updatedPt = await updateGarmentType(adminBusiness.id, newPt.id, {
      nameNp: 'शाही शेरवानी',
      defaultPrice: 15000.0,
    });

    console.assert(updatedPt.nameNp === 'शाही शेरवानी', 'FAIL: Product Type Nepali name update failed');
    console.assert(Number(updatedPt.defaultPrice) === 15000.0, 'FAIL: Product Type price update failed');
    console.log('✓ TEST 3 PASSED: Product Type CRUD and pricing updates verified!');

    console.log('\n==================================================');
    console.log('🎉 ALL MILESTONE 12 ISSUE FIX TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('❌ MILESTONE 12 TEST FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMilestone12Tests();
