import prisma from '../lib/prisma';
import { createOrder } from '../modules/orders/orders.service';
import { generateInvoiceFromOrder, recordPayment } from '../modules/invoices/invoices.service';
import { createGarmentType, updateGarmentType } from '../modules/templates/templates.service';
import { updateCompanySettings } from '../modules/settings/company.service';

async function runBillingTests() {
  console.log('=== RUNNING BILLING & INVOICE AUTOMATED TESTS ===');

  try {
    // 1. Fetch or create test business tenant
    let testBusiness = await prisma.business.findFirst({
      where: { name: 'Test Tailoring Business' },
    });

    if (!testBusiness) {
      testBusiness = await prisma.business.create({
        data: {
          name: 'Test Tailoring Business',
          address: 'Kathmandu, Nepal',
          phone: '9800000000',
          panNumber: '999888777',
          isVatRegistered: true,
          taxRate: 13.0,
        },
      });
    } else {
      await updateCompanySettings(testBusiness.id, {
        panNumber: '999888777',
        isVatRegistered: true,
        taxRate: 13.0,
      });
    }

    // 2. Fetch or create test customer
    let testCustomer = await prisma.customer.findFirst({
      where: { businessId: testBusiness.id },
    });

    if (!testCustomer) {
      testCustomer = await prisma.customer.create({
        data: {
          businessId: testBusiness.id,
          name: 'Billing Test Customer',
          phone: '9841112233',
          createdBy: 'test-admin',
        },
      });
    }

    // TEST 1: Configured Default Price Auto-Fill
    console.log('[TEST 1] Testing Garment Type Default Price Auto-Fill...');
    const gTypePriced = await createGarmentType(testBusiness.id, {
      name: 'Custom Suit Coat',
      defaultPrice: 5000.0,
    });

    const orderPriced = await createOrder(testBusiness.id, 'test-admin', {
      customerId: testCustomer.id,
      items: [
        {
          garmentTypeId: gTypePriced.id,
          quantity: 2,
          // unitPrice deliberately omitted to test auto-fill
        },
      ],
    });

    console.assert(Number(orderPriced.items[0].unitPrice) === 5000.0, 'FAIL: Default unitPrice should be 5000.0');
    console.assert(Number(orderPriced.totalAmount) === 10000.0, 'FAIL: Order total should be 10000.0');
    console.log('✓ TEST 1 PASSED: Configured default price auto-filled correctly!');

    // TEST 2: Optional Price (Null Unit Price)
    console.log('[TEST 2] Testing Order Creation without Predefined Price...');
    const gTypeUnpriced = await createGarmentType(testBusiness.id, {
      name: 'Unpriced Fabric Piece',
      defaultPrice: null,
    });

    const orderUnpriced = await createOrder(testBusiness.id, 'test-admin', {
      customerId: testCustomer.id,
      items: [
        {
          garmentTypeId: gTypeUnpriced.id,
          quantity: 1,
        },
      ],
    });

    console.assert(orderUnpriced.items[0].unitPrice === null, 'FAIL: Unit price should be null');
    console.assert(Number(orderUnpriced.totalAmount) === 0, 'FAIL: Order total should be 0');
    console.log('✓ TEST 2 PASSED: Order created without price successfully!');

    // TEST 3: VAT Tax Calculation & Company Snapshotting
    console.log('[TEST 3] Testing VAT Calculation & Invoice Snapshot...');
    const invoice = await generateInvoiceFromOrder(testBusiness.id, orderPriced.id, 'test-admin');

    console.assert(Number(invoice.subtotal) === 10000.0, 'FAIL: Subtotal should be 10000.0');
    console.assert(Number(invoice.taxAmount) === 1300.0, 'FAIL: 13% VAT taxAmount should be 1300.0');
    console.assert(Number(invoice.totalAmount) === 11300.0, 'FAIL: Total amount with VAT should be 11300.0');
    console.assert(invoice.companyPan === '999888777', 'FAIL: Company PAN should be snapshotted as 999888777');
    console.log('✓ TEST 3 PASSED: VAT calculation & snapshot verified!');

    // TEST 4: Historical Invoice Price Immortality
    console.log('[TEST 4] Testing Historical Invoice Price Snapshot Immutability...');
    await updateGarmentType(testBusiness.id, gTypePriced.id, { defaultPrice: 99999.0 });
    await updateCompanySettings(testBusiness.id, { panNumber: '000000000' });

    const invoiceRefetched = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    console.assert(Number(invoiceRefetched?.totalAmount) === 11300.0, 'FAIL: Issued invoice total must remain 11300.0');
    console.assert(invoiceRefetched?.companyPan === '999888777', 'FAIL: Issued invoice PAN must remain 999888777');
    console.log('✓ TEST 4 PASSED: Issued invoice snapshot remained unchanged after price & company setting updates!');

    // TEST 5: Partial Payments & Overpayment Prevention
    console.log('[TEST 5] Testing Partial Payments & Overpayment Guard...');
    const payResult1 = await recordPayment(testBusiness.id, invoice.id, 'test-admin', {
      amount: 5000.0,
      method: 'CASH',
    });

    console.assert(payResult1.invoice.status === 'PARTIALLY_PAID', 'FAIL: Status should be PARTIALLY_PAID');
    console.assert(Number(payResult1.invoice.dueAmount) === 6300.0, 'FAIL: Due amount should be 6300.0');

    // Overpayment check
    let overpaymentBlocked = false;
    try {
      await recordPayment(testBusiness.id, invoice.id, 'test-admin', {
        amount: 99999.0,
        method: 'CASH',
      });
    } catch (err) {
      overpaymentBlocked = true;
    }
    console.assert(overpaymentBlocked, 'FAIL: Overpayment should have been blocked');

    // Full Payment
    const payResult2 = await recordPayment(testBusiness.id, invoice.id, 'test-admin', {
      amount: 6300.0,
      method: 'BANK_TRANSFER',
    });
    console.assert(payResult2.invoice.status === 'PAID', 'FAIL: Status should be PAID');
    console.assert(Number(payResult2.invoice.dueAmount) === 0, 'FAIL: Due amount should be 0');
    console.log('✓ TEST 5 PASSED: Payment status recalculation & overpayment guard verified!');

    console.log('\n==================================================');
    console.log('🎉 ALL BILLING & INVOICE TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('❌ BILLING TEST FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBillingTests();
