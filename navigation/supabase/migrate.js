import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取迁移文件并输出SQL语句
const migrationsDir = path.join(__dirname, 'migrations');
const files = fs.readdirSync(migrationsDir).sort();

console.log('Migration files found:');
files.forEach(file => {
  console.log(`- ${file}`);
});

// 输出最新的迁移文件内容
const latestMigration = files[files.length - 1];
if (latestMigration) {
  const migrationPath = path.join(migrationsDir, latestMigration);
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');
  console.log(`\n=== ${latestMigration} ===`);
  console.log(sqlContent);
}