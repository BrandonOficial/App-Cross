backend/
├── prisma/
│   ├── schema.prisma       # Definição estrutural do banco PostgreSQL
│   └── migrations/         # Histórico ACID de alterações do banco
├── src/
│   ├── common/             # Recursos transversais
│   │   ├── decorators/     # Decorators customizados (@CurrentUser)
│   │   ├── guards/         # Camada de segurança (JwtAuthGuard)
│   │   └── filters/        # Tratamento global de exceções HTTP
│   ├── config/             # Configuração do Fastify e variáveis de ambiente
│   ├── modules/            # Módulos de Domínio Independentes
│   │   ├── auth/           # Integração com Redis e emissão de JWT
│   │   ├── users/          # Gestão de perfis
│   │   ├── exercises/      # Dicionário global de movimentos
│   │   ├── routines/       # Estruturas pré-definidas
│   │   └── workouts/       # Motor de registro e volume
│   │       ├── dto/        # Objetos de transferência de dados (Zod/Class-Validator)
│   │       ├── entities/   # Regras de negócio puras
│   │       ├── workouts.controller.ts # Endpoints REST
│   │       ├── workouts.service.ts    # Lógica de cálculo e persistência
│   │       └── workouts.module.ts     # Configuração de injeção de dependência
│   ├── app.module.ts       # Módulo orquestrador raiz
│   └── main.ts             # Entry point (Bootstrap Fastify + Nest)

frontend/
├── public/                 # Assets estáticos (Manifesto PWA, Ícones)
├── src/
│   ├── assets/             # Recursos de mídia e fontes globais
│   ├── components/         # Design System (shadcn/ui + Tailwind)
│   │   ├── ui/             # Átomos (Button, Input, Card, Slider)
│   │   └── layout/         # Organismos globais (BottomNav, Header)
│   ├── config/             # Configurações globais (Axios, QueryClient)
│   ├── features/           # Domínios da Aplicação (O Core do Front)
│   │   ├── auth/           # Login e gerenciamento de sessão
│   │   ├── workouts/       # Treino ativo, logs de sets e cronômetro (Zustand)
│   │   ├── routines/       # Construtor de divisões estruturadas
│   │   └── history/        # Tabelas de progressão e gráficos (Recharts)
│   ├── hooks/              # Custom hooks (ex: useOfflineSync)
│   ├── lib/                # Utilitários puros (parsers, formatadores)
│   └── pages/              # Mapeamento do roteamento principal (MVP: 5 telas)
├── tailwind.config.js      # Tokens de design (Cores, espaçamentos, tipografia)
└── vite.config.ts          # Configurações do bundler e PWA