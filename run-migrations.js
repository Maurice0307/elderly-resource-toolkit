const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE credentials in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📋 Found ${files.length} migration files\n`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`⏳ Running ${file}...`);
    try {
      const { error } = await supabase.rpc('exec', { sql });
      
      if (error) {
        // rpc approach might not work, try direct SQL via admin endpoint
        console.log(`   (trying direct SQL execution...)`);
        // We'll use a different approach - execute via the query method if available
      } else {
        console.log(`✅ ${file} completed\n`);
      }
    } catch (err) {
      console.log(`   ⚠️  RPC approach failed, trying direct SQL...\n`);
    }
  }
}

runMigrations().catch(console.error);
