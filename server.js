const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use(express.json({limit:'1mb'}));
app.use(express.static(path.join(__dirname, '..')));

function transporter(){
  const {SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS} = process.env;
  if(!SMTP_HOST || !SMTP_USER || !SMTP_PASS){
    throw new Error('SMTP não configurado. Preencha SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS no arquivo .env.');
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT || 587) === 465,
    auth: {user: SMTP_USER, pass: SMTP_PASS}
  });
}

app.post('/api/enviar-email', async (req,res)=>{
  try{
    const {student, pass} = req.body || {};
    if(!student?.email) return res.status(400).json({error:'E-mail do aluno não informado.'});
    if(!pass?.code) return res.status(400).json({error:'Código do passe não informado.'});
    const mail = transporter();
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    const date = pass.createdAt ? new Date(pass.createdAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
    await mail.sendMail({
      from,
      to: student.email,
      subject: `Passe de intervalo — ${student.nome}`,
      text: `Olá, ${student.nome}!\n\nSeu passe de intervalo foi emitido.\n\nMatrícula: ${student.matricula}\nCódigo: ${pass.code}\nData: ${date}\n\nApresente o QR Code disponível no sistema para validação.`,
      html: `<h2>Passe de intervalo</h2><p>Olá, <strong>${esc(student.nome)}</strong>!</p><p>Seu passe de intervalo foi emitido.</p><p><strong>Matrícula:</strong> ${esc(student.matricula)}<br><strong>Código:</strong> ${esc(pass.code)}<br><strong>Data:</strong> ${esc(date)}</p><p>Apresente o QR Code disponível no sistema para validação.</p>`
    });
    res.json({message:`E-mail enviado para ${student.email}.`});
  }catch(error){
    console.error('[email]',error);
    res.status(500).json({error:error.message || 'Erro interno ao enviar e-mail.'});
  }
});

app.get('/api/status', (req,res)=>res.json({ok:true,smtpConfigured:Boolean(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASS)}));
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
app.listen(PORT,()=>console.log(`PassManager Pro: http://localhost:${PORT}`));
