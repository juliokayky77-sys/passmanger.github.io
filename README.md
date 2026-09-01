# PassManager Pro v5.1 — envio real de e-mail

## O que foi alterado
O botão **Enviar por e-mail** não usa mais `mailto:`. Ele envia uma requisição para `POST /api/enviar-email`, e o servidor envia a mensagem usando SMTP através do Nodemailer.

## Configuração
1. Instale o Node.js.
2. Abra o terminal nesta pasta.
3. Execute `npm install`.
4. Copie `.env.example` para `.env`.
5. Preencha `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `MAIL_FROM`.
6. Execute `npm start`.
7. Abra **http://localhost:3000** no navegador.

## Teste
Acesse `http://localhost:3000/api/status`. Se `smtpConfigured` aparecer como `true`, as variáveis SMTP foram carregadas. Depois selecione um aluno, emita o passe e clique em **Enviar por e-mail**.

## Importante
O projeto não contém credenciais reais de e-mail. Você precisa configurar as credenciais SMTP do seu provedor. Para contas que usam autenticação em duas etapas, normalmente deve ser usada uma senha de aplicativo quando o provedor exigir.
