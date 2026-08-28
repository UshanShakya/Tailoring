import prisma from '../lib/prisma';
import {
  createGarmentType,
  updateGarmentType,
  listGarmentTypes,
  createCustomTemplate,
  listTemplates,
} from '../modules/templates/templates.service';

async function runProductTypeTests() {
  console.log('=== RUNNING MILESTONE 11 PRODUCT TYPE SETUP AUTOMATED TESTS ===\n');

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
        },
      });
    }

    // TEST 1: Create New Product Type with English + Nepali Names & Default Price
    console.log('[TEST 1] Creating new Product Type (Waistcoat / वेस्टकोट)...');
    const newProductType = await createGarmentType(testBusiness.id, {
      name: 'Waistcoat',
      nameNp: 'वेस्टकोट',
      defaultPrice: 3500.0,
    });

    console.assert(newProductType.name === 'Waistcoat', 'FAIL: Name should be Waistcoat');
    console.assert(newProductType.nameNp === 'वेस्टकोट', 'FAIL: Nepali name should be वेस्टकोट');
    console.assert(Number(newProductType.defaultPrice) === 3500.0, 'FAIL: Default price should be 3500.0');
    console.assert(newProductType.businessId === testBusiness.id, 'FAIL: Tenant businessId mismatch');
    console.log('✓ TEST 1 PASSED: Product Type created successfully with bilingual names and default price!');

    // TEST 2: Update Existing Product Type Price & Nepali Label
    console.log('[TEST 2] Updating Product Type price & Nepali label...');
    const updatedProductType = await updateGarmentType(testBusiness.id, newProductType.id, {
      nameNp: 'अनुकूलित वेस्टकोट',
      defaultPrice: 4000.0,
    });

    console.assert(updatedProductType.nameNp === 'अनुकूलित वेस्टकोट', 'FAIL: Updated Nepali name mismatch');
    console.assert(Number(updatedProductType.defaultPrice) === 4000.0, 'FAIL: Updated price should be 4000.0');
    console.log('✓ TEST 2 PASSED: Product Type updated successfully!');

    // TEST 3: Create Custom Measurement Template Mapped to Product Type
    console.log('[TEST 3] Mapping custom measurement template to Product Type...');
    const template = await createCustomTemplate(testBusiness.id, {
      garmentTypeId: newProductType.id,
      name: 'Custom Waistcoat Template',
      nameNp: 'विशेष वेस्टकोट नाप ढाँचा',
      fields: [
        { label: 'Chest', labelNp: 'छाती', key: 'chest', unit: 'in', dataType: 'number', order: 1, required: true },
        { label: 'Waist', labelNp: 'कमर', key: 'waist', unit: 'in', dataType: 'number', order: 2, required: true },
        { label: 'Back Length', labelNp: 'पिठ्युँको लम्बाइ', key: 'back_length', unit: 'in', dataType: 'number', order: 3, required: true },
      ],
    });

    console.assert(template.garmentTypeId === newProductType.id, 'FAIL: Mapped garmentTypeId mismatch');
    console.assert(template.fields.length === 3, 'FAIL: Expected 3 measurement fields');
    console.assert(template.fields[0].labelNp === 'छाती', 'FAIL: Nepali field label mismatch');
    console.log('✓ TEST 3 PASSED: Measurement template mapped to Product Type successfully!');

    // TEST 4: Query Product Types & Verify Template Count Mapping
    console.log('[TEST 4] Listing Product Types and verifying template count mapping...');
    const allProductTypes = await listGarmentTypes(testBusiness.id);
    const targetPt = allProductTypes.find((gt) => gt.id === newProductType.id);

    console.assert(targetPt !== undefined, 'FAIL: Created product type missing in list');
    console.assert(targetPt?._count.templates! >= 1, 'FAIL: Mapped template count should be at least 1');
    console.log('✓ TEST 4 PASSED: Product Type listing and template mapping count verified!');

    console.log('\n==================================================');
    console.log('🎉 ALL PRODUCT TYPE SETUP TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('❌ PRODUCT TYPE TEST FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runProductTypeTests();
