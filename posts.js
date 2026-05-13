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
  const SUBCATS={
    'on-sv':['프리랜서','수익화','AI 대응','부업·사이드'],
    'on-ai':['툴 리뷰','프롬프트','워크플로우','피그마 AI'],
    'on-ca':['연봉·협상','이직·전환','번아웃','멘토링'],
    'on-pf':['UX/UI','브랜딩','모션','케이스 스터디','AI 활용','타이포'],
    'on-qa':['미답변','툴 사용법','커리어','계약·정산']
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
  function listByCategory(c,sub){
    return _cache.filter(p=>p.category===c&&(!sub||sub==='전체'||p.subcategory===sub));
  }
  function listByAuthor(email){return _cache.filter(p=>p.authorEmail===email)}
  function search(query){
    const q=String(query||'').toLowerCase().trim();
    if(!q)return[];
    return _cache.filter(p=>{
      const text=(p.title||'').toLowerCase()+' '+plainText(p.contentHtml).toLowerCase()+' '+(p.tags||[]).join(' ').toLowerCase();
      return text.includes(q);
    });
  }

  function uid(){return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

  async function create(data){
    const u=window.DesignrAuth&&window.DesignrAuth.getCurrentUser();
    const post={
      id:uid(),
      title:data.title||'',
      contentHtml:data.contentHtml||'',
      category:data.category||'on-sv',
      subcategory:data.subcategory||'',
      tags:Array.isArray(data.tags)?data.tags:[],
      attachments:Array.isArray(data.attachments)?data.attachments:[],
      authorEmail:u?u.email:'guest@local',
      authorNickname:u?u.nickname:'게스트',
      createdAt:Date.now(),
      updatedAt:Date.now(),
      views:0,
      likes:0,
      comments:[]
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
      subcategory:data.subcategory??cur.subcategory,
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

  function _currentUserEmail(){
    const u=window.DesignrAuth&&window.DesignrAuth.getCurrentUser();
    return u?u.email:null;
  }
  function _readSet(key){try{return new Set(JSON.parse(localStorage.getItem(key))||[])}catch(e){return new Set()}}
  function _writeSet(key,set){localStorage.setItem(key,JSON.stringify([...set]))}
  function _likeKey(){const e=_currentUserEmail();return e?'designr.likes.'+e:null}
  function _bmKey(){const e=_currentUserEmail();return e?'designr.bookmarks.'+e:null}

  function hasLiked(id){const k=_likeKey();return k?_readSet(k).has(id):false}
  function hasBookmarked(id){const k=_bmKey();return k?_readSet(k).has(id):false}

  async function toggleLike(id){
    const k=_likeKey();if(!k)return null;
    const post=getById(id);if(!post)return null;
    const set=_readSet(k);
    let liked;
    if(set.has(id)){set.delete(id);post.likes=Math.max(0,(post.likes||0)-1);liked=false;}
    else{set.add(id);post.likes=(post.likes||0)+1;liked=true;}
    _writeSet(k,set);
    try{await dbPut(post);}catch(e){}
    return {liked,count:post.likes};
  }
  function toggleBookmark(id){
    const k=_bmKey();if(!k)return null;
    const set=_readSet(k);
    let on;
    if(set.has(id)){set.delete(id);on=false;}else{set.add(id);on=true;}
    _writeSet(k,set);
    return on;
  }
  function listBookmarked(){
    const k=_bmKey();if(!k)return[];
    const set=_readSet(k);
    return _cache.filter(p=>set.has(p.id));
  }

  async function addComment(postId,text){
    const u=window.DesignrAuth&&window.DesignrAuth.getCurrentUser();
    if(!u)return null;
    text=String(text||'').trim();
    if(!text)return null;
    const post=getById(postId);
    if(!post)return null;
    if(!Array.isArray(post.comments))post.comments=[];
    const c={
      id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),
      authorEmail:u.email,
      authorNickname:u.nickname,
      text,
      createdAt:Date.now()
    };
    post.comments.push(c);
    try{await dbPut(post);}catch(e){}
    return c;
  }
  async function removeComment(postId,commentId){
    const u=window.DesignrAuth&&window.DesignrAuth.getCurrentUser();
    if(!u)return false;
    const post=getById(postId);
    if(!post||!Array.isArray(post.comments))return false;
    const i=post.comments.findIndex(c=>c.id===commentId);
    if(i<0)return false;
    const c=post.comments[i];
    if(c.authorEmail!==u.email&&post.authorEmail!==u.email)return false;
    post.comments.splice(i,1);
    try{await dbPut(post);}catch(e){}
    return true;
  }
  function listComments(postId){
    const p=getById(postId);
    return p&&Array.isArray(p.comments)?p.comments.slice():[];
  }

  function _followKey(){const e=_currentUserEmail();return e?'designr.follows.'+e:null}
  function isFollowing(authorEmail){const k=_followKey();return k?_readSet(k).has(authorEmail):false}
  function toggleFollow(authorEmail){
    const k=_followKey();if(!k)return null;
    const set=_readSet(k);
    let on;if(set.has(authorEmail)){set.delete(authorEmail);on=false;}else{set.add(authorEmail);on=true;}
    _writeSet(k,set);return on;
  }
  function followerCount(authorEmail){
    let n=0;
    try{
      const users=JSON.parse(localStorage.getItem('designr.users'))||[];
      for(const u of users){
        const set=_readSet('designr.follows.'+u.email);
        if(set.has(authorEmail))n++;
      }
    }catch(e){}
    return n;
  }

  const RECENT_MAX=10,POPULAR_MAX=10;
  function _recentKey(){
    const u=window.DesignrAuth&&window.DesignrAuth.getCurrentUser();
    return 'designr.recent.'+(u?u.email:'guest');
  }
  function getRecentSearches(){
    try{return JSON.parse(localStorage.getItem(_recentKey()))||[]}catch(e){return[]}
  }
  function removeRecentSearch(q){
    let r=getRecentSearches().filter(x=>x!==q);
    localStorage.setItem(_recentKey(),JSON.stringify(r));
  }
  function clearRecentSearches(){
    localStorage.setItem(_recentKey(),'[]');
  }
  function recordSearch(q){
    q=String(q||'').trim();
    if(!q)return;
    let r=getRecentSearches().filter(x=>x!==q);
    r.unshift(q);if(r.length>RECENT_MAX)r.length=RECENT_MAX;
    localStorage.setItem(_recentKey(),JSON.stringify(r));
    let pop={};try{pop=JSON.parse(localStorage.getItem('designr.popular'))||{}}catch(e){}
    pop[q]=(pop[q]||0)+1;
    localStorage.setItem('designr.popular',JSON.stringify(pop));
  }
  function getPopularSearches(){
    let p={};try{p=JSON.parse(localStorage.getItem('designr.popular'))||{}}catch(e){}
    return Object.entries(p).map(([q,n])=>({q,n})).sort((a,b)=>b.n-a.n||a.q.localeCompare(b.q)).slice(0,POPULAR_MAX);
  }

  function neighborPosts(postId){
    const p=getById(postId);if(!p)return{prev:null,next:null};
    const same=_cache.filter(x=>x.category===p.category);
    const i=same.findIndex(x=>x.id===p.id);
    return{prev:i>0?same[i-1]:null,next:i>=0&&i<same.length-1?same[i+1]:null};
  }

  function toast(msg){
    let t=document.getElementById('__designr_toast');
    if(!t){
      t=document.createElement('div');
      t.id='__designr_toast';
      t.style.cssText="position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);background:#191919;color:#fff;padding:11px 22px;border-radius:100px;font-size:14px;font-weight:500;font-family:'Noto Sans KR',sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.18);opacity:0;transition:all .25s ease;z-index:9999;pointer-events:none;max-width:90vw;text-align:center;white-space:nowrap";
      document.body.appendChild(t);
    }
    t.textContent=msg;
    requestAnimationFrame(()=>{t.style.opacity='1';t.style.transform='translateX(-50%) translateY(0)';});
    clearTimeout(t._h);t._h=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(-50%) translateY(20px)';},2400);
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

  const AVATAR_PALETTE=['#1B64DA','#FF6B35','#0BAD75','#E8335D','#6C3BF5','#E8930B','#089960','#D94F1A','#5429D4','#1450B0','#C41E45','#7B61FF'];
  function authorColor(seed){
    const s=String(seed||'?');
    let h=0;for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i);h|=0;}
    return AVATAR_PALETTE[Math.abs(h)%AVATAR_PALETTE.length];
  }
  function avatarHtml(post,opts){
    opts=opts||{};
    const size=opts.size||24;
    const seed=post.authorEmail||post.authorNickname||'?';
    const color=authorColor(seed);
    const initial=escapeHtml((post.authorNickname||'?').charAt(0).toUpperCase());
    const fs=Math.max(10,Math.round(size*0.45));
    const cls=opts.cls?(' class="'+opts.cls+'"'):'';
    return '<div'+cls+' style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:'+color+';color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:'+fs+'px;font-weight:700;font-family:\'Noto Sans KR\',sans-serif;flex-shrink:0;line-height:1">'+initial+'</div>';
  }

  function enhanceYoutube(html){
    if(!html||!/youtu/.test(html))return html||'';
    const tmp=document.createElement('div');
    tmp.innerHTML=html;
    const ytRe=/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    function makeCard(id,url){
      const thumb='https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
      const wrap=document.createElement('div');
      wrap.innerHTML='<a href="'+url+'" target="_blank" rel="noopener" style="display:block;position:relative;text-decoration:none;margin:16px 0;border-radius:12px;overflow:hidden;border:1px solid #E4E5E7;background:#000;max-width:560px"><img src="'+thumb+'" alt="YouTube" style="width:100%;display:block;aspect-ratio:16/9;object-fit:cover"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div style="width:64px;height:64px;border-radius:50%;background:rgba(255,0,0,.92);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.4)"><span class="material-icons-round" style="font-size:36px;color:#fff;margin-left:4px">play_arrow</span></div></div><div style="position:absolute;bottom:0;left:0;right:0;padding:14px 16px;background:linear-gradient(0deg,rgba(0,0,0,.7),transparent);color:#fff;font-size:12px;font-weight:500;display:flex;align-items:center;gap:6px"><span class="material-icons-round" style="font-size:14px">smart_display</span>YouTube에서 보기</div></a>';
      return wrap.firstChild;
    }
    tmp.querySelectorAll('a').forEach(a=>{
      const href=a.getAttribute('href')||a.href||'';
      const m=ytRe.exec(href);
      if(m)a.parentNode.replaceChild(makeCard(m[1],href),a);
    });
    const walker=document.createTreeWalker(tmp,NodeFilter.SHOW_TEXT,null);
    const nodes=[];let n;while((n=walker.nextNode()))nodes.push(n);
    const urlRe=/https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=[A-Za-z0-9_-]+|embed\/[A-Za-z0-9_-]+|shorts\/[A-Za-z0-9_-]+)|youtu\.be\/[A-Za-z0-9_-]+)[^\s<>"']*/g;
    nodes.forEach(node=>{
      const txt=node.nodeValue;
      if(!txt||!ytRe.test(txt))return;
      urlRe.lastIndex=0;
      let last=0,mm;const frag=document.createDocumentFragment();let touched=false;
      while((mm=urlRe.exec(txt))){
        const idm=ytRe.exec(mm[0]);if(!idm)continue;
        if(mm.index>last)frag.appendChild(document.createTextNode(txt.slice(last,mm.index)));
        frag.appendChild(makeCard(idm[1],mm[0]));
        last=mm.index+mm[0].length;touched=true;
      }
      if(touched){
        if(last<txt.length)frag.appendChild(document.createTextNode(txt.slice(last)));
        node.parentNode.replaceChild(frag,node);
      }
    });
    return tmp.innerHTML;
  }

  function catBadge(catKey){
    const c=CATEGORIES[catKey]||CATEGORIES['on-sv'];
    const colors={'on-sv':'#FFF0E8;color:#FF6B35','on-ai':'#F0ECFE;color:#6C3BF5','on-ca':'#E6F9F3;color:#0BAD75','on-pf':'#FDEDF1;color:#E8335D','on-qa':'#FFF8EC;color:#E8930B'};
    return '<span class="tag tag-cat" style="background:'+colors[catKey]+'">'+escapeHtml(c.name)+'</span>';
  }
  function gitemHtml(p){
    const detailUrl='community-detail.html?id='+encodeURIComponent(p.id);
    const thumb=firstImage(p);
    const colorIdx=(p.id.split('').reduce((s,c)=>s+c.charCodeAt(0),0)%8)+1;
    const heights=['gt-tall','gt-med','gt-short','gt-wide'];
    const heightCls=heights[Math.abs(p.id.length+p.title.length)%heights.length];
    const thumbHtml=thumb
      ? '<img class="g-thumb-img" src="'+thumb+'" alt="'+escapeHtml(p.title)+'" style="width:100%;height:auto;display:block">'
      : '<div class="g-thumb-img gc-'+colorIdx+' '+heightCls+'">'+escapeHtml(p.title.slice(0,40))+'</div>';
    const tagsHtml=(p.tags||[]).slice(0,3).map(t=>'<span class="tag tag-sub">'+escapeHtml(t)+'</span>').join('');
    const initial=escapeHtml((p.authorNickname||'?').charAt(0).toUpperCase());
    const color=authorColor(p.authorEmail||p.authorNickname);
    return '<div class="gitem" onclick="location.href=\''+detailUrl+'\'">'+
      '<div class="g-thumb">'+thumbHtml+
        '<div class="g-overlay"><button class="g-ov-btn">자세히 보기</button></div>'+
      '</div>'+
      '<div class="g-info">'+
        '<div class="g-tags"><span class="tag tag-new">내 글</span>'+
          (p.subcategory?'<span class="tag tag-cat">'+escapeHtml(p.subcategory)+'</span>':'')+
          tagsHtml+
        '</div>'+
        '<div class="g-title">'+escapeHtml(p.title)+'</div>'+
        '<div class="g-foot">'+
          '<div class="g-name" style="display:flex;align-items:center;gap:6px"><span style="width:20px;height:20px;border-radius:50%;background:'+color+';color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;line-height:1">'+initial+'</span>'+escapeHtml(p.authorNickname)+'</div>'+
          '<span class="g-sep">·</span>'+
          '<span class="g-date">'+relativeTime(p.createdAt)+'</span>'+
          '<span class="g-sep">·</span>'+
          '<span class="g-date"><span class="material-icons-round" style="font-size:13px;vertical-align:-2px">visibility</span> '+(p.views||0)+'</span>'+
        '</div>'+
      '</div>'+
    '</div>';
  }

  function qitemHtml(p){
    const detailUrl='community-detail.html?id='+encodeURIComponent(p.id);
    const excerpt=plainText(p.contentHtml).slice(0,160);
    const tagsHtml=(p.tags||[]).slice(0,3).map(t=>'<span class="tag tag-sub">'+escapeHtml(t)+'</span>').join('');
    const initial=escapeHtml((p.authorNickname||'?').charAt(0).toUpperCase());
    const color=authorColor(p.authorEmail||p.authorNickname);
    const commentsCount=Array.isArray(p.comments)?p.comments.length:0;
    return '<div class="qi" onclick="location.href=\''+detailUrl+'\'">'+
      '<div class="qi-top">'+
        '<div class="qi-icon"><span class="material-icons-round">help_outline</span></div>'+
        '<div class="qi-content">'+
          '<div class="qi-tags"><span class="tag tag-sub" style="background:#EEF4FF;color:#1B64DA;font-weight:600">내 글</span>'+
            (p.subcategory?'<span class="tag tag-sub" style="background:#FFF8EC;color:#E8930B">'+escapeHtml(p.subcategory)+'</span>':'')+
            tagsHtml+
          '</div>'+
          '<div class="qi-title">'+escapeHtml(p.title)+'</div>'+
          '<div class="qi-body">'+escapeHtml(excerpt)+'</div>'+
          '<div class="qi-foot">'+
            '<div class="p-auth"><div class="pav" style="background:'+color+';color:#fff;font-weight:700">'+initial+'</div><span class="p-name">'+escapeHtml(p.authorNickname)+'</span></div>'+
            '<span class="p-sep">·</span>'+
            '<span class="p-date">'+relativeTime(p.createdAt)+'</span>'+
            '<div class="qi-stats">'+
              '<div class="qst"><span class="material-icons-round">visibility</span>'+(p.views||0)+'</div>'+
              '<div class="qst"><span class="material-icons-round">chat_bubble_outline</span>'+commentsCount+'</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>';
  }

  function pitemHtml(p){
    const detailUrl='community-detail.html?id='+encodeURIComponent(p.id);
    const excerpt=plainText(p.contentHtml).slice(0,140);
    const thumb=firstImage(p);
    const thumbHtml=thumb
      ? '<div class="pitem-thumb" style="background-image:url(\''+thumb+'\');background-size:cover;background-position:center"></div>'
      : '<div class="pitem-thumb th1">'+escapeHtml(p.title.slice(0,2))+'</div>';
    const tagsHtml=(p.tags||[]).slice(0,2).map(t=>'<span class="tag tag-sub">'+escapeHtml(t)+'</span>').join('');
    const initial=escapeHtml((p.authorNickname||'?').charAt(0).toUpperCase());
    const color=authorColor(p.authorEmail||p.authorNickname);
    return '<div class="pitem" onclick="location.href=\''+detailUrl+'\'">'+
      '<div class="pitem-body">'+
        '<div class="pitem-tags"><span class="tag tag-mine" style="background:#EEF4FF;color:#1B64DA;font-weight:600">내 글</span>'+catBadge(p.category)+(p.subcategory?'<span class="tag tag-sub">'+escapeHtml(p.subcategory)+'</span>':'')+tagsHtml+'</div>'+
        '<div class="pitem-title">'+escapeHtml(p.title)+'</div>'+
        '<div class="pitem-exc">'+escapeHtml(excerpt)+'</div>'+
        '<div class="pitem-foot"><div class="p-auth"><div class="pav" style="background:'+color+';color:#fff;font-weight:700">'+initial+'</div><span class="p-name">'+escapeHtml(p.authorNickname)+'</span></div><span class="p-sep">·</span><span class="p-date">'+relativeTime(p.createdAt)+'</span><div class="p-stats"><div class="p-st"><span class="material-icons-round">visibility</span>'+(p.views||0)+'</div></div></div>'+
      '</div>'+
      thumbHtml+
    '</div>';
  }

  const PAGE_CAT={
    'community-list.html':'on-sv',
    'community-list-ai.html':'on-ai',
    'community-list-career.html':'on-ca',
    'community-list-qa.html':'on-qa',
    'community-portfolio.html':'on-pf'
  };
  const PER_PAGE=10;

  function renderPagination(total,page){
    const pagi=document.querySelector('.pagi');
    if(!pagi)return;
    const pages=Math.ceil(total/PER_PAGE);
    if(pages<=1){pagi.style.display='none';pagi.innerHTML='';return;}
    pagi.style.display='';
    const params=new URLSearchParams(location.search);
    const linkFor=p=>{const sp=new URLSearchParams(params);sp.set('p',p);return location.pathname+'?'+sp.toString();};
    let html='';
    html+='<button class="pgb"'+(page<=1?' disabled':' onclick="location.href=\''+linkFor(page-1)+'\'"')+'><span class="material-icons-round">chevron_left</span></button>';
    for(let i=1;i<=pages;i++){
      html+='<button class="pgb'+(i===page?' on':'')+'" onclick="location.href=\''+linkFor(i)+'\'">'+i+'</button>';
    }
    html+='<button class="pgb"'+(page>=pages?' disabled':' onclick="location.href=\''+linkFor(page+1)+'\'"')+'><span class="material-icons-round">chevron_right</span></button>';
    pagi.innerHTML=html;
  }

  function rewriteWriteLinks(){
    const file=location.pathname.split('/').pop()||'';
    const cat=PAGE_CAT[file];
    if(!cat)return;
    document.querySelectorAll('a').forEach(a=>{
      const href=a.getAttribute('href');
      if(!href||!/(^|\/)community-write\.html(\?|$)/.test(href))return;
      try{
        const u=new URL(href,location.href);
        if(u.searchParams.get('id'))return;
        u.searchParams.set('cat',cat);
        a.setAttribute('href',u.pathname.split('/').pop()+(u.search?u.search:''));
      }catch(e){}
    });
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',rewriteWriteLinks)}
  else{rewriteWriteLinks()}

  async function injectIntoListPage(){
    await ready;
    rewriteWriteLinks();
    const file=location.pathname.split('/').pop()||'';
    const cat=PAGE_CAT[file];
    if(!cat){renderPagination(0,1);return;}
    const list=document.querySelector('.post-list');
    if(!list){renderPagination(0,1);return;}
    const params=new URLSearchParams(location.search);
    const sub=params.get('sub')||'';
    document.querySelectorAll('.chips .chip, .ftabs .ftab').forEach(c=>{
      const t=(c.textContent||'').trim();
      const active=(!sub&&t==='전체')||(sub&&t===sub);
      c.classList.toggle('on',active);
      c.onclick=(()=>{const sp=new URLSearchParams(location.search);if(t==='전체'){sp.delete('sub');}else{sp.set('sub',t);}sp.delete('p');location.search=sp.toString();});
    });
    const all=listByCategory(cat,sub);
    const total=all.length;
    let page=parseInt(params.get('p'),10)||1;
    const pages=Math.max(1,Math.ceil(total/PER_PAGE));
    if(page<1)page=1;if(page>pages)page=pages;
    renderPagination(total,page);
    if(!total){
      const empty=list.querySelector('#emptyState');
      if(empty){
        const title=empty.querySelector('div');
        if(title&&sub)title.textContent='"'+sub+'" 분류의 글이 아직 없어요';
      }
      return;
    }
    const empty=list.querySelector('#emptyState');
    if(empty)empty.remove();
    const slice=all.slice((page-1)*PER_PAGE,page*PER_PAGE);
    const tpl=cat==='on-pf'?gitemHtml:cat==='on-qa'?qitemHtml:pitemHtml;
    list.innerHTML=slice.map(tpl).join('');
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',injectIntoListPage)}
  else{injectIntoListPage()}

  window.DesignrPosts={
    MAX_FILES,MAX_BYTES,CATEGORIES,SUBCATS,ready,
    loadAll,getById,listByCategory,listByAuthor,listBookmarked,search,
    create,update,remove,incView,refreshCache,
    hasLiked,hasBookmarked,toggleLike,toggleBookmark,
    addComment,removeComment,listComments,toast,
    isFollowing,toggleFollow,followerCount,neighborPosts,
    recordSearch,getRecentSearches,removeRecentSearch,clearRecentSearches,getPopularSearches,
    readFileAsDataURL,formatSize,formatDate,relativeTime,escapeHtml,
    plainText,firstImage,catBadge,pitemHtml,gitemHtml,qitemHtml,
    authorColor,avatarHtml,enhanceYoutube
  };
})();
