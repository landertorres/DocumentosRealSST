const DOCS=[["pgr","PGR"],["ltcat","LTCAT"],["pcmso","PCMSO"],["formsPsico","FORMS. PSICO"],["aep","AEP"],["aet","AET"],["li","LI"],["lp","LP"],["medicoes","MEDIÇÕES"]];
const LS="rm_documentos",$=id=>document.getElementById(id);
let dados=null;try{const s=localStorage.getItem(LS);if(s)dados=JSON.parse(s)}catch(e){}
const local=!!dados;if(!dados)dados=JSON.parse(JSON.stringify(typeof documentos!=="undefined"?documentos:[]));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const isD=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||""),hoje=()=>new Date().toISOString().slice(0,10);
const fmt=v=>isD(v)?v.split("-").reverse().join("/"):(v||"—");
const dq=(r,k)=>r[k]&&typeof r[k]==="object"?r[k]:{solicitado:!!r[k],quantidade:r[k]?1:0};
const persist=()=>{localStorage.setItem(LS,JSON.stringify(dados));aviso()};
function toast(m){const t=$("toast");t.textContent=m;t.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display="none",3200)}
function aviso(){const a=$("aviso");const l=!!localStorage.getItem(LS);a.classList.toggle("hide",!l);a.textContent="⚠ Você está vendo dados alterados neste navegador. Eles não estão no GitHub: baixe o dados.js e faça o commit para publicar."}
function st(r){const s=(r.status||"").trim().toUpperCase();if(s==="OK"||s==="CANCELADO")return s;if(isD(r.dataEntrega)&&r.dataEntrega<hoje())return"ATRASADO";return s||"PENDENTE"}
const stCls=s=>["OK","PENDENTE","ATRASADO","EM ANDAMENTO"].includes(s)?s.replace(" ","-"):"x";
const pend=r=>{const s=st(r);return !isD(r.dataEntrega)||(s!=="OK"&&s!=="CANCELADO")};
const badges=r=>DOCS.filter(([k])=>dq(r,k).solicitado).map(([k,n])=>`<span class="b ${k}">${n}${dq(r,k).quantidade>1?" ×"+dq(r,k).quantidade:""}</span>`).join("")||"—";
const totDocs=r=>DOCS.reduce((a,[k])=>a+dq(r,k).quantidade,0);
function linha(r){const s=st(r);return `<tr><td><b>${esc(r.empresa)}</b></td><td>${esc(r.cnpjCpf)}</td><td>${fmt(r.dataSolicitacao)}</td><td>${badges(r)}</td><td>${fmt(r.dataVisita)}</td><td>${fmt(r.dataEntrega)}</td><td><span class="st ${stCls(s)}">${esc(s)}</span></td><td>${esc(r.responsavel)}</td><td style="white-space:nowrap"><button class="btn sm sec" data-a="ver" data-id="${r.id}">Visualizar</button> <button class="btn sm" data-a="ed" data-id="${r.id}">Editar</button> <button class="btn sm vm" data-a="ex" data-id="${r.id}">Excluir</button></td></tr>`}
function norm(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
function filtrados(){const q=norm($("busca").value),fs=$("fSt").value,fr=$("fResp").value,fd=$("fDoc").value,t=$("fTipo").value,de=$("fDe").value,ate=$("fAte").value;
return dados.filter(r=>{if(q&&!norm([r.empresa,r.cnpjCpf,r.responsavel,r.observacao].join(" ")).includes(q))return false;
if(fs&&st(r)!==fs)return false;if(fr&&r.responsavel!==fr)return false;if(fd&&!dq(r,fd).solicitado)return false;
if(de||ate){const v=r[t];if(!isD(v)||(de&&v<de)||(ate&&v>ate))return false}return true})}
let ch={};function graf(id,tipo,labels,data,titulo){if(ch[id])ch[id].destroy();if(typeof Chart==="undefined")return;
ch[id]=new Chart($(id),{type:tipo,data:{labels,datasets:[{data,backgroundColor:["#0b4f8a","#0e7c86","#5b4bb5","#a63d8a","#c26a12","#8a6d00","#3f7d20","#557","#b23"]}]},options:{maintainAspectRatio:false,plugins:{legend:{display:tipo==="doughnut"},title:{display:true,text:titulo}}}})}
function dash(){const n=dados.length,sol=dados.reduce((a,r)=>a+totDocs(r),0),c=s=>dados.filter(r=>st(r)===s).length;
const ent=dados.filter(r=>st(r)==="OK"),entD=ent.reduce((a,r)=>a+totDocs(r),0),venc=dados.filter(r=>{const s=st(r);if(s==="OK"||s==="CANCELADO"||!isD(r.dataEntrega))return false;const d=(new Date(r.dataEntrega)-new Date(hoje()))/864e5;return d>=0&&d<=7}).length;
const it=[["Total de empresas",n,""],["Documentos solicitados",sol,""],["Entregues (registros OK)",ent.length,"ok"],["Pendentes",c("PENDENTE"),"am"],["Em andamento",c("EM ANDAMENTO"),""],["Atrasados / vencendo em 7 dias",c("ATRASADO")+" / "+venc,"vm"],["Conclusão (docs)",(sol?Math.round(entD/sol*100):0)+"%","ok"]];
$("cards").innerHTML=it.map(([l,v,c])=>`<div class="card ${c}"><b>${v}</b><span>${l}</span></div>`).join("");
graf("g1","bar",DOCS.map(d=>d[1]),DOCS.map(([k])=>dados.reduce((a,r)=>a+dq(r,k).quantidade,0)),"Documentos solicitados");
const rp={};dados.forEach(r=>{const k=r.responsavel||"—";rp[k]=(rp[k]||0)+1});graf("g2","bar",Object.keys(rp),Object.values(rp),"Registros por responsável");
const ss={};dados.forEach(r=>{const k=st(r);ss[k]=(ss[k]||0)+1});graf("g3","doughnut",Object.keys(ss),Object.values(ss),"Status")}
function selects(){const rs=[...new Set(dados.map(r=>r.responsavel).filter(Boolean))].sort(),a=$("fResp").value;
$("fResp").innerHTML='<option value="">Responsável: todos</option>'+rs.map(x=>`<option>${esc(x)}</option>`).join("");$("fResp").value=a;
if(!$("fDoc").options.length)$("fDoc").innerHTML='<option value="">Documento: todos</option>'+DOCS.map(([k,n])=>`<option value="${k}">${n}</option>`).join("")}
function render(){selects();const f=filtrados();$("tb").innerHTML=f.map(linha).join("")||'<tr><td colspan="9" class="mu">Nenhum registro encontrado. Use "Importar Planilha" ou "Novo Registro".</td></tr>';
$("tbp").innerHTML=dados.filter(pend).map(linha).join("")||'<tr><td colspan="9" class="mu">Sem pendências.</td></tr>';dash();rel()}
function ver(id){const r=dados.find(x=>x.id==id);$("vB").innerHTML=`<h2>${esc(r.empresa)}</h2><div class="g"><div><b>CNPJ / CPF</b><br>${esc(r.cnpjCpf)||"—"}</div><div><b>Responsável</b><br>${esc(r.responsavel)||"—"}</div><div><b>Solicitação</b><br>${fmt(r.dataSolicitacao)}</div><div><b>Visita</b><br>${fmt(r.dataVisita)}</div><div><b>Entrega</b><br>${fmt(r.dataEntrega)}</div><div><b>Status</b><br>${esc(st(r))}</div><div class="w"><b>Documentos</b><br>${badges(r)}</div><div class="w"><b>Observações</b><br>${esc(r.observacao)||"—"}</div></div><p style="text-align:right"><button class="btn" onclick="$('dlgV').close()">Fechar</button></p>`;$("dlgV").showModal()}
let edId=null;
function form(id){edId=id;const r=id?dados.find(x=>x.id==id):{};$("fT").textContent=id?"Editar registro":"Novo registro";
const c=(n,l,v,t="text",x="")=>`<label class="${x}">${l}<input name="${n}" type="${t}" value="${esc(v??"")}"></label>`;
$("fG").innerHTML=c("empresa","Empresa contratante *",r.empresa,"text","w")+c("cnpjCpf","CNPJ / CPF",r.cnpjCpf)+c("medicina","Medicina",r.medicina||"REAL")+c("dataSolicitacao","Data da solicitação",r.dataSolicitacao,"date")+DOCS.map(([k,n])=>c(k,n+" (quantidade; 0 = não solicitado)",id?dq(r,k).quantidade:0,"number")).join("")+
`<label>Data da visita (data ou texto, ex.: EMISSÃO)<input name="dataVisita" value="${esc(r.dataVisita||"")}"></label>`+c("dataEntrega","Data da entrega",r.dataEntrega,"date")+`<label>Status<input name="status" list="stl" value="${esc(r.status||"PENDENTE")}"><datalist id="stl"><option>OK<option>PENDENTE<option>EM ANDAMENTO<option>ATRASADO<option>CANCELADO</datalist></label>`+
`<label>Responsável<input name="responsavel" list="rl" value="${esc(r.responsavel||"")}"><datalist id="rl">${[...new Set(dados.map(x=>x.responsavel).filter(Boolean))].map(x=>`<option>${esc(x)}`).join("")}</datalist></label><label class="w">Observação<textarea name="observacao" rows="3">${esc(r.observacao||"")}</textarea></label>`;
$("dlgF").showModal()}
$("form").onsubmit=e=>{e.preventDefault();const f=new FormData($("form")),v=k=>(f.get(k)||"").toString().trim();
if(!v("empresa")){toast("✕ Informe a empresa contratante.");return}
const o={id:edId||Math.max(0,...dados.map(x=>x.id))+1,medicina:v("medicina"),empresa:v("empresa"),cnpjCpf:v("cnpjCpf"),dataSolicitacao:v("dataSolicitacao")};
DOCS.forEach(([k])=>{const q=Math.max(0,parseInt(v(k))||0);o[k]={solicitado:q>0,quantidade:q}});
Object.assign(o,{dataVisita:v("dataVisita"),dataEntrega:v("dataEntrega"),status:v("status").toUpperCase(),responsavel:v("responsavel").toUpperCase(),observacao:v("observacao")});
if(edId)dados[dados.findIndex(x=>x.id==edId)]=o;else dados.push(o);persist();render();$("dlgF").close();toast("✓ Registro salvo com sucesso.")};
function acao(e){const b=e.target.closest("[data-a]");if(!b)return;const id=b.dataset.id;
if(b.dataset.a==="ver")ver(id);if(b.dataset.a==="ed")form(id);
if(b.dataset.a==="ex"&&confirm("Tem certeza que deseja excluir este registro?")){dados=dados.filter(x=>x.id!=id);persist();render();toast("✓ Registro excluído.")}}
$("tb").onclick=acao;$("tbp").onclick=acao;
function baixar(nome,txt,tipo){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:tipo}));a.download=nome;a.click();URL.revokeObjectURL(a.href)}
const gerarJs=()=>`const documentos = ${JSON.stringify(dados,null,4)};\n\nif (typeof module !== "undefined") {\n    module.exports = documentos;\n}\n`;
function csv(cab,linhas){const q=v=>'"'+String(v??"").replace(/"/g,'""')+'"';return "\ufeff"+[cab,...linhas].map(l=>l.map(q).join(";")).join("\r\n")}
const csvRegs=rs=>csv(["Medicina","Empresa","CNPJ/CPF","Solicitação",...DOCS.map(d=>d[1]),"Visita","Entrega","Status","Responsável","Observação"],rs.map(r=>[r.medicina,r.empresa,r.cnpjCpf,fmt(r.dataSolicitacao),...DOCS.map(([k])=>dq(r,k).quantidade||""),fmt(r.dataVisita),fmt(r.dataEntrega),st(r),r.responsavel,r.observacao]));
const exportJs=()=>{baixar("dados.js",gerarJs(),"text/javascript");toast("✓ dados.js gerado com sucesso.")};
$("expjs").onclick=exportJs;$("bJs").onclick=exportJs;
$("bJson").onclick=()=>{baixar(`backup-documentos-${hoje()}.json`,JSON.stringify(dados,null,2),"application/json");toast("✓ Backup criado.")};
$("bCsv").onclick=()=>{baixar(`backup-documentos-${hoje()}.csv`,csvRegs(dados),"text/csv");toast("✓ Backup criado.")};
$("bDesc").onclick=()=>{if(confirm("Descartar alterações locais e voltar ao dados.js publicado?")){localStorage.removeItem(LS);location.reload()}};
function rel(){const t=$("relT").value,H=$("relH"),B=$("relB");let cab,ls;
if(t==="empresa"){cab=["Empresa","CNPJ/CPF","Documentos solicitados","Status","Responsável"];ls=dados.map(r=>[r.empresa,r.cnpjCpf,totDocs(r),st(r),r.responsavel])}
else if(t==="pendencias"){cab=["Empresa","Entrega","Status","Responsável"];ls=dados.filter(pend).map(r=>[r.empresa,fmt(r.dataEntrega),st(r),r.responsavel])}
else if(t==="documento"){cab=["Documento","Empresas","Quantidade total"];ls=DOCS.map(([k,n])=>[n,dados.filter(r=>dq(r,k).solicitado).length,dados.reduce((a,r)=>a+dq(r,k).quantidade,0)])}
else{const key=t==="status"?st:r=>r.responsavel||"—",m={};dados.forEach(r=>{const g=key(r);m[g]=m[g]||[0,0];m[g][0]++;m[g][1]+=totDocs(r)});cab=[t==="status"?"Status":"Responsável","Registros","Documentos"];ls=Object.entries(m).map(([g,[a,b]])=>[g,a,b])}
rel.cab=cab;rel.ls=ls;H.innerHTML="<tr>"+cab.map(c=>`<th>${c}</th>`).join("")+"</tr>";B.innerHTML=ls.map(l=>"<tr>"+l.map(c=>`<td>${esc(c)}</td>`).join("")+"</tr>").join("")}
$("relT").onchange=rel;$("relCsv").onclick=()=>{baixar(`relatorio-${$("relT").value}-${hoje()}.csv`,csv(rel.cab,rel.ls),"text/csv");toast("✓ Relatório exportado.")};
["busca","fSt","fResp","fDoc","fTipo","fDe","fAte"].forEach(i=>$(i).addEventListener("input",()=>{$("tb").innerHTML=filtrados().map(linha).join("")||'<tr><td colspan="9" class="mu">Nenhum registro encontrado.</td></tr>'}));
$("limpar").onclick=()=>{["busca","fSt","fResp","fDoc","fDe","fAte"].forEach(i=>$(i).value="");render()};
$("novo").onclick=()=>form(null);$("fC").onclick=()=>$("dlgF").close();
document.querySelectorAll("nav a[data-v]").forEach(a=>a.onclick=e=>{e.preventDefault();["home","pend","rel","cfg"].forEach(v=>$("v-"+v).classList.toggle("hide",v!==a.dataset.v));document.querySelectorAll("nav a").forEach(x=>x.classList.remove("on"));a.classList.add("on");if(a.dataset.go)$(a.dataset.go).scrollIntoView({behavior:"smooth"});else scrollTo(0,0)});
aviso();render();
