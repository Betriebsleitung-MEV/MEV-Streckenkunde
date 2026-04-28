
const STAFF_URL = 'data/mitarbeiter.json';
let STAFF = [];

fetch(STAFF_URL).then(r=>r.json()).then(j=>{
  Object.entries(j.employeesByDepartment||{}).forEach(([dept,list])=>
    list.forEach(p=>p.aktiv!==false && STAFF.push({...p,abteilung:dept}))
  );
});

// Datum & Uhrzeit
for(const b of document.querySelectorAll('.datetime')){
  b.addEventListener('click',()=>{
    const d=new Date();
    b.textContent = b.dataset.type==='date'
      ? d.toLocaleDateString('de-CH')
      : d.toLocaleTimeString('de-CH',{hour:'2-digit',minute:'2-digit'});
  });
  b.addEventListener('dblclick',()=>{
    b.classList.toggle('fixed');
  });
}

// Buttons
for(const btn of document.querySelectorAll('.select-btn')){
  btn.addEventListener('click',()=>{
    const role=btn.dataset.role;
    if(!role) return;

    if(role==='Erfasser'){
      openStaff(p=>renderInternal(document.getElementById('erfasser'),role,p));
      return;
    }

    if(btn.dataset.mode==='external'){
      openExternal(p=>renderExternal(document.getElementById('melder'),role,p));
      return;
    }

    if(role==='Melder'){
      openChoice(role, document.getElementById('melder'));
      return;
    }

    // Involvierte (mehrfach)
    openChoice(role, addInvolved());
  });
}

function addInvolved(){
  const d=document.createElement('div');
  d.className='person-card';
  d.addEventListener('dblclick',()=>d.classList.toggle('fixed'));
  document.getElementById('involved').append(d);
  return d;
}

function renderInternal(el,role,p){
  el.classList.remove('fixed');
  el.innerHTML = `<span class="name">${p.vorname} ${p.nachname}</span><span class="meta">${p.mail} · ${p.tel}</span>`;
}

function renderExternal(el,role,p){
  el.classList.remove('fixed');
  el.innerHTML = `<span class="name">${p.unternehmen} – ${p.name}</span><span class="meta">${p.mail} · ${p.tel}</span>`;
}

function openChoice(role,target){
  const o=overlay();
  btn(o,'Mitarbeiterliste',()=>openStaff(p=>{renderInternal(target,role,p);o.remove();}),true);
  btn(o,'Extern / Manuell',()=>openExternal(p=>{renderExternal(target,role,p);o.remove();}));
}

function openStaff(cb){
  const o=overlay();
  const i=input(o,'Suche');
  const l=document.createElement('div');l.className='sufu-list';o.append(l);
  const r=q=>{l.innerHTML='';STAFF.filter(p=>(`${p.abteilung} ${p.vorname} ${p.nachname} ${p.mail} ${p.tel}`).toLowerCase().includes(q)).slice(0,100).forEach(p=>{const d=document.createElement('div');d.className='sufu-item';d.textContent=`${p.vorname} ${p.nachname} (${p.abteilung})`;d.onclick=()=>{o.remove();cb(p);};l.append(d);});};
  i.oninput=e=>r(e.target.value.toLowerCase());r('');
}

function openExternal(cb){
  const o=overlay();
  const u=input(o,'Unternehmen'),n=input(o,'Name'),m=input(o,'Mail'),t=input(o,'Telefon');
  btn(o,'Übernehmen',()=>{o.remove();cb({unternehmen:u.value,name:n.value,mail:m.value,tel:t.value});},true);
}

function overlay(){const b=document.createElement('div');b.className='overlay';b.onclick=e=>e.target===b&&b.remove();const c=document.createElement('div');c.className='overlay-box';b.append(c);document.body.append(b);return c;}
function input(p,ph){const i=document.createElement('input');i.placeholder=ph;i.className='sufu-input';p.append(i);return i}
function btn(p,t,f,pri){const b=document.createElement('button');b.textContent=t;b.className=pri?'btn-primary':'btn-secondary';b.onclick=f;p.append(b)}
