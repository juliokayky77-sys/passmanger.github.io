# Alterações v5.1

- O botão de envio de e-mail passou de `mailto:` para uma chamada ao backend.
- Adicionado servidor Express em `server/server.js`.
- Adicionado Nodemailer para envio SMTP.
- Credenciais SMTP ficam no `.env`, fora do JavaScript do navegador.
- Adicionado `/api/status` para verificar se a configuração SMTP foi carregada.
