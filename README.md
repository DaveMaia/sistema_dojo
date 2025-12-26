# Sistema Dojo — SaaS para Academias de Jiu-Jitsu (Stack Local com Docker)

## Visão geral
Plataforma para academias com alunos, **PIX**, presença por **QR**, agenda de aulas,
**torneios**, recados, dashboards administrativos e módulos de professor/aluno.

Este repositório está configurado para rodar **100% local** com **Docker Compose**,
incluindo banco PostgreSQL e serviços Supabase (Auth, REST, Realtime, Storage) atrás do Kong.

## 🧱 Stack local (recomendada)
**Pré-requisitos**
- Docker + Docker Compose

**Subir tudo com um comando**
```bash
docker compose up --build
```

**Acessos**
- App: http://localhost:3000
- API Supabase (Kong): http://localhost:8000
- Postgres: localhost:54322 (user: postgres / pass: postgres)

> As migrações SQL em `supabase/migrations` são aplicadas automaticamente no boot do Postgres.

## 🧪 Desenvolvimento sem Docker (opcional)
Se preferir rodar só o app localmente com Node:

```bash
npm install
npm run dev
```

Você precisará de um Supabase acessível e variáveis em `.env` compatíveis.

## 🔑 Variáveis de ambiente
Para Docker, usamos `.env.docker` (já fornecido).
Para rodar fora do Docker, copie `.env.example` para `.env` e configure:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📦 O que já está incluído
- **Dashboard Admin** com indicadores (MRR, churn, inadimplência).
- **Módulo do Professor** (scanner de presença, radar do aluno, badges e torneios).
- **Experiência do Aluno** (navegação mobile-first, pagamentos, perfil social).
- **Modelagens DB** para pagamentos com metadados, CRM de visitantes, badges e stats do aluno.

## 📚 Manual de implementação
Consulte o guia completo de implantação e operação no arquivo:
**[`MANUAL_IMPLEMENTACAO.md`](./MANUAL_IMPLEMENTACAO.md)**.
