const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nPlease ensure:');
    console.log('1. PostgreSQL is running');
    console.log('2. Database "chart_breaker_ehr" exists');
    console.log('3. Connection string in .env is correct');
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
