// Set environment variables
process.env.DATABASE_URL = "postgresql://postgres:12345678@localhost:5432/chart_breaker_ehr";
process.env.JWT_SECRET = "your-super-secret-jwt-key-here-chart-breaker-2024";
process.env.JWT_REFRESH_SECRET = "your-super-secret-refresh-key-here-chart-breaker-2024";
process.env.PORT = "5000";
process.env.NODE_ENV = "development";

console.log('Environment variables set:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Start the server
require('./server/server.js');
