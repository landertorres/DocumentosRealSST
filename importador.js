const $=id=>document.getElementById(id),LS="rm_documentos";
const DOCS=[["pgr","PGR"],["ltcat","LTCAT"],["pcmso","PCMSO"],["formsPsico","FORMS. PSICO"],["aep","AEP"],["aet","AET"],["li","LI"],["lp","LP"],["medicoes","MEDIÇÕES"]];
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z0-9]+/g," ").trim();
const AL={"MEDICINA":"medicina","EMPRESA":"empresa","EMPRESA CONTRATANTE":"empresa","CNPJ CPF":"cnpjCpf","CNPJ":"cnpjCpf","CPF":"cnpjCpf","DATA SOLICITACAO":"dataSolicitacao","DATA DA SOLICITACAO":"dataSolicitacao","PGR":"pgr","LTCAT":"ltcat","PCMSO":"pcmso","FORMS PSICO":"formsPsico","FORM PSICO":"formsPsico","FORMS PSICOSSOCIAL":"formsPsico","AEP":"aep","AET":"aet","LI":"li","LP":"lp","MEDICOES":"medicoes","MEDICAO":"medicoes","DATA DA VISITA":"dataVisita","DATA VISITA":"dataVisita","DATA DA ENTREGA":"dataEntrega","DATA ENTREGA":"dataEntrega","STATUS":"status","RESPONSAVEL":"responsavel","OBSERVACAO":"observacao","OBSERVACOES":"observacao"};
const STS=["OK","PENDENTE","EM ANDAMENTO","ATRASADO","CANCELADO"];
const txt=v=>String(v??"").replace(/\s+/g," ").trim(),p2=n=>String(n).padStart(2,"0");
function data(v){if(v===""||v==null)return"";
if(v instanceof Date)return `${v.getFullYear()}-${p2(v.getMonth()+1)}-${p2(v.getDate())}`;
if(typeof v==="number"){const d=XLSX.SSF.parse_date_code(v);return d?`${d.y}-${p2(d.m)}-${p2(d.d)}`:String(v)}
const s=txt(v);let m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
if(m){const y=m[3].length===2?"20"+m[3]:m[3];return `${y}-${p2(m[2])}-${p2(m[1])}`}
m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?`${m[1]}-${m[2]}-${m[3]}`:s}
function doc(v){if(typeof v==="number")return v>0?{solicitado:true,quantidade:v}:{solicitado:false,quantidade:0};
const s=txt(v);if(!s)return{solicitado:false,quantidade:0};if(/^\d+([.,]\d+)?$/.test(s)){const n=parseFloat(s.replace(",","."));return n>0?{solicitado:true,quantidade:n}:{solicitado:false,quantidade:0}}
return{solicitado:true,quantidade:1}}
function lerAba(ws){const L=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:""});let h=-1,map={};
for(let i=0;i<Math.min(L.length,25);i++){const m={};L[i].forEach((c,j)=>{const k=AL[norm(c)];if(k&&!(k in m))m[k]=j});if(Object.keys(m).length>=3&&m.empresa!==undefined){h=i;map=m;break}}
return h<0?null:{L,h,map}}
function converter(wb){let best=null;wb.SheetNames.forEach(n=>{const r=lerAba(wb.Sheets[n]);if(r&&(!best||Object.keys(r.map).length>Object.keys(best.map).length))best={...r,nome:n}});
if(!best)throw new Error("Não encontrei a linha de cabeçalho com a coluna EMPRESA.");
const {L,h,map}=best,g=(row,k)=>map[k]===undefined?"":row[map[k]],regs=[],ign=[];
for(let i=h+1;i<L.length;i++){const row=L[i],emp=txt(g(row,"empresa"));if(!emp)continue;if(/^TOTAL\b/.test(norm(emp))){ign.push(emp);continue}
const r={id:regs.length+1,medicina:txt(g(row,"medicina")),empresa:emp,cnpjCpf:txt(g(row,"cnpjCpf")),dataSolicitacao:data(g(row,"dataSolicitacao"))};
DOCS.forEach(([k])=>r[k]=doc(g(row,k)));
r.dataVisita=data(g(row,"dataVisita"));r.dataEntrega=data(g(row,"dataEntrega"));
const s=txt(g(row,"status")).toUpperCase();r.status=STS.includes(s)?s:s;r.responsavel=txt(g(row,"responsavel")).toUpperCase();r.observacao=txt(g(row,"observacao"));regs.push(r)}
return{regs,aba:best.nome,ign}}
const gerarJs=d=>`const documentos = ${JSON.stringify(d,null,4)};\n\nif (typeof module !== "undefined") {\n    module.exports = documentos;\n}\n`;
function msg(t,c){$("msg").innerHTML=`<div class="msg ${c}">${t}</div>`}
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let atual=null,nome="";
function previa(regs,aba,ign=[]){atual=regs;const seen={},dups=[];
regs.forEach(r=>{const k=r.cnpjCpf.replace(/\D/g,"")+"|"+norm(r.empresa)+"|"+r.dataSolicitacao;(seen[k]=seen[k]||[]).push(r)});
Object.values(seen).forEach(a=>{if(a.length>1)dups.push(...a)});
$("info").textContent=`Arquivo: ${nome} — aba "${aba}" — Registros encontrados: ${regs.length}`;
$("dup").innerHTML=(ign.length?`<div class="msg wa">⚠ ${ign.length} linha(s) de totais foram ignoradas (não são empresas): ${ign.map(esc).join("; ")}</div>`:"")+(dups.length?`<div class="msg wa">⚠ Foram encontrados ${dups.length} registros potencialmente duplicados (CNPJ/CPF + empresa + data da solicitação):<br>${dups.map(r=>esc(r.empresa)+" ("+esc(r.dataSolicitacao||"sem data")+")").join("<br>")}</div>`:"");
$("ph").innerHTML="<tr><th>Empresa</th><th>CNPJ/CPF</th>"+DOCS.map(d=>`<th>${d[1]}</th>`).join("")+"<th>Entrega</th><th>Status</th><th>Responsável</th></tr>";
$("pb").innerHTML=regs.map(r=>`<tr><td>${esc(r.empresa)}</td><td>${esc(r.cnpjCpf)}</td>`+DOCS.map(([k])=>`<td>${r[k].solicitado?"✓"+(r[k].quantidade>1?" ("+r[k].quantidade+")":""):"—"}</td>`).join("")+`<td>${esc(r.dataEntrega)}</td><td>${esc(r.status)}</td><td>${esc(r.responsavel)}</td></tr>`).join("");
$("prev").classList.remove("hide");$("saida").classList.add("hide")}
function arquivo(f){if(!f)return;nome=f.name;const fr=new FileReader();
fr.onload=e=>{try{const wb=XLSX.read(new Uint8Array(e.target.result),{type:"array"});const{regs,aba,ign}=converter(wb);
if(!regs.length)throw new Error("Nenhum registro com empresa foi encontrado.");$("msg").innerHTML="";previa(regs,aba,ign)}catch(er){$("prev").classList.add("hide");msg("✕ Não foi possível ler a planilha. "+esc(er.message),"er")}};
fr.readAsArrayBuffer(f)}
$("arq").onchange=e=>arquivo(e.target.files[0]);
const dr=$("drop");["dragover","dragenter"].forEach(t=>dr.addEventListener(t,e=>{e.preventDefault();dr.classList.add("over")}));
["dragleave","drop"].forEach(t=>dr.addEventListener(t,e=>{e.preventDefault();dr.classList.remove("over")}));
dr.addEventListener("drop",e=>arquivo(e.dataTransfer.files[0]));
$("ok").onclick=()=>{if(!confirm("ATENÇÃO\n\nA importação de uma nova planilha substituirá os dados atualmente carregados no sistema.\n\nDeseja continuar?"))return;
localStorage.setItem(LS,JSON.stringify(atual));$("prev").classList.add("hide");$("saida").classList.remove("hide");msg("✓ Planilha importada com sucesso. Baixe o dados.js para publicar no GitHub.","ok")};
$("cancel").onclick=()=>{atual=null;$("prev").classList.add("hide");$("msg").innerHTML=""};
function baixar(n,t,tipo){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:tipo}));a.download=n;a.click();URL.revokeObjectURL(a.href)}
$("baixa").onclick=()=>{baixar("dados.js",gerarJs(atual),"text/javascript");msg("✓ dados.js gerado com sucesso.","ok")};
$("copia").onclick=async()=>{try{await navigator.clipboard.writeText(gerarJs(atual));msg("✓ dados.js copiado!","ok")}catch(e){msg("✕ Não foi possível copiar. Use o botão de baixar.","er")}};
$("json").onclick=()=>{baixar(`backup-documentos-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(atual,null,2),"application/json");msg("✓ Backup criado.","ok")};
$("arqJs").onchange=e=>{const f=e.target.files[0];if(!f)return;const fr=new FileReader();fr.onload=ev=>{try{const t=ev.target.result,a=JSON.parse(t.slice(t.indexOf("["),t.lastIndexOf("]")+1));if(!Array.isArray(a))throw 0;nome=f.name;atual=a;previa(a,"dados.js")}catch(er){msg("✕ Não foi possível ler o dados.js. Use um arquivo gerado por este sistema.","er")}};fr.readAsText(f)};
