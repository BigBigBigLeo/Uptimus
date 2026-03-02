const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Environment check: Vercel or manual production build
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';

if (isProduction) {
    console.log('--- Environment detected: Production/Vercel ---');
    console.log('Setting Prisma provider to "postgresql"...');
    schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
} else {
    console.log('--- Environment detected: Local Development ---');
    console.log('Setting Prisma provider to "sqlite"...');
    schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
}

fs.writeFileSync(schemaPath, schema);
console.log('Prisma schema updated successfully.');
