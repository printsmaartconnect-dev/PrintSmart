const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    const result = await prisma.shopkeeper.findMany({
      take: 5
    });
    console.log('Connection successful! Shopkeepers found:', result.length);
    console.log(result);
  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
