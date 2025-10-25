import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
const files = readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort();

console.log('=== Sistema Dojo • Setup de Banco de Dados ===');
console.log('Execute os comandos SQL abaixo no seu projeto Supabase:');
for (const file of files) {
  const sql = readFileSync(join(migrationsDir, file), 'utf8');
  console.log(`\n--- ${file} ---\n${sql}`);
}
console.log('\nUse o Supabase SQL Editor ou CLI para aplicar as migrations.');
