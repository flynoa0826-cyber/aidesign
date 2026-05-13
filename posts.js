(function(){
  const DB_NAME='designr';
  const DB_VERSION=1;
  const STORE='posts';
  const LEGACY_KEY='designr.posts';
  const MAX_FILES=5;
  const MAX_BYTES=10*1024*1024;
  const CATEGORIES={
    'on-sv':{name:'생존 전략',list:'community-list.html',detail:'community-detail.html'},
    'on-ai':{name:'AI 실무',list:'community-list-ai.html',detail:'community-ai-detail.html'},
    'on-ca':{name:'커리어 토크',list:'community-list-career.html',detail:'community-career-detail.html'},
    'on-pf':{name:'포트폴리오',list:'community-portfolio.html',detail:'community-portfolio-detail.html'},
    'on-qa':{name:'Q&A',list:'community-list-qa.html',detail:'community-qa-detail.html'}
  };

  let _db=null;
  let _cache=[];

  function openDB(){
    if(_db)return Promise.resolve(_db);
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains(STORE)){
          const s=db.createObjectStore(STORE,{keyPath:'id'});
          s.createIndex('authorEmail','authorEmail',{unique:false});
          s.createIndex('category','category',{unique:false});
          s.createIndex('createdAt','createdAt',{unique:false});
        }
      };
      req.onsuccess=()=>{_db=req.result;resolve(_db);};
      req.onerror=()=>reject(req.error);
    });
  }

  function tx(mode){
    return openDB().then(db=>db.transaction(STORE,mode).objectStore(STORE));
  }

  async function dbGetAll(){
    const store=await tx('readonly');
    return new Promise((resolve,reject)=>{
      const r=store.getAll();
      r.onsuccess=()=>resolve(r.result||[]);
      r.onerror=()=>reject(r.error);
    });
  }
  async function dbPut(post){
    const store=await tx('readwrite');
    return new Promise((resolve,reject)=>{
      const r=store.put(post);
      r.onsuccess=()=>resolve(post);
      r.onerror=()=>reject(r.error);
    });
  }
  async function dbDelete(id){
    const store=await tx('readwrite');
    return new Promise((resolve,reject)=>{
      const r=store.delete(id);
      r.onsuccess=()=>resolve(true);
      r.onerror=()=>reject(r.error);
    });
  }

  async function migrateFromLocalStorage(){
    try{
      const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');
      if(Array.isArray(legacy)&&legacy.length){
        for(const p of legacy){try{await dbPut(p);}catch(e){}}
        localStorage.removeItem(LEGACY_KEY);
      }
    }catch(e){}
  }

  function sortDesc(arr){return arr.slice().sort((a,b)=>b.createdAt-a.createdAt)}
  function refreshCacheSync(arr){_cache=sortDesc(arr)}

  async function refreshCache(){
    const all=await dbGetAll();
    refreshCacheSync(all);
    return _cache;
  }

  const ready=(async()=>{
    try{
      await openDB();
      await migrateFromLocalStorage();
      await refreshCache();
    }catch(e){console.error('DesignrPosts init failed',e);}
    document.dispatchEvent(new CustomEvent('designrposts:ready'));
  })();

  function loadAll(){return _cache.slice()}
  function getById(id){return _cache.find(p=>p.id===id)||null}
  function listByCategory(c){return _cache.filter(p=>p.category===c)}
  function listByAuthor(email){return _cache.filter(p=>p.authorEmail===email)}

  function uid(){return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

  async function create(data){
    const u=window.DesignrAuth&&window.DesignrAuth.getCurrentUser();
    const post={
      id:uid(),
      title:data.title||'',
      contentHtml:data.contentHtml||'',
      category:data.category||'on-sv',
      tags:Array.isArray(data.tags)?data.tags:[],
      attachments:Array.isArray(data.attachments)?data.attachments:[],
      authorEmail:u?u.email:'guest@local',
      authorNickname:u?u.nickname:'게스트',
      createdAt:Date.now(),
      updatedAt:Date.now(),
      views:0,
      likes:0
    };
    await dbPut(post);
    _cache.unshift(post);
    return post;
  }

  async function update(id,data){
    const cur=getById(id);
    if(!cur)return null;
    const u=window.DesignrAuth&&window.DesignrAuth.getCurrentUser();
    if(u&&cur.authorEmail!==u.email)return null;
    const next={...cur,
      title:data.title??cur.title,
      contentHtml:data.contentHtml??cur.contentHtml,
      category:data.category??cur.category,
      tags:Array.isArray(data.tags)?data.tags:cur.tags,
      attachments:Array.isArray(data.attachments)?data.attachments:cur.attachments,
      updatedAt:Date.now()
    };
    await dbPut(next);
    const i=_cache.findIndex(p=>p.id===id);
    if(i>=0)_cache[i]=next;
    return next;
  }

  async function remove(id){
    const cur=getById(id);
    if(!cur)return false;
    const u=window.DesignrAuth&&window.DesignrAuth.getCurrentUser();
    if(u&&cur.authorEmail!==u.email)return false;
    await dbDelete(id);
    _cache=_cache.filter(p=>p.id!==id);
    return true;
  }

  async function incView(id){
    const cur=getById(id);
    if(!cur)return;
    cur.views=(cur.views||0)+1;
    try{await dbPut(cur);}catch(e){}
  }

  function readFileAsDataURL(file){
    return new Promise((resolve,reject)=>{
      const r=new FileReader();
      r.onload=()=>resolve(r.result);
      r.onerror=()=>reject(r.error);
      r.readAsDataURL(file);
    });
  }

  function formatSize(bytes){
    if(bytes<1024)return bytes+' B';
    if(bytes<1024*1024)return (bytes/1024).toFixed(1)+' KB';
    return (bytes/(1024*1024)).toFixed(1)+' MB';
  }
  function formatDate(ts){
    const d=new Date(ts);const pad=n=>String(n).padStart(2,'0');
    return d.getFullYear()+'. '+pad(d.getMonth()+1)+'. '+pad(d.getDate());
  }
  function relativeTime(ts){
    const s=Math.floor((Date.now()-ts)/1000);
    if(s<60)return '방금 전';
    if(s<3600)return Math.floor(s/60)+'분 전';
    if(s<86400)return Math.floor(s/3600)+'시간 전';
    if(s<86400*7)return Math.floor(s/86400)+'일 전';
    return formatDate(ts);
  }
  function escapeHtml(s){
    return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function plainText(html){
    const d=document.createElement('div');d.innerHTML=html||'';
    return (d.textContent||'').replace(/\s+/g,' ').trim();
  }
  function firstImage(p){const a=(p.attachments||[]).find(x=>x.isImage);return a?a.dataUrl:null}

  function catBadge(catKey){
    const c=CATEGORIES[catKey]||CATEGORIES['on-sv'];
    const colors={'on-sv':'#FFF0E8;color:#FF6B35','on-ai':'#F0ECFE;color:#6C3BF5','on-ca':'#E6F9F3;color:#0BAD75','on-pf':'#FDEDF1;color:#E8335D','on-qa':'#FFF8EC;color:#E8930B'};
    return '<span class="tag tag-cat" style="background:'+colors[catKey]+'">'+escapeHtml(c.name)+'</span>';
  }
  function pitemHtml(p){
    const detailUrl='community-detail.html?id='+encodeURIComponent(p.id);
    const excerpt=plainText(p.contentHtml).slice(0,140);
    const thumb=firstImage(p);
    const thumbHtml=thumb
      ? '<div class="pitem-thumb" style="background-image:url(\''+thumb+'\');background-size:cover;background-position:center"></div>'
      : '<div class="pitem-thumb th1">'+escapeHtml(p.title.slice(0,2))+'</div>';
    const tagsHtml=(p.tags||[]).slice(0,2).map(t=>'<span class="tag tag-sub">'+escapeHtml(t)+'</span>').join('');
    const initial=escapeHtml((p.authorNickname||'?').charAt(0));
    return '<div class="pitem" onclick="location.href=\''+detailUrl+'\'">'+
      '<div class="pitem-body">'+
        '<div class="pitem-tags"><span class="tag tag-mine" style="background:#EEF4FF;color:#1B64DA;font-weight:600">내 글</span>'+catBadge(p.category)+tagsHtml+'</div>'+
        '<div class="pitem-title">'+escapeHtml(p.title)+'</div>'+
        '<div class="pitem-exc">'+escapeHtml(excerpt)+'</div>'+
        '<div class="pitem-foot"><div class="p-auth"><div class="pav">'+initial+'</div><span class="p-name">'+escapeHtml(p.authorNickname)+'</span></div><span class="p-sep">·</span><span class="p-date">'+relativeTime(p.createdAt)+'</span><div class="p-stats"><div class="p-st"><span class="material-icons-round">visibility</span>'+(p.views||0)+'</div></div></div>'+
      '</div>'+
      thumbHtml+
    '</div>';
  }

  const PAGE_CAT={
    'community-list.html':'on-sv',
    'community-list-ai.html':'on-ai',
    'community-list-career.html':'on-ca',
    'community-list-qa.html':'on-qa'
  };
  async function injectIntoListPage(){
    await ready;
    const file=location.pathname.split('/').pop()||'';
    const cat=PAGE_CAT[file];
    if(!cat)return;
    const list=document.querySelector('.post-list');
    if(!list)return;
    const posts=listByCategory(cat);
    if(!posts.length)return;
    const frag=document.createElement('div');
    frag.innerHTML=posts.map(pitemHtml).join('');
    while(frag.firstChild)list.insertBefore(frag.firstChild,list.firstChild);
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',injectIntoListPage)}
  else{injectIntoListPage()}

  window.DesignrPosts={
    MAX_FILES,MAX_BYTES,CATEGORIES,ready,
    loadAll,getById,listByCategory,listByAuthor,
    create,update,remove,incView,refreshCache,
    readFileAsDataURL,formatSize,formatDate,relativeTime,escapeHtml,
    plainText,firstImage,catBadge,pitemHtml
  };
})();
