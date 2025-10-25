# Sistema Dojo — MVP SaaS Academia de Jiu-Jitsu

### 🟢 Como usar este sistema (bem fácil!)

**O que é isso?**
Um site para academias de jiu-jitsu: alunos, **PIX**, presença com **QR**, aulas, **torneio mata-mata**, recados e mensagens.

**1) Você precisa:**

* Uma conta grátis no **Supabase** (nosso “banquinho”).
* O **Node.js** no computador.

**2) Baixar e abrir**

* Baixe o projeto e abra no **VS Code**.

**3) Ligar com o Supabase**

1. Crie um **projeto** no site do Supabase.
2. Pegue **URL** e **ANON KEY**.
3. Copie `.env.example` para `.env`.
4. Cole a URL em `NEXT_PUBLIC_SUPABASE_URL` e a ANON KEY em `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Deixe `WHATSAPP_ENABLED=false`.

**4) Instalar e rodar**

```bash
npm install
npm run db:setup
npm run dev
```

Abra **[http://localhost:3000](http://localhost:3000)**.

**5) Criar sua academia**

* Clique em **Criar conta** e entre.
* Clique em **Criar minha academia** (você vira **ADMIN**).

**6) PIX (simples)**

* Em **Configurações > Pagamentos (PIX)**, preencha sua **chave PIX**, **nome** e **cidade**.
* Na **Área do Aluno > Pagamentos**, clique em **Gerar PIX** → aparece **QR** e **copia e cola**.
* Envie o **comprovante**. O **ADMIN** confirma e pronto!

**7) Outras coisas legais**

* **Presença**: gere seu **QR** e mostre ao instrutor.
* **Agenda**: **Reserve** ou **Cancele** aulas.
* **Torneio**: veja sua próxima luta e a **chave**.
* **Graduação**: faixa atual, próximas e **histórico**.
* **Recados**: leia o que o ADMIN escreveu.

**8) Deu erro?**

* Confira o `.env`.
* Veja a mensagem no terminal.
* Volte um passo e tente de novo.
* Peça ajuda a um adulto. 🙂

---

### ⚙️ Modo avançado (para pagamento automático no futuro)

**O que é isso?**
Aqui você prepara o sistema para **Pix Dinâmico com Webhook** de um **PSP** (pago).

**Como testar de graça (sandbox):**

1. Instale o **ngrok** e rode:

   ```bash
   ngrok http 3000
   ```

   Copie a URL pública (ex.: `https://algo.ngrok.io`).
2. No `.env`, preencha:

   ```
   PIX_MODE=PROVIDER
   PIX_PROVIDER=MOCK
   PIX_ENV=sandbox
   PUBLIC_WEBHOOK_URL=https://algo.ngrok.io/api/pix/webhook
   WEBHOOK_SECRET=algum_segredo
   ```
3. Gere um pagamento e **simule** o webhook:

   ````bash
   curl -XPOST https://localhost:3000/api/pix/mock/INVOICE_ID/paid \
     -H "Authorization: Bearer $WEBHOOK_SECRET"
   ```
   ````
4. Veja no painel: a fatura muda para **PAID** automaticamente (sem comprovante).

**Quando contratar um PSP de verdade:**

* Troque `PIX_PROVIDER` para o provedor real (ex.: `GERENCIANET`)
* Coloque as chaves do provedor nas variáveis de ambiente (documentadas no provedor)
* Configure o webhook do provedor apontando para `PUBLIC_WEBHOOK_URL`
* Pronto! O sistema marcará **pago** automaticamente quando o banco avisar. 🎉

**Importante:** os provedores cobram por transação. No modo gratuito, use o fluxo com **comprovante**.
