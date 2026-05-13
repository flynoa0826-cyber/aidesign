(function(){
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
  const PER_PAGE=10;
  const PAGE_CAT={
    'community-list.html':'on-sv',
    'community-list-ai.html':'on-ai',
    'community-list-career.html':'on-ca',
    'community-list-qa.html':'on-qa',
    'community-portfolio.html':'on-pf'
  };

  let _cache=[]; // posts (no comments embedded)
  let _profileCache={}; // userId -> profile
  let _likedSet=new Set();
  let _bookmarkedSet=new Set();
  let _followingSet=new Set();
  let _notifications=[];
  let _resolveReady;
  const ready=new Promise(r=>{_resolveReady=r});

  function _user(){return window.DesignrAuth&&window.DesignrAuth.getCurrentUser()}

  // ===== utility =====
  function escapeHtml(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function formatSize(b){if(b<1024)return b+' B';if(b<1024*1024)return (b/1024).toFixed(1)+' KB';return (b/(1024*1024)).toFixed(1)+' MB';}
  function formatDate(ts){const d=new Date(ts);const p=n=>String(n).padStart(2,'0');return d.getFullYear()+'. '+p(d.getMonth()+1)+'. '+p(d.getDate())}
  function relativeTime(ts){const s=Math.floor((Date.now()-new Date(ts).getTime())/1000);if(s<60)return '방금 전';if(s<3600)return Math.floor(s/60)+'분 전';if(s<86400)return Math.floor(s/3600)+'시간 전';if(s<86400*7)return Math.floor(s/86400)+'일 전';return formatDate(ts)}
  function plainText(html){const d=document.createElement('div');d.innerHTML=html||'';return (d.textContent||'').replace(/\s+/g,' ').trim()}
  function readFileAsDataURL(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(f)})}

  const AVATAR_PALETTE=['#1B64DA','#FF6B35','#0BAD75','#E8335D','#6C3BF5','#E8930B','#089960','#D94F1A','#5429D4','#1450B0','#C41E45','#7B61FF'];
  function authorColor(seed){const s=String(seed||'?');let h=0;for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i);h|=0}return AVATAR_PALETTE[Math.abs(h)%AVATAR_PALETTE.length]}
  function avatarHtml(post,opts){opts=opts||{};const size=opts.size||24;const seed=post.authorEmail||post.authorNickname||'?';const c=authorColor(seed);const init=escapeHtml((post.authorNickname||'?').charAt(0).toUpperCase());const fs=Math.max(10,Math.round(size*0.45));return '<div style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:'+c+';color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:'+fs+'px;font-weight:700;flex-shrink:0;line-height:1">'+init+'</div>'}

  function firstImage(p){const a=(p.attachments||[]).find(x=>x.isImage);return a?a.dataUrl:null}
  function catBadge(c){const cat=CATEGORIES[c]||CATEGORIES['on-sv'];const colors={'on-sv':'#FFF0E8;color:#FF6B35','on-ai':'#F0ECFE;color:#6C3BF5','on-ca':'#E6F9F3;color:#0BAD75','on-pf':'#FDEDF1;color:#E8335D','on-qa':'#FFF8EC;color:#E8930B'};return '<span class="tag tag-cat" style="background:'+colors[c]+'">'+escapeHtml(cat.name)+'</span>'}

  function enhanceYoutube(html){
    if(!html||!/youtu/.test(html))return html||'';
    const tmp=document.createElement('div');tmp.innerHTML=html;
    const ytRe=/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    function card(id,url){const thumb='https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';const w=document.createElement('div');w.innerHTML='<a href="'+url+'" target="_blank" rel="noopener" style="display:block;position:relative;text-decoration:none;margin:16px 0;border-radius:12px;overflow:hidden;border:1px solid #E4E5E7;background:#000;max-width:560px"><img src="'+thumb+'" alt="YouTube" style="width:100%;display:block;aspect-ratio:16/9;object-fit:cover"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div style="width:64px;height:64px;border-radius:50%;background:rgba(255,0,0,.92);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.4)"><span class="material-icons-round" style="font-size:36px;color:#fff;margin-left:4px">play_arrow</span></div></div><div style="position:absolute;bottom:0;left:0;right:0;padding:14px 16px;background:linear-gradient(0deg,rgba(0,0,0,.7),transparent);color:#fff;font-size:12px;font-weight:500;display:flex;align-items:center;gap:6px"><span class="material-icons-round" style="font-size:14px">smart_display</span>YouTube에서 보기</div></a>';return w.firstChild}
    tmp.querySelectorAll('a').forEach(a=>{const h=a.getAttribute('href')||a.href||'';const m=ytRe.exec(h);if(m)a.parentNode.replaceChild(card(m[1],h),a)});
    const walker=document.createTreeWalker(tmp,NodeFilter.SHOW_TEXT,null);const nodes=[];let n;while((n=walker.nextNode()))nodes.push(n);
    const urlRe=/https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=[A-Za-z0-9_-]+|embed\/[A-Za-z0-9_-]+|shorts\/[A-Za-z0-9_-]+)|youtu\.be\/[A-Za-z0-9_-]+)[^\s<>"']*/g;
    nodes.forEach(node=>{const t=node.nodeValue;if(!t||!ytRe.test(t))return;urlRe.lastIndex=0;let last=0,mm;const frag=document.createDocumentFragment();let touched=false;while((mm=urlRe.exec(t))){const idm=ytRe.exec(mm[0]);if(!idm)continue;if(mm.index>last)frag.appendChild(document.createTextNode(t.slice(last,mm.index)));frag.appendChild(card(idm[1],mm[0]));last=mm.index+mm[0].length;touched=true}if(touched){if(last<t.length)frag.appendChild(document.createTextNode(t.slice(last)));node.parentNode.replaceChild(frag,node)}});
    return tmp.innerHTML;
  }

  function toast(msg){
    let t=document.getElementById('__designr_toast');
    if(!t){t=document.createElement('div');t.id='__designr_toast';t.style.cssText="position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);background:#191919;color:#fff;padding:11px 22px;border-radius:100px;font-size:14px;font-weight:500;font-family:'Noto Sans KR',sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.18);opacity:0;transition:all .25s ease;z-index:9999;pointer-events:none;max-width:90vw;text-align:center;white-space:nowrap";document.body.appendChild(t)}
    t.textContent=msg;
    requestAnimationFrame(()=>{t.style.opacity='1';t.style.transform='translateX(-50%) translateY(0)'});
    clearTimeout(t._h);t._h=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(-50%) translateY(20px)'},2400);
  }

  // ===== row mappers (DB -> client) =====
  function mapPost(row){
    const prof=row.profiles||{};
    return {
      id:row.id,
      title:row.title,
      contentHtml:row.content_html||'',
      category:row.category,
      subcategory:row.subcategory||'',
      tags:row.tags||[],
      attachments:row.attachments||[],
      authorId:row.author_id,
      authorEmail:prof.email||'',
      authorNickname:prof.nickname||'',
      createdAt:new Date(row.created_at).getTime(),
      updatedAt:new Date(row.updated_at||row.created_at).getTime(),
      views:row.views||0,
      likes:row._likes||0,
      comments:row._comments||0
    };
  }

  // ===== loaders =====
  async function refreshCache(){
    if(!window.sb)return;
    const {data,error}=await sb.from('posts').select('*,profiles!posts_author_id_fkey(email,nickname)').order('created_at',{ascending:false});
    if(error){console.warn('posts load',error);return}
    // counts (likes / comments)
    let likeCounts={},cmtCounts={};
    try{
      const lk=await sb.from('likes').select('post_id');
      if(lk.data)lk.data.forEach(r=>{likeCounts[r.post_id]=(likeCounts[r.post_id]||0)+1});
      const ck=await sb.from('comments').select('post_id');
      if(ck.data)ck.data.forEach(r=>{cmtCounts[r.post_id]=(cmtCounts[r.post_id]||0)+1});
    }catch(e){}
    _cache=(data||[]).map(r=>{r._likes=likeCounts[r.id]||0;r._comments=cmtCounts[r.id]||0;return mapPost(r)});
    const u=_user();
    if(u){
      const lk=await sb.from('likes').select('post_id').eq('user_id',u.id);
      _likedSet=new Set((lk.data||[]).map(r=>r.post_id));
      const bm=await sb.from('bookmarks').select('post_id').eq('user_id',u.id);
      _bookmarkedSet=new Set((bm.data||[]).map(r=>r.post_id));
      const fl=await sb.from('follows').select('author_id').eq('follower_id',u.id);
      _followingSet=new Set((fl.data||[]).map(r=>r.author_id));
      await refreshNotifications();
    }
  }

  async function refreshNotifications(){
    const u=_user();if(!u||!window.sb){_notifications=[];return}
    const {data}=await sb.from('notifications').select('*,actor:profiles!notifications_actor_id_fkey(email,nickname),post:posts(title)').eq('recipient_id',u.id).order('created_at',{ascending:false}).limit(200);
    _notifications=(data||[]).map(r=>({
      id:r.id,type:r.type,
      actorEmail:r.actor?.email||'',actorNickname:r.actor?.nickname||'',
      postId:r.post_id,postTitle:r.post?.title||'',
      commentId:r.comment_id,
      text:r.text_preview||'',
      createdAt:new Date(r.created_at).getTime(),
      read:r.read
    }));
    // local mirror for sync unreadCount in auth.js
    try{localStorage.setItem('designr.notifications.'+u.email,JSON.stringify(_notifications));}catch(e){}
    if(window.DesignrAuth&&window.DesignrAuth.renderNav)window.DesignrAuth.renderNav();
  }

  function loadAll(){return _cache.slice()}
  function getById(id){return _cache.find(p=>p.id===id)||null}
  function listByCategory(c,sub){return _cache.filter(p=>p.category===c&&(!sub||sub==='전체'||p.subcategory===sub))}
  function listByAuthor(key){return _cache.filter(p=>p.authorId===key||p.authorEmail===key)}
  function search(q){q=String(q||'').toLowerCase().trim();if(!q)return[];return _cache.filter(p=>{const t=(p.title||'').toLowerCase()+' '+plainText(p.contentHtml).toLowerCase()+' '+(p.tags||[]).join(' ').toLowerCase();return t.includes(q)})}

  // ===== writes =====
  function _dataUrlToBlob(dataUrl){
    const m=/^data:([^;,]+)?(;base64)?,(.*)$/.exec(dataUrl);
    if(!m)return null;
    const type=m[1]||'application/octet-stream';
    const isB64=!!m[2];
    const raw=isB64?atob(m[3]):decodeURIComponent(m[3]);
    const buf=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)buf[i]=raw.charCodeAt(i);
    return new Blob([buf],{type});
  }
  async function uploadAttachments(files,postIdHint){
    const u=_user();if(!u)return [];
    const out=[];
    for(const f of (files||[])){
      // already uploaded (public URL) → keep as is
      if(f&&f.dataUrl&&/^https?:/.test(f.dataUrl)){out.push(f);continue;}
      // need to upload: either File object (f.file) or data URL string
      let blob=null,name=f.name||'file',size=f.size||0,mime=f.type||'',isImage=f.isImage||/^image\//.test(mime)||/\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(name);
      if(f.file instanceof Blob){blob=f.file;}
      else if(f instanceof Blob){blob=f;name=f.name||name;size=f.size||size;mime=f.type||mime;}
      else if(f.dataUrl&&/^data:/.test(f.dataUrl)){blob=_dataUrlToBlob(f.dataUrl);if(!blob)continue;if(!size)size=blob.size;if(!mime)mime=blob.type;}
      else continue;
      const ext=(name.match(/\.[^.]+$/)||[''])[0];
      const path=u.id+'/'+(postIdHint||'tmp')+'/'+Date.now()+'_'+Math.random().toString(36).slice(2,7)+ext;
      const {data,error}=await sb.storage.from('attachments').upload(path,blob,{cacheControl:'31536000',upsert:false,contentType:mime});
      if(error){console.error('upload',error);continue}
      const {data:pub}=sb.storage.from('attachments').getPublicUrl(data.path);
      out.push({name,size,type:mime,isImage,dataUrl:pub.publicUrl,path:data.path});
    }
    return out;
  }

  async function create(d){
    const u=_user();if(!u)return null;
    const attachments=await uploadAttachments(d.attachments||[]);
    const {data,error}=await sb.from('posts').insert({
      author_id:u.id,
      title:d.title||'',
      content_html:d.contentHtml||'',
      category:d.category||'on-sv',
      subcategory:d.subcategory||'',
      tags:d.tags||[],
      attachments
    }).select('*,profiles!posts_author_id_fkey(email,nickname)').single();
    if(error){console.error(error);return null}
    const post=mapPost(data);
    _cache.unshift(post);
    return post;
  }

  async function update(id,d){
    const u=_user();if(!u)return null;
    const cur=getById(id);if(!cur)return null;
    if(cur.authorId!==u.id)return null;
    const attachments=await uploadAttachments(d.attachments||cur.attachments||[],id);
    const patch={
      title:d.title??cur.title,
      content_html:d.contentHtml??cur.contentHtml,
      category:d.category??cur.category,
      subcategory:d.subcategory??cur.subcategory,
      tags:Array.isArray(d.tags)?d.tags:cur.tags,
      attachments,
      updated_at:new Date().toISOString()
    };
    const {data,error}=await sb.from('posts').update(patch).eq('id',id).select('*,profiles!posts_author_id_fkey(email,nickname)').single();
    if(error){console.error(error);return null}
    const idx=_cache.findIndex(p=>p.id===id);
    const newPost=mapPost(data);
    newPost.likes=cur.likes;newPost.comments=cur.comments;
    if(idx>=0)_cache[idx]=newPost;
    return newPost;
  }

  async function remove(id){
    const u=_user();if(!u)return false;
    const cur=getById(id);if(!cur)return false;
    if(cur.authorId!==u.id)return false;
    const {error}=await sb.from('posts').delete().eq('id',id);
    if(error){console.error(error);return false}
    _cache=_cache.filter(p=>p.id!==id);
    return true;
  }

  async function incView(id){
    if(!window.sb)return;
    try{await sb.rpc('increment_views',{p_id:id});}catch(e){}
    const p=getById(id);if(p)p.views=(p.views||0)+1;
  }

  // ===== likes / bookmarks / follows =====
  function hasLiked(id){return _likedSet.has(id)}
  function hasBookmarked(id){return _bookmarkedSet.has(id)}
  function isFollowing(authorId){return _followingSet.has(authorId)}

  async function toggleLike(id){
    const u=_user();if(!u)return null;
    const post=getById(id);if(!post)return null;
    let liked;
    if(_likedSet.has(id)){
      const {error}=await sb.from('likes').delete().eq('user_id',u.id).eq('post_id',id);
      if(error){console.error(error);return null}
      _likedSet.delete(id);post.likes=Math.max(0,(post.likes||0)-1);liked=false;
    }else{
      const {error}=await sb.from('likes').insert({user_id:u.id,post_id:id});
      if(error){console.error(error);return null}
      _likedSet.add(id);post.likes=(post.likes||0)+1;liked=true;
      // notification to author
      if(post.authorId&&post.authorId!==u.id){
        await sb.from('notifications').insert({recipient_id:post.authorId,actor_id:u.id,type:'like',post_id:id});
      }
    }
    return {liked,count:post.likes};
  }

  async function toggleBookmark(id){
    const u=_user();if(!u)return null;
    let on;
    if(_bookmarkedSet.has(id)){
      const {error}=await sb.from('bookmarks').delete().eq('user_id',u.id).eq('post_id',id);
      if(error){console.error(error);return null}
      _bookmarkedSet.delete(id);on=false;
    }else{
      const {error}=await sb.from('bookmarks').insert({user_id:u.id,post_id:id});
      if(error){console.error(error);return null}
      _bookmarkedSet.add(id);on=true;
    }
    return on;
  }
  function listBookmarked(){return _cache.filter(p=>_bookmarkedSet.has(p.id))}

  async function toggleFollow(targetEmailOrId){
    const u=_user();if(!u)return null;
    // accept email or id; resolve to id
    let authorId=targetEmailOrId;
    if(targetEmailOrId&&!/^[0-9a-f-]{36}$/i.test(targetEmailOrId)){
      const p=_cache.find(x=>x.authorEmail===targetEmailOrId);
      if(p)authorId=p.authorId;
      else{
        const {data}=await sb.from('profiles').select('id').eq('email',targetEmailOrId).maybeSingle();
        if(!data)return null;authorId=data.id;
      }
    }
    let on;
    if(_followingSet.has(authorId)){
      await sb.from('follows').delete().eq('follower_id',u.id).eq('author_id',authorId);
      _followingSet.delete(authorId);on=false;
    }else{
      await sb.from('follows').insert({follower_id:u.id,author_id:authorId});
      _followingSet.add(authorId);on=true;
      if(authorId&&authorId!==u.id){
        await sb.from('notifications').insert({recipient_id:authorId,actor_id:u.id,type:'follow'});
      }
    }
    return on;
  }
  async function followerCount(authorEmailOrId){
    let authorId=authorEmailOrId;
    if(authorEmailOrId&&!/^[0-9a-f-]{36}$/i.test(authorEmailOrId)){
      const p=_cache.find(x=>x.authorEmail===authorEmailOrId);
      if(p)authorId=p.authorId;
      else return 0;
    }
    const {count}=await sb.from('follows').select('*',{count:'exact',head:true}).eq('author_id',authorId);
    return count||0;
  }

  function neighborPosts(postId){
    const p=getById(postId);if(!p)return{prev:null,next:null};
    const same=_cache.filter(x=>x.category===p.category);
    const i=same.findIndex(x=>x.id===p.id);
    return{prev:i>0?same[i-1]:null,next:i>=0&&i<same.length-1?same[i+1]:null};
  }

  // ===== comments =====
  async function listComments(postId){
    if(!window.sb)return[];
    const {data}=await sb.from('comments').select('*,profiles!comments_author_id_fkey(email,nickname)').eq('post_id',postId).order('created_at',{ascending:true});
    return (data||[]).map(r=>({
      id:r.id,parentId:r.parent_id,
      authorId:r.author_id,
      authorEmail:r.profiles?.email||'',
      authorNickname:r.profiles?.nickname||'',
      text:r.text,
      createdAt:new Date(r.created_at).getTime()
    }));
  }
  async function addComment(postId,text,parentId){
    const u=_user();if(!u)return null;
    text=String(text||'').trim();if(!text)return null;
    const {data,error}=await sb.from('comments').insert({post_id:postId,parent_id:parentId||null,author_id:u.id,text}).select('*,profiles!comments_author_id_fkey(email,nickname)').single();
    if(error){console.error(error);return null}
    // notification
    const post=getById(postId);
    if(parentId){
      const parents=await sb.from('comments').select('author_id').eq('id',parentId).maybeSingle();
      const pa=parents.data?.author_id;
      if(pa&&pa!==u.id){
        await sb.from('notifications').insert({recipient_id:pa,actor_id:u.id,type:'reply',post_id:postId,comment_id:data.id,text_preview:text.slice(0,80)});
      }
    }else if(post&&post.authorId&&post.authorId!==u.id){
      await sb.from('notifications').insert({recipient_id:post.authorId,actor_id:u.id,type:'comment',post_id:postId,comment_id:data.id,text_preview:text.slice(0,80)});
    }
    if(post)post.comments=(post.comments||0)+1;
    return {
      id:data.id,parentId:data.parent_id,
      authorId:data.author_id,
      authorEmail:data.profiles?.email||u.email,
      authorNickname:data.profiles?.nickname||u.nickname,
      text:data.text,createdAt:new Date(data.created_at).getTime()
    };
  }
  async function removeComment(postId,commentId){
    if(!window.sb)return false;
    const {error}=await sb.from('comments').delete().eq('id',commentId);
    if(error){console.error(error);return false}
    const post=getById(postId);if(post)post.comments=Math.max(0,(post.comments||0)-1);
    return true;
  }

  // ===== notifications (server-backed) =====
  function getNotifications(){return _notifications.slice()}
  function unreadCount(){return _notifications.filter(n=>!n.read).length}
  async function markAllRead(){
    const u=_user();if(!u||!window.sb)return;
    await sb.from('notifications').update({read:true}).eq('recipient_id',u.id).eq('read',false);
    _notifications.forEach(n=>n.read=true);
    try{localStorage.setItem('designr.notifications.'+u.email,JSON.stringify(_notifications));}catch(e){}
    if(window.DesignrAuth&&window.DesignrAuth.renderNav)window.DesignrAuth.renderNav();
  }
  async function removeNotification(_email,id){
    if(!window.sb)return;
    await sb.from('notifications').delete().eq('id',id);
    _notifications=_notifications.filter(n=>n.id!==id);
    const u=_user();
    if(u)try{localStorage.setItem('designr.notifications.'+u.email,JSON.stringify(_notifications));}catch(e){}
  }
  async function clearAllNotifications(){
    const u=_user();if(!u||!window.sb)return;
    await sb.from('notifications').delete().eq('recipient_id',u.id);
    _notifications=[];
    try{localStorage.setItem('designr.notifications.'+u.email,JSON.stringify([]));}catch(e){}
  }

  // ===== search history (local-only for simplicity) =====
  const RECENT_MAX=10;
  function _recentKey(){const u=_user();return 'designr.recent.'+(u?u.email:'guest')}
  function getRecentSearches(){try{return JSON.parse(localStorage.getItem(_recentKey()))||[]}catch(e){return[]}}
  function removeRecentSearch(q){let r=getRecentSearches().filter(x=>x!==q);localStorage.setItem(_recentKey(),JSON.stringify(r))}
  function clearRecentSearches(){localStorage.setItem(_recentKey(),'[]')}
  function recordSearch(q){q=String(q||'').trim();if(!q)return;let r=getRecentSearches().filter(x=>x!==q);r.unshift(q);if(r.length>RECENT_MAX)r.length=RECENT_MAX;localStorage.setItem(_recentKey(),JSON.stringify(r));let pop={};try{pop=JSON.parse(localStorage.getItem('designr.popular'))||{}}catch(e){}pop[q]=(pop[q]||0)+1;localStorage.setItem('designr.popular',JSON.stringify(pop))}
  function getPopularSearches(){let p={};try{p=JSON.parse(localStorage.getItem('designr.popular'))||{}}catch(e){}return Object.entries(p).map(([q,n])=>({q,n})).sort((a,b)=>b.n-a.n||a.q.localeCompare(b.q)).slice(0,10)}

  // ===== render helpers (UI markup) =====
  function pitemHtml(p){
    const detailUrl='community-detail.html?id='+encodeURIComponent(p.id);
    const ex=plainText(p.contentHtml).slice(0,140);
    const thumb=firstImage(p);
    const thumbHtml=thumb?'<div class="pitem-thumb" style="background-image:url(\''+thumb+'\');background-size:cover;background-position:center"></div>':'<div class="pitem-thumb th1">'+escapeHtml((CATEGORIES[p.category]||CATEGORIES['on-sv']).name||'').replace(/\s+/g,'<br>')+'</div>';
    const tagsHtml=(p.tags||[]).slice(0,2).map(t=>'<span class="tag tag-sub">'+escapeHtml(t)+'</span>').join('');
    const init=escapeHtml((p.authorNickname||'?').charAt(0).toUpperCase());
    const color=authorColor(p.authorEmail||p.authorNickname);
    return '<div class="pitem" onclick="location.href=\''+detailUrl+'\'">'+
      '<div class="pitem-body">'+
        '<div class="pitem-tags">'+catBadge(p.category)+(p.subcategory?'<span class="tag tag-sub">'+escapeHtml(p.subcategory)+'</span>':'')+tagsHtml+'</div>'+
        '<div class="pitem-title">'+escapeHtml(p.title)+'</div>'+
        '<div class="pitem-exc">'+escapeHtml(ex)+'</div>'+
        '<div class="pitem-foot"><div class="p-auth"><div class="pav" style="background:'+color+';color:#fff;font-weight:700">'+init+'</div><span class="p-name">'+escapeHtml(p.authorNickname)+'</span></div><span class="p-sep">·</span><span class="p-date">'+relativeTime(p.createdAt)+'</span><div class="p-stats"><div class="p-st"><span class="material-icons-round">visibility</span>'+(p.views||0)+'</div></div></div>'+
      '</div>'+thumbHtml+'</div>';
  }

  function gitemHtml(p){
    const detailUrl='community-detail.html?id='+encodeURIComponent(p.id);
    const thumb=firstImage(p);
    const colorIdx=(p.id.split('').reduce((s,c)=>s+c.charCodeAt(0),0)%8)+1;
    const heights=['gt-tall','gt-med','gt-short','gt-wide'];
    const hCls=heights[Math.abs(p.id.length+p.title.length)%heights.length];
    const thumbHtml=thumb?'<img class="g-thumb-img" src="'+thumb+'" alt="'+escapeHtml(p.title)+'" style="width:100%;height:auto;display:block">':'<div class="g-thumb-img gc-'+colorIdx+' '+hCls+'">'+escapeHtml((CATEGORIES[p.category]||CATEGORIES['on-sv']).name||'')+'</div>';
    const tagsHtml=(p.tags||[]).slice(0,3).map(t=>'<span class="tag tag-sub">'+escapeHtml(t)+'</span>').join('');
    const init=escapeHtml((p.authorNickname||'?').charAt(0).toUpperCase());
    const color=authorColor(p.authorEmail||p.authorNickname);
    return '<div class="gitem" onclick="location.href=\''+detailUrl+'\'">'+
      '<div class="g-thumb">'+thumbHtml+'<div class="g-overlay"><button class="g-ov-btn">자세히 보기</button></div></div>'+
      '<div class="g-info">'+
        '<div class="g-tags">'+(p.subcategory?'<span class="tag tag-cat">'+escapeHtml(p.subcategory)+'</span>':'')+tagsHtml+'</div>'+
        '<div class="g-title">'+escapeHtml(p.title)+'</div>'+
        '<div class="g-foot"><div class="g-name" style="display:flex;align-items:center;gap:6px"><span style="width:20px;height:20px;border-radius:50%;background:'+color+';color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;line-height:1">'+init+'</span>'+escapeHtml(p.authorNickname)+'</div><span class="g-sep">·</span><span class="g-date">'+relativeTime(p.createdAt)+'</span><span class="g-sep">·</span><span class="g-date"><span class="material-icons-round" style="font-size:13px;vertical-align:-2px">visibility</span> '+(p.views||0)+'</span></div>'+
      '</div></div>';
  }

  function qitemHtml(p){
    const detailUrl='community-detail.html?id='+encodeURIComponent(p.id);
    const ex=plainText(p.contentHtml).slice(0,160);
    const tagsHtml=(p.tags||[]).slice(0,3).map(t=>'<span class="tag tag-sub">'+escapeHtml(t)+'</span>').join('');
    const init=escapeHtml((p.authorNickname||'?').charAt(0).toUpperCase());
    const color=authorColor(p.authorEmail||p.authorNickname);
    return '<div class="qi" onclick="location.href=\''+detailUrl+'\'">'+
      '<div class="qi-top"><div class="qi-icon"><span class="material-icons-round">help_outline</span></div>'+
      '<div class="qi-content">'+
        '<div class="qi-tags">'+(p.subcategory?'<span class="tag tag-sub" style="background:#FFF8EC;color:#E8930B">'+escapeHtml(p.subcategory)+'</span>':'')+tagsHtml+'</div>'+
        '<div class="qi-title">'+escapeHtml(p.title)+'</div>'+
        '<div class="qi-body">'+escapeHtml(ex)+'</div>'+
        '<div class="qi-foot"><div class="p-auth"><div class="pav" style="background:'+color+';color:#fff;font-weight:700">'+init+'</div><span class="p-name">'+escapeHtml(p.authorNickname)+'</span></div><span class="p-sep">·</span><span class="p-date">'+relativeTime(p.createdAt)+'</span><div class="qi-stats"><div class="qst"><span class="material-icons-round">visibility</span>'+(p.views||0)+'</div><div class="qst"><span class="material-icons-round">chat_bubble_outline</span>'+(p.comments||0)+'</div></div></div>'+
      '</div></div></div>';
  }

  function renderPagination(total,page){
    const pagi=document.querySelector('.pagi');if(!pagi)return;
    const pages=Math.ceil(total/PER_PAGE);
    if(pages<=1){pagi.style.display='none';pagi.innerHTML='';return}
    pagi.style.display='';
    const params=new URLSearchParams(location.search);
    const linkFor=p=>{const sp=new URLSearchParams(params);sp.set('p',p);return location.pathname+'?'+sp.toString()};
    let html='<button class="pgb"'+(page<=1?' disabled':' onclick="location.href=\''+linkFor(page-1)+'\'"')+'><span class="material-icons-round">chevron_left</span></button>';
    for(let i=1;i<=pages;i++)html+='<button class="pgb'+(i===page?' on':'')+'" onclick="location.href=\''+linkFor(i)+'\'">'+i+'</button>';
    html+='<button class="pgb"'+(page>=pages?' disabled':' onclick="location.href=\''+linkFor(page+1)+'\'"')+'><span class="material-icons-round">chevron_right</span></button>';
    pagi.innerHTML=html;
  }

  function rewriteWriteLinks(){
    const file=location.pathname.split('/').pop()||'';
    const cat=PAGE_CAT[file];if(!cat)return;
    document.querySelectorAll('a').forEach(a=>{
      const href=a.getAttribute('href');
      if(!href||!/(^|\/)community-write\.html(\?|$)/.test(href))return;
      try{const u=new URL(href,location.href);if(u.searchParams.get('id'))return;u.searchParams.set('cat',cat);a.setAttribute('href',u.pathname.split('/').pop()+(u.search?u.search:''));}catch(e){}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',rewriteWriteLinks);
  else rewriteWriteLinks();

  async function injectIntoListPage(){
    await ready;
    rewriteWriteLinks();
    const file=location.pathname.split('/').pop()||'';
    const cat=PAGE_CAT[file];if(!cat){renderPagination(0,1);return}
    const list=document.querySelector('.post-list');if(!list){renderPagination(0,1);return}
    const params=new URLSearchParams(location.search);
    const sub=params.get('sub')||'';
    document.querySelectorAll('.chips .chip, .ftabs .ftab').forEach(c=>{
      const t=(c.textContent||'').trim();
      const active=(!sub&&t==='전체')||(sub&&t===sub);
      c.classList.toggle('on',active);
      c.onclick=(()=>{const sp=new URLSearchParams(location.search);if(t==='전체')sp.delete('sub');else sp.set('sub',t);sp.delete('p');location.search=sp.toString()});
    });
    const all=listByCategory(cat,sub);
    const total=all.length;
    let page=parseInt(params.get('p'),10)||1;
    const pages=Math.max(1,Math.ceil(total/PER_PAGE));
    if(page<1)page=1;if(page>pages)page=pages;
    renderPagination(total,page);
    if(!total){
      const empty=list.querySelector('#emptyState');
      if(empty){const title=empty.querySelector('div');if(title&&sub)title.textContent='"'+sub+'" 분류의 글이 아직 없어요'}
      return;
    }
    const empty=list.querySelector('#emptyState');if(empty)empty.remove();
    const slice=all.slice((page-1)*PER_PAGE,page*PER_PAGE);
    const tpl=cat==='on-pf'?gitemHtml:cat==='on-qa'?qitemHtml:pitemHtml;
    list.innerHTML=slice.map(tpl).join('');
  }

  // ===== init =====
  (async function(){
    if(window.DesignrAuth&&window.DesignrAuth.ready)await window.DesignrAuth.ready;
    try{await refreshCache();}catch(e){console.error('cache init',e);}
    _resolveReady();
    if(window.DesignrAuth&&window.DesignrAuth.renderNav)window.DesignrAuth.renderNav();
    injectIntoListPage();
  })();

  window.DesignrPosts={
    MAX_FILES,MAX_BYTES,CATEGORIES,SUBCATS,ready,
    loadAll,getById,listByCategory,listByAuthor,listBookmarked,search,
    create,update,remove,incView,refreshCache,
    hasLiked,hasBookmarked,toggleLike,toggleBookmark,
    addComment,removeComment,listComments,toast,
    getNotifications,unreadCount,markAllRead,removeNotification,clearAllNotifications,
    isFollowing,toggleFollow,followerCount,neighborPosts,
    recordSearch,getRecentSearches,removeRecentSearch,clearRecentSearches,getPopularSearches,
    readFileAsDataURL,formatSize,formatDate,relativeTime,escapeHtml,
    plainText,firstImage,catBadge,pitemHtml,gitemHtml,qitemHtml,
    authorColor,avatarHtml,enhanceYoutube
  };
})();
