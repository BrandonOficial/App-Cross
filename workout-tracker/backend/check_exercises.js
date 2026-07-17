require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await prisma.$connect();
  const count = await prisma.exercise.count();
  const exercises = await prisma.exercise.findMany({ take: 10 });
  console.log(`\n\n=== RESULT ===`);
  console.log(`Total exercises: ${count}`);
  if (count > 0) {
      console.log('Sample:');
      exercises.forEach(ex => console.log(`- ${ex.name} (${ex.muscleGroup})`));
  } else {
      console.log('No exercises found in DB.');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
