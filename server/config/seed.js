import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@foodie.ai' },
    update: {},
    create: {
      email: 'demo@foodie.ai',
      password,
      name: 'Mido',
      diet: 'none',
      skillLevel: 'intermediate',
    },
  });

  console.log('Seed user created:', user.email);
  console.log('Password: demo1234');
}

main().finally(() => prisma.$disconnect());
