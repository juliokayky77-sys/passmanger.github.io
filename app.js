const STORAGE_STUDENTS = 'pmpro_students_v5';
const STORAGE_PASSES = 'pmpro_passes_v5';
const ADMIN_PASSWORD = 'PMPro@2026';

let students = [];
let passes = [];
let selectedStudentId = null;
let editingStudentId = null;

const initialStudents = [
  {id:'1',nome:'Ana Beatriz Silva',cpf:'111.111.111-11',matricula:'2026001',curso:'Administração',serie:'1º A',email:'ana@example.com',contraturno:'nao'},
  {id:'2',nome:'Bruno Henrique Souza',cpf:'222.222.222-22',matricula:'2026002',curso:'Informática',serie:'1º A',email:'bruno@example.com',contraturno:'sim'},
  {id:'3',nome:'Carla Mendes Oliveira',cpf:'333.333.333-33',matricula:'2026003',curso:'Administração',serie:'1º B',email:'carla@example.com',contraturno:'nao'}
];

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
function normalize(v){ return String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); }
function escapeHtml(v){ return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function loadData(){
  try { students=JSON.parse(localStorage.getItem(STORAGE_STUDENTS)||'null') || initialStudents; } catch { students=initialStudents; }
  try { passes=JSON.parse(localStorage.getItem(STORAGE_PASSES)||'[]'); } catch { passes=[]; }
  saveData(); renderStudents(); renderAdmin();
}
function saveData(){ localStorage.setItem(STORAGE_STUDENTS,JSON.stringify(students)); localStorage.setItem(STORAGE_PASSES,JSON.stringify(passes)); }
function switchTab(id,btn){ document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); document.getElementById(id)?.classList.add('active'); document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active')); btn?.classList.add('active'); if(id==='adminTab') renderAdmin(); }

function filterStudents(){ renderStudents(); }
function searchStudents(event){
  if(event && event.key && event.key!=='Enter') return;
  renderStudents();
}
function renderStudents(){
  const body=document.getElementById('studentBody'); if(!body)return;
  const q=normalize(document.getElementById('studentSearch')?.value);
  const found=students.filter(s=>!q || [s.nome,s.cpf,s.matricula,s.email,s.curso,s.serie].some(v=>normalize(v).includes(q)));
  body.innerHTML=found.map(s=>`<tr class="${selectedStudentId===s.id?'selected-row':''}">
    <td><strong>${escapeHtml(s.nome)}</strong><br><small>${escapeHtml(s.cpf)}</small></td><td>${escapeHtml(s.matricula)}</td><td>${escapeHtml(s.curso)} / ${escapeHtml(s.serie)}</td><td>${escapeHtml(s.email)}</td><td>${s.contraturno==='sim'?'Sim — até 2':'Não — 1'}</td>
    <td class="actions"><button class="btn primary small" onclick="selectStudent('${s.id}')">Selecionar</button><button class="btn ghost small" onclick="editStudent('${s.id}')">Editar</button><button class="btn danger small" onclick="deleteStudent('${s.id}')">Excluir</button></td></tr>`).join('') || `<tr><td colspan="6" style="text-align:center;padding:24px">Nenhum aluno encontrado.</td></tr>`;
}
function selectStudent(id){ selectedStudentId=id; renderStudents(); showStudentPanel(students.find(s=>s.id===id)); }
function showStudentPanel(s){
  if(!s)return; let panel=document.getElementById('selectedStudentPanel');
  if(!panel){ panel=document.createElement('div'); panel.id='selectedStudentPanel'; panel.className='card'; document.querySelector('#alunoTab').appendChild(panel); }
  const history=passes.filter(p=>p.studentId===s.id);
  panel.innerHTML=`<div class="title"><h3>🎓 Aluno selecionado</h3><span class="badge">${escapeHtml(s.matricula)}</span></div>
  <div class="selected-info"><div><b>${escapeHtml(s.nome)}</b><br>${escapeHtml(s.curso)} · ${escapeHtml(s.serie)}<br>${escapeHtml(s.email)}</div><div><b>CPF:</b> ${escapeHtml(s.cpf)}<br><b>Contraturno:</b> ${s.contraturno==='sim'?'Sim (até 2 passes)':'Não (1 passe)'}</div></div>
  <div class="actions"><button class="btn success" onclick="issuePass('${s.id}')">🎟️ Emitir passe</button><button class="btn ghost" onclick="editStudent('${s.id}')">Editar cadastro</button></div>
  <div class="history"><h4>Histórico de passes</h4>${history.length?history.map(p=>`<div class="history-row"><span>${new Date(p.createdAt).toLocaleString('pt-BR')}</span><b>${escapeHtml(p.code)}</b><span class="badge ${p.status==='ATIVA'?'ok':'off'}">${p.status}</span>${p.status==='ATIVA'?`<button class="btn danger small" onclick="revokePass('${p.id}')">Revogar</button>`:`<button class="btn ghost small" onclick="reactivatePass('${p.id}')">Reativar</button>`}</div>`).join(''):'<p class="notice">Nenhum passe emitido para este aluno.</p>'}</div>`;
  panel.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function maxPasses(s){ return s.contraturno==='sim'?2:1; }
function activeCount(sid){ return passes.filter(p=>p.studentId===sid&&p.status==='ATIVA').length; }
function issuePass(id){ const s=students.find(x=>x.id===id); if(!s)return; if(activeCount(id)>=maxPasses(s)){alert(`Limite de passes ativos atingido: ${maxPasses(s)}.`);return;} const p={id:uid(),studentId:id,code:'PM-'+Date.now().toString(36).toUpperCase(),status:'ATIVA',createdAt:new Date().toISOString()}; passes.unshift(p); saveData(); showPass(s,p); showStudentPanel(s); renderAdmin(); }
function showPass(s,p){ document.getElementById('fNome').textContent=s.nome; document.getElementById('fMatricula').textContent=s.matricula; document.getElementById('fSerie').textContent=s.serie; document.getElementById('fCodigo').textContent=p.code; const qr=document.getElementById('qr'); qr.innerHTML=''; if(window.QRCode)new QRCode(qr,{text:JSON.stringify({code:p.code,matricula:s.matricula,nome:s.nome}),width:180,height:180}); document.getElementById('ficha').style.display='block'; document.getElementById('ficha').scrollIntoView({behavior:'smooth'}); }
function closePass(){document.getElementById('ficha').style.display='none';}
async function emailPass(){
  const s=students.find(x=>x.id===selectedStudentId);
  const code=document.getElementById('fCodigo').textContent;
  if(!s)return alert('Selecione um aluno primeiro.');
  if(!s.email)return alert('Este aluno não possui e-mail cadastrado.');
  const btn=[...document.querySelectorAll('.pass-actions button')].find(b=>b.textContent.includes('Enviar por e-mail'));
  if(btn){btn.disabled=true;btn.textContent='⏳ Enviando...';}
  try{
    const response=await fetch('/api/enviar-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({student:s,pass:{code,createdAt:new Date().toISOString()}})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||'Falha no envio');
    alert(result.message||'E-mail enviado com sucesso.');
  }catch(err){
    alert('Não foi possível enviar o e-mail. Verifique a configuração SMTP e se o servidor está em execução.\n\n'+err.message);
  }finally{
    if(btn){btn.disabled=false;btn.textContent='✉ Enviar por e-mail';}
  }
}
function revokePass(id){const p=passes.find(x=>x.id===id);if(p){p.status='INVALIDA';saveData();renderAdmin();if(selectedStudentId)showStudentPanel(students.find(s=>s.id===selectedStudentId));}}
function reactivatePass(id){const p=passes.find(x=>x.id===id),s=p&&students.find(x=>x.id===p.studentId);if(p&&s&&activeCount(s.id)<maxPasses(s)){p.status='ATIVA';saveData();renderAdmin();showStudentPanel(s);}else alert('O limite de passes ativos deste aluno já foi atingido.');}

function submitStudent(e){e.preventDefault();const data={nome:nome.value.trim(),cpf:cpf.value.trim(),matricula:matricula.value.trim(),curso:curso.value.trim(),serie:serie.value.trim(),email:email.value.trim(),contraturno:contraturno.value};if(editingStudentId){Object.assign(students.find(s=>s.id===editingStudentId),data);}else{students.push({id:uid(),...data});}saveData();resetForm();renderStudents();}
function editStudent(id){const s=students.find(x=>x.id===id);if(!s)return;editingStudentId=id;['nome','cpf','matricula','curso','serie','email','contraturno'].forEach(k=>document.getElementById(k).value=s[k]||'');document.getElementById('saveStudent').textContent='💾 Atualizar aluno';document.getElementById('cancelEdit').style.display='inline-flex';document.getElementById('studentForm').scrollIntoView({behavior:'smooth'});}
function resetForm(){editingStudentId=null;document.getElementById('studentForm').reset();document.getElementById('contraturno').value='nao';document.getElementById('saveStudent').textContent='💾 Salvar aluno';document.getElementById('cancelEdit').style.display='none';}
function deleteStudent(id){if(!confirm('Excluir este aluno?'))return;students=students.filter(s=>s.id!==id);passes=passes.filter(p=>p.studentId!==id);if(selectedStudentId===id)selectedStudentId=null;saveData();renderStudents();renderAdmin();document.getElementById('selectedStudentPanel')?.remove();}

function importJSON(event){const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{let raw=JSON.parse(reader.result);let arr=Array.isArray(raw)?raw:(raw.alunos||raw.students||raw.data||[]);if(!Array.isArray(arr)||!arr.length)throw Error('O JSON não contém uma lista de alunos.');const imported=arr.map((x,i)=>({id:String(x.id||x.ID||x.matricula||uid()+'-'+i),nome:x.nome??x.name??x.Nome??'',cpf:x.cpf??x.CPF??'',matricula:String(x.matricula??x.Matricula??x.registration??''),curso:x.curso??x.Curso??'',serie:x.serie??x['Série']??x.turma??x.Turma??'',email:x.email??x.Email??'',contraturno:String(x.contraturno??x.Contraturno??'nao').toLowerCase().startsWith('s')?'sim':'nao'}));const valid=imported.filter(x=>x.nome||x.matricula);
let added=0,updated=0;
valid.forEach(item=>{
  const keyMatricula=normalize(item.matricula), keyId=String(item.id||'');
  const existing=students.find(s=>(keyMatricula && normalize(s.matricula)===keyMatricula)||(keyId && String(s.id)===keyId));
  if(existing){Object.assign(existing,item);updated++;}else{students.push(item);added++;}
});
selectedStudentId=null;saveData();document.getElementById('studentSearch').value='';renderStudents();document.getElementById('selectedStudentPanel')?.remove();alert(`${valid.length} aluno(s) processado(s): ${added} adicionado(s) e ${updated} atualizado(s).`);}catch(err){alert('Erro ao importar JSON: '+err.message);}event.target.value='';};reader.readAsText(file,'UTF-8');}
function resetData(){if(!confirm('Restaurar os dados iniciais? Isso substituirá os alunos atuais e limpará os passes.'))return;students=[...initialStudents];passes=[];selectedStudentId=null;saveData();renderStudents();renderAdmin();document.getElementById('selectedStudentPanel')?.remove();}

function login(){if(document.getElementById('adminPassword').value===ADMIN_PASSWORD){document.getElementById('adminAuth').style.display='none';document.getElementById('dashboard').style.display='block';renderAdmin();}else alert('Senha incorreta.');}
function logout(){document.getElementById('adminAuth').style.display='block';document.getElementById('dashboard').style.display='none';}
function renderAdmin(){const body=document.getElementById('passBody');if(!body)return;const status=document.getElementById('statusFilter')?.value||'todos',q=normalize(document.getElementById('passSearch')?.value),date=document.getElementById('dateFilter')?.value||'';const list=passes.filter(p=>{const s=students.find(x=>x.id===p.studentId)||{};return(status==='todos'||p.status===status)&&(!date||p.createdAt.slice(0,10)===date)&&(!q||[s.nome,s.matricula,p.code].some(v=>normalize(v).includes(q)));});body.innerHTML=list.map(p=>{const s=students.find(x=>x.id===p.studentId)||{};return `<tr><td>${new Date(p.createdAt).toLocaleString('pt-BR')}</td><td>${escapeHtml(s.nome)}</td><td>${escapeHtml(s.matricula)}</td><td>${escapeHtml(p.code)}</td><td><span class="badge ${p.status==='ATIVA'?'ok':'off'}">${p.status}</span></td><td>${p.status==='ATIVA'?`<button class="btn danger small" onclick="revokePass('${p.id}')">Revogar</button>`:`<button class="btn ghost small" onclick="reactivatePass('${p.id}')">Reativar</button>`}</td></tr>`}).join('')||'<tr><td colspan="6" style="text-align:center;padding:24px">Nenhum registro.</td></tr>';const stats=document.getElementById('stats');if(stats)stats.innerHTML=`<div class="stat"><b>${students.length}</b><span>Alunos</span></div><div class="stat"><b>${passes.filter(p=>p.status==='ATIVA').length}</b><span>Passes ativos</span></div><div class="stat"><b>${passes.length}</b><span>Total de passes</span></div>`;}
function clearFilters(){document.getElementById('statusFilter').value='todos';document.getElementById('dateFilter').value='';document.getElementById('passSearch').value='';renderAdmin();}
function exportFile(name,text,type='application/json'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href);}
function exportStudentsJSON(){exportFile('alunos.json',JSON.stringify(students,null,2));}
function exportPassesJSON(){exportFile('passes.json',JSON.stringify(passes,null,2));}
function csv(rows){if(!rows.length)return '';const keys=Object.keys(rows[0]);return [keys.join(';'),...rows.map(r=>keys.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(';'))].join('\n');}
function exportStudentsCSV(){exportFile('alunos.csv','\ufeff'+csv(students),'text/csv;charset=utf-8');}
function exportPassesCSV(){exportFile('passes.csv','\ufeff'+csv(passes),'text/csv;charset=utf-8');}

document.addEventListener('DOMContentLoaded',()=>{document.getElementById('year').textContent=new Date().getFullYear();loadData();});
