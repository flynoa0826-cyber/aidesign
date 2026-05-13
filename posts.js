(function(){
  const POSTS_KEY='designr.posts';
  const MAX_FILES=5;
  const MAX_BYTES=10*1024*1024;
  const CATEGORIES={
    'on-sv':{name:'생존 전략',list:'community-list.html',detail:'community-detail.html'},
    'on-ai':{name:'AI 실무',list:'community-list-ai.html',detail:'community-ai-detail.html'},
    'on-ca':{name:'커리어 토크',list:'community-list-career.html',detail:'community-career-detail.html'},
    'on-pf':{name:'포트폴리오',list:'community-portfolio.html',detail:'community-portfolio-detail.html'},
    'on-qa':{name:'Q&A',list:'community-list-qa.html',detail:'community-qa-detail.html'}
  };

  function loadAll(){try{return JSON.parse(localStorage.getItem(POSTS_KEY))||[]}catch(e){return[]}}
  function saveAll(list){localStorage.setItem(POSTS_KEY,JSON.stringify(list))}
  function uid(){return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

  function getById(id){return loadAll().find(p=>p.id===id)||null}
  function listByCategory(catKey){return loadAll().filter(p=>p.category===catKey).sort((a,b)=>b.createdAt-a.createdAt)}
  function listByAuthor(email){return loadAll().filter(p=>p.authorEmail===email).sort((a,b)=>b.createdAt-a.createdAt)}

  function create(data){
    const u=window.DesignrAuth&&window.DesignrAuth.getCurrentUser();
    const id=uid();
    const post={
      id,
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
    const all=loadAll();all.unshift(post);saveAll(all);
    return post;
  }

  function update(id,data){
    const all=loadAll();
    const i=all.findIndex(p=>p.id===id);
    if(i<0)return null;
    const cur=all[i];
    const u=window.DesignrAuth&&window.DesignrAuth.getCurrentUser();
    if(u&&cur.authorEmail!==u.email)return null;
    all[i]={...cur,
      title:data.title??cur.title,
      contentHtml:data.contentHtml??cur.contentHtml,
      category:data.category??cur.category,
      tags:Array.isArray(data.tags)?data.tags:cur.tags,
      attachments:Array.isArray(data.attachments)?data.attachments:cur.attachments,
      updatedAt:Date.now()
    };
    saveAll(all);
    return all[i];
  }

  function remove(id){
    const all=loadAll();
    const u=window.DesignrAuth&&window.DesignrAuth.getCurrentUser();
    const idx=all.findIndex(p=>p.id===id);
    if(idx<0)return false;
    if(u&&all[idx].authorEmail!==u.email)return false;
    all.splice(idx,1);saveAll(all);return true;
  }

  function incView(id){
    const all=loadAll();const p=all.find(x=>x.id===id);
    if(p){p.views=(p.views||0)+1;saveAll(all);}
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
    const d=new Date(ts);
    const pad=n=>String(n).padStart(2,'0');
    return d.getFullYear()+'. '+pad(d.getMonth()+1)+'. '+pad(d.getDate());
  }

  function escapeHtml(s){
    return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  window.DesignrPosts={
    MAX_FILES,MAX_BYTES,CATEGORIES,
    loadAll,getById,listByCategory,listByAuthor,
    create,update,remove,incView,
    readFileAsDataURL,formatSize,formatDate,escapeHtml
  };
})();
