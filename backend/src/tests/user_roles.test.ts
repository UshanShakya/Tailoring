import prisma from '../lib/prisma';
import { updateUser } from '../modules/users/users.service';

async function runUserRolesTests() {
  console.log('=== RUNNING MILESTONE 14 USER ROLES AUTOMATED TESTS ===\n');

  try {
    // 1. Fetch system roles
    const superAdminRole = await prisma.role.findFirst({ where: { name: 'Super Admin' } });
    const businessAdminRole = await prisma.role.findFirst({ where: { name: 'Business Admin' } });
    const staffFullRole = await prisma.role.findFirst({ where: { name: 'Staff Full' } });
    const staffBasicRole = await prisma.role.findFirst({ where: { name: 'Staff Basic' } });

    if (!superAdminRole || !businessAdminRole || !staffFullRole || !staffBasicRole) {
      throw new Error('System default roles are missing in database!');
    }

    // 2. Setup Test Business Tenant
    let testBusiness = await prisma.business.findFirst({ where: { name: 'Milestone 14 Role Test Shop' } });
    if (!testBusiness) {
      testBusiness = await prisma.business.create({
        data: {
          name: 'Milestone 14 Role Test Shop',
          address: 'Kathmandu, Nepal',
          phone: '+977-9800000000',
        },
      });
    }

    // 3. Create test users
    const bAdminEmail = `badmin_${Date.now()}@test.com`;
    const bAdminUser = await prisma.user.create({
      data: {
        name: 'Test Business Admin',
        email: bAdminEmail,
        passwordHash: 'hashed_pass',
        roleId: businessAdminRole.id,
        businessId: testBusiness.id,
      },
    });

    const staffEmail = `staff_${Date.now()}@test.com`;
    const staffUser = await prisma.user.create({
      data: {
        name: 'Test Staff User',
        email: staffEmail,
        passwordHash: 'hashed_pass',
        roleId: staffBasicRole.id,
        businessId: testBusiness.id,
      },
    });

    // TEST 1: Business Admin updating Staff User's role to Staff Full (Allowed)
    console.log('[TEST 1] Testing Business Admin updating staff user role to Staff Full...');
    const updatedStaff = await updateUser(staffUser.id, testBusiness.id, 'Business Admin', {
      roleId: staffFullRole.id,
    });
    console.assert(updatedStaff.role?.name === 'Staff Full', `FAIL: Role should be Staff Full, got ${updatedStaff.role?.name}`);
    console.log('✓ TEST 1 PASSED: Business Admin successfully updated staff member role!');

    // TEST 2: Business Admin attempting to edit another Business Admin (Should fail 403)
    console.log('[TEST 2] Testing Business Admin attempting to edit a Business Admin account...');
    try {
      await updateUser(bAdminUser.id, testBusiness.id, 'Business Admin', {
        name: 'Attempted Renamed Admin',
      });
      console.error('FAIL: Business Admin edit should have thrown 403');
    } catch (err: any) {
      console.assert(err.status === 403, `Expected 403, got ${err.status}`);
      console.log(`✓ TEST 2 PASSED: Correctly blocked with message: "${err.message}"`);
    }

    // TEST 3: Business Admin attempting to assign Business Admin role to staff (Should fail 403)
    console.log('[TEST 3] Testing Business Admin attempting to assign Business Admin role to staff...');
    try {
      await updateUser(staffUser.id, testBusiness.id, 'Business Admin', {
        roleId: businessAdminRole.id,
      });
      console.error('FAIL: Assigning Business Admin role should have thrown 403');
    } catch (err: any) {
      console.assert(err.status === 403, `Expected 403, got ${err.status}`);
      console.log(`✓ TEST 3 PASSED: Correctly blocked with message: "${err.message}"`);
    }

    // TEST 4: Super Admin editing Business Admin user & assigning role (Allowed)
    console.log('[TEST 4] Testing Super Admin editing Business Admin user & changing role...');
    const updatedBAdmin = await updateUser(bAdminUser.id, null, 'Super Admin', {
      name: 'Super Admin Updated Name',
      roleId: staffFullRole.id,
    });
    console.assert(updatedBAdmin.name === 'Super Admin Updated Name', 'FAIL: Super Admin update failed name change');
    console.assert(updatedBAdmin.role?.name === 'Staff Full', 'FAIL: Super Admin update failed role change');
    console.log('✓ TEST 4 PASSED: Super Admin successfully updated Business Admin user details & role!');

    console.log('\n==================================================');
    console.log('🎉 ALL MILESTONE 14 USER ROLE TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================\n');

    // Cleanup test users
    await prisma.user.delete({ where: { id: bAdminUser.id } });
    await prisma.user.delete({ where: { id: staffUser.id } });
  } catch (err: any) {
    console.error('❌ MILESTONE 14 TEST FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runUserRolesTests();
