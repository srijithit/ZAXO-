const fs = require('fs');
const path = require('path');

// Try to load dotenv config if available
try {
  require('dotenv').config();
} catch (e) {
  // Ignore
}

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

console.log(`[Prepare-Prisma] DATABASE_URL = ${databaseUrl}`);

if (!fs.existsSync(schemaPath)) {
  console.error(`[Prepare-Prisma] Error: schema.prisma not found at ${schemaPath}`);
  process.exit(1);
}

let schemaContent = fs.readFileSync(schemaPath, 'utf8');

if (databaseUrl.startsWith('postgres') || databaseUrl.startsWith('postgresql')) {
  console.log('[Prepare-Prisma] Switching database provider to postgresql...');
  schemaContent = schemaContent.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
} else {
  console.log('[Prepare-Prisma] Switching database provider to sqlite...');
  schemaContent = schemaContent.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
}

fs.writeFileSync(schemaPath, schemaContent, 'utf8');
console.log('[Prepare-Prisma] schema.prisma updated successfully.');
