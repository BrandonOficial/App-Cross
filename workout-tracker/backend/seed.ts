import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const EXERCISES_LIBRARY = [
  // --- PEITO ---
  { name: 'Supino Reto com Barra', muscleGroup: 'Peito' },
  { name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito' },
  { name: 'Supino Reto com Halteres', muscleGroup: 'Peito' },
  { name: 'Supino Inclinado com Barra', muscleGroup: 'Peito' },
  { name: 'Supino Declinado com Barra', muscleGroup: 'Peito' },
  { name: 'Crucifixo Reto com Halteres', muscleGroup: 'Peito' },
  { name: 'Crucifixo Inclinado com Halteres', muscleGroup: 'Peito' },
  { name: 'Crucifixo no Crossover', muscleGroup: 'Peito' },
  { name: 'Crossover na Polia Alta', muscleGroup: 'Peito' },
  { name: 'Peck Deck', muscleGroup: 'Peito' },
  { name: 'Flexão de Braço', muscleGroup: 'Peito' },
  { name: 'Paralelas para Peito', muscleGroup: 'Peito' },

  // --- COSTAS ---
  { name: 'Puxada Frontal', muscleGroup: 'Costas' },
  { name: 'Puxada Alta Pronada', muscleGroup: 'Costas' },
  { name: 'Puxada Alta Supinada', muscleGroup: 'Costas' },
  { name: 'Remada Curvada com Barra', muscleGroup: 'Costas' },
  { name: 'Remada Baixa no Cabo', muscleGroup: 'Costas' },
  { name: 'Remada Baixa na Polia', muscleGroup: 'Costas' },
  { name: 'Remada Unilateral com Halter (Serrote)', muscleGroup: 'Costas' },
  { name: 'Remada Cavalinho', muscleGroup: 'Costas' },
  { name: 'Barra Fixa', muscleGroup: 'Costas' },
  { name: 'Pull Down na Polia Alta', muscleGroup: 'Costas' },
  { name: 'Levantamento Terra', muscleGroup: 'Costas' },

  // --- PERNAS ---
  { name: 'Agachamento Livre com Barra', muscleGroup: 'Pernas' },
  { name: 'Agachamento Búlgaro', muscleGroup: 'Pernas' },
  { name: 'Leg Press 45º', muscleGroup: 'Pernas' },
  { name: 'Cadeira Extensora', muscleGroup: 'Pernas' },
  { name: 'Mesa Flexora', muscleGroup: 'Pernas' },
  { name: 'Cadeira Flexora', muscleGroup: 'Pernas' },
  { name: 'Cadeira Adutora', muscleGroup: 'Pernas' },
  { name: 'Cadeira Abdutora', muscleGroup: 'Pernas' },
  { name: 'Elevação Pélvica', muscleGroup: 'Pernas' },
  { name: 'Stiff com Barra', muscleGroup: 'Pernas' },
  { name: 'Stiff com Halteres', muscleGroup: 'Pernas' },
  { name: 'Avanço com Halteres (Passada)', muscleGroup: 'Pernas' },
  { name: 'Panturrilha em Pé na Máquina', muscleGroup: 'Pernas' },
  { name: 'Panturrilha em Pé', muscleGroup: 'Pernas' },
  { name: 'Panturrilha Sentado (Gêmeos)', muscleGroup: 'Pernas' },
  { name: 'Gêmeos Sentado', muscleGroup: 'Pernas' },
  { name: 'Gêmeos em Pé', muscleGroup: 'Pernas' },

  // --- OMBROS ---
  { name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombros' },
  { name: 'Desenvolvimento Militar com Barra', muscleGroup: 'Ombros' },
  { name: 'Desenvolvimento Arnold com Halteres', muscleGroup: 'Ombros' },
  { name: 'Elevação Lateral com Halteres', muscleGroup: 'Ombros' },
  { name: 'Elevação Lateral na Polia', muscleGroup: 'Ombros' },
  { name: 'Elevação Frontal com Halteres', muscleGroup: 'Ombros' },
  { name: 'Elevação Frontal com Barra', muscleGroup: 'Ombros' },
  { name: 'Crucifixo Invertido', muscleGroup: 'Ombros' },
  { name: 'Encolhimento de Ombros com Halteres', muscleGroup: 'Ombros' },

  // --- BÍCEPS ---
  { name: 'Rosca Direta com Barra', muscleGroup: 'Bíceps' },
  { name: 'Rosca Alternada com Halteres', muscleGroup: 'Bíceps' },
  { name: 'Rosca Martelo com Halteres', muscleGroup: 'Bíceps' },
  { name: 'Rosca Concentrada', muscleGroup: 'Bíceps' },
  { name: 'Rosca Scott com Barra W', muscleGroup: 'Bíceps' },
  { name: 'Rosca Scott Unilateral com Halter', muscleGroup: 'Bíceps' },
  { name: 'Rosca Inversa com Barra', muscleGroup: 'Bíceps' },

  // --- TRÍCEPS ---
  { name: 'Tríceps Pulley', muscleGroup: 'Tríceps' },
  { name: 'Tríceps Corda na Polia', muscleGroup: 'Tríceps' },
  { name: 'Tríceps Testa', muscleGroup: 'Tríceps' },
  { name: 'Tríceps Testa com Barra W', muscleGroup: 'Tríceps' },
  { name: 'Tríceps Francês', muscleGroup: 'Tríceps' },
  { name: 'Tríceps Coice com Halter', muscleGroup: 'Tríceps' },
  { name: 'Mergulho em Paralelas', muscleGroup: 'Tríceps' },
  { name: 'Mergulho no Banco', muscleGroup: 'Tríceps' },

  // --- ABDÔMEN ---
  { name: 'Abdominal Supra', muscleGroup: 'Abdômen' },
  { name: 'Abdominal Supra no Solo', muscleGroup: 'Abdômen' },
  { name: 'Abdominal Infra na Barra', muscleGroup: 'Abdômen' },
  { name: 'Prancha Isométrica', muscleGroup: 'Abdômen' },
  { name: 'Elevação de Pernas', muscleGroup: 'Abdômen' },
  { name: 'Abdominal Oblíquo no Chão', muscleGroup: 'Abdômen' },
];

async function main() {
  console.log('🌱 Iniciando semeadura do Banco de Dados...');

  // 1. Criar ou Atualizar Usuário Padrão para Testes
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: { passwordHash },
    create: {
      email: 'test@example.com',
      name: 'Atleta Teste',
      passwordHash,
    },
  });
  console.log(`👤 Usuário de Teste: ${user.name} (${user.email})`);

  // 2. Semear Biblioteca de Exercícios
  console.log(`🏋️ Semando ${EXERCISES_LIBRARY.length} exercícios...`);
  let seededCount = 0;

  for (const ex of EXERCISES_LIBRARY) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
      },
    });
    seededCount++;
  }

  console.log(`✅ Semeadura concluída! Total de ${seededCount} exercícios semeados/verificados.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
