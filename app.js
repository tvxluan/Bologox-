import { nanoid } from "nanoid";

const GRID = document.getElementById('gameGrid');
const TPL = document.getElementById('cardTpl');

function makeBlankGame(i){
  const id = nanoid();
  return {
    id,
    name: i === 0 ? 'Mapa em branco' : `Mapa ${i+1}`,
    players: Math.floor(Math.random()*100),
    likes: Math.floor(Math.random()*5000)
  };
}

function renderCard(data){
  const el = TPL.content.cloneNode(true);
  const article = el.querySelector('.card');
  article.dataset.id = data.id;
  if (data.blobUrl) article.dataset.blob = data.blobUrl; // store blob url
  article.querySelector('.name').textContent = data.name;
  article.querySelector('.players').textContent = `${data.players} jogadores`;
  article.querySelector('.likes').textContent = `${data.likes} 👍`;
  // set thumbnail (prefer provided thumbnailUrl)
  const img = article.querySelector('.thumbnail img');
  img.src = data.thumbnailUrl || 'blank_map.png';
  img.alt = data.name + ' thumbnail';
  article.querySelector('.play').addEventListener('click', ()=> {
    // simple interaction: open a minimal overlay
    openPlayOverlay(data);
  });
  return el;
}

function openPlayOverlay(data){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;background:rgba(0,0,0,0.45);z-index:40';
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;padding:20px;border-radius:12px;max-width:720px;width:92%;text-align:center';
  // include preview button when uploaded html exists
  const previewBtn = data.blobUrl ? `<button id="previewBtn" style="margin-right:8px;padding:8px 12px;border-radius:8px;border:0;background:#0a66ff;color:#fff;cursor:pointer">Visualizar</button>` : '';
  card.innerHTML = `<h2 style="margin:0 0 8px">${data.name}</h2>
    <p style="margin:0 0 14px;color:#666">${data.players} jogadores · ${data.likes} 👍</p>
    ${previewBtn}
    <button id="joinBtn" style="padding:8px 12px;border-radius:8px;border:0;background:#111;color:#fff;cursor:pointer">Entrar</button>
    <button id="closeBtn" style="margin-left:8px;padding:8px 12px;border-radius:8px;border:1px solid #e6e6e6;background:transparent;cursor:pointer">Fechar</button>`;
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  overlay.querySelector('#closeBtn').onclick = ()=> overlay.remove();
  overlay.querySelector('#joinBtn').onclick = ()=> {
    alert('Iniciando mapa: ' + data.name + '\n(este é um demo)');
    overlay.remove();
  };
  if (data.blobUrl){
    overlay.querySelector('#previewBtn').onclick = ()=> openPreviewOverlay(data.blobUrl, data.name);
  }
}

function openPreviewOverlay(url, title){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;display:flex;flex-direction:column;background:rgba(0,0,0,0.6);z-index:60;padding:24px';
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;color:#fff;margin-bottom:8px';
  header.innerHTML = `<div style="font-weight:600">${title} — Pré-visualização</div><button id="closePreview" style="background:transparent;border:0;color:#fff;font-size:14px;cursor:pointer">Fechar</button>`;
  const frameWrap = document.createElement('div');
  frameWrap.style.cssText = 'flex:1;background:#fff;border-radius:8px;overflow:hidden';
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.cssText = 'width:100%;height:100%;border:0;display:block';
  frameWrap.appendChild(iframe);
  overlay.appendChild(header);
  overlay.appendChild(frameWrap);
  document.body.appendChild(overlay);
  overlay.querySelector('#closePreview').onclick = ()=> {
    iframe.src = 'about:blank';
    overlay.remove();
  };
}

// New: dialog to choose name and thumbnail for uploaded file
function openCreateDialog(file, fileBlobUrl){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;background:rgba(0,0,0,0.45);z-index:80;padding:20px';
  overlay.innerHTML = `<div style="width:100%;max-width:520px;background:#fff;border-radius:10px;padding:16px">
    <h3 style="margin:0 0 8px">Configurar jogo enviado</h3>
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
      <input id="createName" placeholder="Nome do jogo" style="flex:1;padding:8px;border:1px solid #e6e6e6;border-radius:8px" value="${escapeHtml((file && file.name) ? file.name.replace(/\.html?$/i,'') : 'Mapa enviado')}">
      <label style="display:inline-flex;align-items:center;gap:8px">
        <input id="thumbFile" type="file" accept="image/*" style="display:none">
        <button id="pickThumb" style="padding:8px 10px;border-radius:8px;border:1px solid #e6e6e6;background:transparent;cursor:pointer">Escolher imagem</button>
      </label>
    </div>
    <div style="height:120px;border:1px solid #f1f1f1;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:10px">
      <img id="thumbPreview" src="blank_map.png" style="max-width:100%;max-height:100%;object-fit:contain">
    </div>
    <div style="text-align:right;display:flex;gap:8px;justify-content:flex-end">
      <button id="cancelCreate" style="padding:8px 12px;border-radius:8px;border:1px solid #e6e6e6;background:transparent;cursor:pointer">Cancelar</button>
      <button id="confirmCreate" style="padding:8px 12px;border-radius:8px;border:0;background:#111;color:#fff;cursor:pointer">Criar jogo</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  const pickBtn = overlay.querySelector('#pickThumb');
  const thumbInput = overlay.querySelector('#thumbFile');
  const preview = overlay.querySelector('#thumbPreview');
  const nameInput = overlay.querySelector('#createName');

  // allow clicking to open file chooser
  pickBtn.onclick = () => thumbInput.click();
  thumbInput.onchange = (e)=>{
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    preview.src = url;
    preview.dataset.fileUrl = url;
  };

  overlay.querySelector('#cancelCreate').onclick = ()=> {
    if (fileBlobUrl) URL.revokeObjectURL(fileBlobUrl);
    overlay.remove();
  };

  overlay.querySelector('#confirmCreate').onclick = ()=> {
    const title = nameInput.value.trim() || 'Mapa enviado';
    const thumbUrl = preview.dataset.fileUrl || null;
    const id = nanoid();
    const newGame = {
      id,
      name: title,
      players: 0,
      likes: 0,
      blobUrl: fileBlobUrl,
      thumbnailUrl: thumbUrl
    };
    GRID.prepend(renderCard(newGame));
    const first = GRID.querySelector('.card');
    first.style.transition = 'box-shadow .2s,transform .2s';
    first.style.transform = 'translateY(-6px)';
    setTimeout(()=> first.style.transform = '', 220);
    overlay.remove();
  };
}

// Studio: create/edit HTML or JS, preview, save as card
function openStudio(initial = {name:'Novo Mapa', type:'html', content:''}) {
  const overlay = document.createElement('div');
  overlay.className = 'studio-overlay';
  overlay.innerHTML = `
    <div class="studio" role="dialog" aria-modal="true" aria-label="Studio">
      <div class="left">
        <div class="meta-row">
          <input id="studioName" type="text" placeholder="Nome do mapa" value="${escapeHtml(initial.name)}" />
          <select id="studioType">
            <option value="html">HTML</option>
            <option value="js">JavaScript (criador de script)</option>
          </select>
          <input id="studioUpload" type="file" accept=".html,.js,text/html,application/javascript" style="display:none" />
          <button id="studioUploadBtn" class="btn-ghost" type="button">Enviar arquivo</button>
        </div>
        <textarea id="studioEditor" placeholder="Cole seu HTML ou JS aqui...">${escapeHtml(initial.content)}</textarea>
        <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
          <input id="thumbPick" type="file" accept="image/*" style="display:none">
          <button id="thumbBtn" class="btn-ghost" type="button">Escolher miniatura</button>
          <div style="width:64px;height:40px;border:1px solid #e6e6e6;border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center">
            <img id="thumbPreviewStudio" src="blank_map.png" style="max-width:100%;max-height:100%;object-fit:cover">
          </div>
        </div>
        <div class="controls">
          <button id="studioCancel" class="btn-ghost" type="button">Cancelar</button>
          <button id="studioPreviewBtn" class="btn-primary" type="button">Pré-visualizar</button>
          <button id="studioSaveBtn" class="btn-primary" type="button">Salvar como jogo</button>
        </div>
      </div>
      <div class="right">
        <div style="font-weight:600">Pré-visualização</div>
        <div class="preview" id="studioPreview"><iframe srcdoc="" style="width:100%;height:100%;border:0"></iframe></div>
        <div style="font-size:13px;color:#666;margin-top:8px">Dica: para JS sozinho, envolva lógica em &lt;script&gt;...&lt;/script&gt; ou use um HTML wrapper.</div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const editor = overlay.querySelector('#studioEditor');
  const typeSel = overlay.querySelector('#studioType');
  const nameInput = overlay.querySelector('#studioName');
  const previewFrame = overlay.querySelector('#studioPreview iframe');
  const uploadInput = overlay.querySelector('#studioUpload');
  const uploadBtn = overlay.querySelector('#studioUploadBtn');

  const thumbBtn = overlay.querySelector('#thumbBtn');
  const thumbInput = overlay.querySelector('#thumbPick');
  const thumbPreview = overlay.querySelector('#thumbPreviewStudio');

  // upload file into editor
  uploadBtn.onclick = () => uploadInput.click();
  uploadInput.onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      editor.value = reader.result;
      if (f.name.endsWith('.js')) typeSel.value = 'js';
      if (f.name.endsWith('.html')) typeSel.value = 'html';
    };
    reader.readAsText(f);
  };

  // thumbnail pick for studio
  thumbBtn.onclick = () => thumbInput.click();
  thumbInput.onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    thumbPreview.src = url;
    thumbPreview.dataset.fileUrl = url;
  };

  overlay.querySelector('#studioCancel').onclick = () => overlay.remove();

  overlay.querySelector('#studioPreviewBtn').onclick = () => {
    const t = typeSel.value;
    let content = editor.value || '';
    if (t === 'js') {
      // wrap JS into a minimal HTML shell for preview
      content = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script>${content}<\/script></body></html>`;
    }
    previewFrame.srcdoc = content;
  };

  overlay.querySelector('#studioSaveBtn').onclick = () => {
    const t = typeSel.value;
    const name = nameInput.value.trim() || 'Mapa criado';
    let content = editor.value || '';
    if (t === 'js') {
      content = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script>${content}<\/script></body></html>`;
    }
    const blob = new Blob([content], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const id = nanoid();
    const newGame = {id, name, players: 0, likes: 0, blobUrl: url, thumbnailUrl: thumbPreview.dataset.fileUrl || null};
    GRID.prepend(renderCard(newGame));
    // small highlight
    const first = GRID.querySelector('.card');
    first.style.transition = 'box-shadow .2s,transform .2s';
    first.style.transform = 'translateY(-6px)';
    setTimeout(()=> first.style.transform = '', 220);
    overlay.remove();
  };
}

function escapeHtml(s){
  return String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function init(){
  // create only one blank map as requested, plus some placeholder recommendations
  const games = [makeBlankGame(0)];
  for(let i=1;i<8;i++) games.push(makeBlankGame(i));

  games.forEach(g => {
    GRID.appendChild(renderCard(g));
  });

  document.getElementById('search').addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase();
    Array.from(GRID.children).forEach(node => {
      const name = node.querySelector('.name').textContent.toLowerCase();
      node.style.display = name.includes(q) ? '' : 'none';
    });
  });

  // handle create/upload
  const upload = document.getElementById('uploadHtml');
  // New create menu: allow Studio or quick upload
  document.getElementById('createBtn').addEventListener('click', ()=> {
    // small menu overlay
    const menu = document.createElement('div');
    menu.style.cssText = 'position:fixed;top:60px;right:20px;background:#fff;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.12);z-index:70;padding:8px;display:flex;flex-direction:column;gap:8px';
    menu.innerHTML = `<button id="openStudio" class="btn ghost">Abrir Studio</button><button id="uploadQuick" class="btn ghost">Enviar HTML/JS</button><button id="closeMenu" class="btn-ghost">Fechar</button>`;
    document.body.appendChild(menu);
    menu.querySelector('#closeMenu').onclick = () => menu.remove();
    menu.querySelector('#uploadQuick').onclick = () => {
      menu.remove();
      upload.value = '';
      upload.click();
    };
    menu.querySelector('#openStudio').onclick = () => {
      menu.remove();
      openStudio();
    };
  });
  upload.addEventListener('change', async (e)=> {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (!f.name.endsWith('.html') && !f.name.endsWith('.js')) {
      alert('Por favor envie um arquivo .html ou .js');
      return;
    }
    // create blob url and open create dialog to choose name/thumbnail
    const blobUrl = URL.createObjectURL(f);
    openCreateDialog(f, blobUrl);
  });
}

init();