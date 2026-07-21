/**
 * Run once after connecting real Supabase credentials.
 * Creates a test account you can log in with:
 *
 *   Email:    test@nexus-alpha-trading.dev
 *   Password: Test1234!
 *
 * Usage:
 *   npx tsx scripts/seed-test-user.ts
 */

import { createAdminClient } from '../lib/supabase/admin';

const TEST_EMAIL = 'test@nexus-alpha-trading.dev';
const TEST_PASSWORD='***';

async function main() {
  const admin = createAdminClient();

  // 1. Check if user already exists
  const { data: users, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    process.exit(1);
  }

  const existing = users.users.find((u) => u.email === TEST_EMAIL);
  if (existing) {
    console.log('✅ Test account already exists:');
    console.log(`   Email:    ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log(`   User ID:  ${existing.id}`);
    return;
  }

  // 2. Create user
  const { data, error } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true, // Auto-confirm so no email needed
  });

  if (error) {
    console.error('❌ Failed to create test user:', error.message);
    process.exit(1);
  }

  console.log('🎉 Test account created:');
  console.log(`   Email:    ${TEST_EMAIL}`);
  console.log(`   Password: ${TEST_PASSWORD}`);
  console.log(`   User ID:  ${data.user.id}`);
  console.log('');
  console.log('You can now log in at http://localhost:3000/login');
}

main();
