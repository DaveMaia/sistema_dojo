# Manual de Implementação — Sistema Dojo (Docker Compose Local)

## 1) Objetivo
Este manual descreve o passo a passo para **subir, validar e operar** o Sistema Dojo
em ambiente local usando **Docker Compose**, evitando erros de operação comuns.

## 2) Pré-requisitos
- Docker Desktop (ou Docker Engine + Docker Compose)
- Portas livres: **3000**, **8000**, **54322**

## 3) Checklist rápido de implantação
1. `docker compose up --build`
2. Acessar **http://localhost:3000**
3. Validar API Supabase em **http://localhost:8000**
4. Confirmar acesso ao Postgres em **localhost:54322** (user: `postgres`, pass: `postgres`)

## 4) Estrutura dos serviços
- **db**: PostgreSQL local (porta 54322)
- **auth**: Supabase GoTrue
- **rest**: PostgREST
- **realtime**: Supabase Realtime
- **storage**: Supabase Storage API
- **kong**: Gateway (porta 8000)
- **app**: Next.js (porta 3000)

## 5) Como subir do zero
```bash
docker compose up --build
```

O Postgres executará automaticamente as migrações em:
- `supabase/migrations/*`

## 6) Fluxo de validação pós-subida
1. **Abrir o app** em http://localhost:3000
2. **Validar requisições** do app ao Supabase (Kong):
   - verifique se chamadas não estão bloqueadas por CORS
3. **Criar conta e academia** no app
4. **Validar módulos**:
   - Admin: dashboard e tabela de alunos
   - Professor: scanner de presença e badges
   - Aluno: abas e fluxo de pagamentos

## 7) Variáveis de ambiente (Docker)
Usadas pelo `docker-compose.yml`:
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Arquivo padrão: `.env.docker`.

### Importante
- **O browser deve acessar o Supabase via** `http://localhost:8000`.
- **O server (Next.js no container) deve acessar o Supabase via** `http://kong:8000`.

Essas URLs já estão configuradas no `docker-compose.yml`.

## 8) Operação e manutenção
### Subir em background
```bash
docker compose up -d
```

### Parar
```bash
docker compose down
```

### Limpar dados (cuidado: apaga o banco)
```bash
docker compose down -v
```

## 9) Erros comuns e solução rápida
### A) App sobe mas não conecta no Supabase
- Verifique se o serviço **kong** está ativo.
- Confirme variáveis `SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_URL` no compose.

### B) Migrações não aplicadas
- O volume do Postgres pode já existir com banco antigo.
- Rode:
  ```bash
  docker compose down -v
  docker compose up --build
  ```

### C) Porta já em uso
- Altere as portas no `docker-compose.yml`.
- Reinicie o Docker.

## 10) Roteiro de deploy local seguro (checklist)
- [ ] `docker compose up --build` sem erros
- [ ] App abre em `http://localhost:3000`
- [ ] API Supabase responde em `http://localhost:8000`
- [ ] Migrações executadas (tabelas novas presentes)
- [ ] Fluxos críticos testados: login, cadastro, presença, pagamentos

## 11) Quando abrir chamados internos
Se ocorrer erro não documentado:
- Copie logs de `docker compose logs -f`.
- Anexe o erro completo do console.
- Informe o endpoint e a ação que falhou.

---

**Contato interno**: equipe de plataforma / engenharia.
