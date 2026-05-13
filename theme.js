(function(){
  const KEY='designr.theme';
  let saved=null;try{saved=localStorage.getItem(KEY)}catch(e){}
  const sysDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial=saved||(sysDark?'dark':'light');
  document.documentElement.setAttribute('data-theme',initial);

  const css=`
[data-theme="dark"]{
  --bg:#15171F;--bg-2:#1F2230;--bg-3:#2A2D3A;
  --ink:#E5E7EB;--ink-2:#B0B4BC;--ink-3:#7A7E88;
  --line:#2E3140;--line-2:#3A3E4F;
  --blue-lt:#1A2A4A;--cat-lt:#3D1C24;
  --sh-1:0 1px 4px rgba(0,0,0,.45);--sh-2:0 4px 16px rgba(0,0,0,.55);--sh-3:0 8px 32px rgba(0,0,0,.6);
}
[data-theme="dark"] body{background:var(--bg);color:var(--ink)}
[data-theme="dark"] nav{background:rgba(21,23,31,.92)!important;border-bottom-color:var(--line)!important}
[data-theme="dark"] .logo,[data-theme="dark"] .gnb-mdr-logo{color:var(--ink)!important}
[data-theme="dark"] .nm a{color:var(--ink-2)!important}
[data-theme="dark"] .nm a:hover{background:var(--bg-2)!important;color:var(--ink)!important}
[data-theme="dark"] .gnb-icon{color:var(--ink-2)!important}
[data-theme="dark"] .gnb-icon:hover{background:var(--bg-2)!important;color:var(--ink)!important}
[data-theme="dark"] .gnb-login{color:var(--ink)!important;border-color:var(--line-2)!important;background:transparent!important}
[data-theme="dark"] .gnb-login:hover{background:var(--bg-2)!important;border-color:var(--blue)!important;color:var(--blue)!important}
[data-theme="dark"] .gnb-burger{color:var(--ink)!important}
[data-theme="dark"] .gnb-mdr{background:var(--bg)!important}
[data-theme="dark"] .gnb-mdr a{color:var(--ink-2)!important}
[data-theme="dark"] .gnb-mdr a:hover,[data-theme="dark"] .gnb-mdr a.active{background:var(--bg-2)!important;color:var(--ink)!important}
[data-theme="dark"] .gnb-mdr-acts{border-top-color:var(--line)!important}
[data-theme="dark"] .gnb-footer{background:var(--bg-2)!important;border-top-color:var(--line)!important}
[data-theme="dark"] .gnb-footer-brand,[data-theme="dark"] .gnb-fcol h4{color:var(--ink)!important}
[data-theme="dark"] .gnb-footer-desc,[data-theme="dark"] .gnb-fcol ul a,[data-theme="dark"] .gnb-footer-bottom{color:var(--ink-3)!important}
[data-theme="dark"] .gnb-footer-bottom{border-top-color:var(--line)!important}
[data-theme="dark"] .gnb-footer-sns-btn{background:var(--bg)!important;border-color:var(--line)!important;color:var(--ink-2)!important}
[data-theme="dark"] .mob-search{background:rgba(0,0,0,.7)!important}
[data-theme="dark"] .mob-search-inner{background:var(--bg)!important}
[data-theme="dark"] .mob-search-bar{background:var(--bg-2)!important}
[data-theme="dark"] .mob-search-bar input{background:transparent!important;color:var(--ink)!important}
[data-theme="dark"] .mob-stag{background:var(--bg-2)!important;border-color:var(--line)!important;color:var(--ink-2)!important}
[data-theme="dark"] input,[data-theme="dark"] textarea,[data-theme="dark"] select{background:var(--bg-2)!important;color:var(--ink)!important;border-color:var(--line)!important;color-scheme:dark}
[data-theme="dark"] input::placeholder,[data-theme="dark"] textarea::placeholder{color:var(--ink-3)!important}
[data-theme="dark"] .editor-card,[data-theme="dark"] .scard,[data-theme="dark"] .auth-box,[data-theme="dark"] .pitem,[data-theme="dark"] .gitem,[data-theme="dark"] .qi,[data-theme="dark"] .hcard{background:var(--bg)!important;border-color:var(--line)!important}
[data-theme="dark"] .editor-body,[data-theme="dark"] .editor-body *{color:var(--ink)}
[data-theme="dark"] .toolbar{border-bottom-color:var(--line)!important}
[data-theme="dark"] .tb-btn{color:var(--ink-2)!important}
[data-theme="dark"] .tb-btn:hover{background:var(--bg-2)!important;color:var(--ink)!important}
[data-theme="dark"] .cat-bar,[data-theme="dark"] .cat-bar-inner{background:var(--bg)!important;border-color:var(--line)!important}
[data-theme="dark"] .cat-tab{color:var(--ink-2)!important}
[data-theme="dark"] .cat-tab.on{color:var(--blue)!important;border-bottom-color:var(--blue)!important}
[data-theme="dark"] .cc{background:var(--bg)!important;color:var(--ink-2)!important;border-color:var(--line)!important}
[data-theme="dark"] .chip,[data-theme="dark"] .ftab,[data-theme="dark"] .sb,[data-theme="dark"] .ntab{background:var(--bg)!important;color:var(--ink-2)!important;border-color:var(--line)!important}
[data-theme="dark"] .ntab.on,[data-theme="dark"] .sb.on{background:var(--blue)!important;color:#fff!important}
[data-theme="dark"] .chip.on,[data-theme="dark"] .ftab.on{background:var(--blue-lt)!important;color:var(--blue)!important;border-color:var(--blue)!important}
[data-theme="dark"] .my-nav,[data-theme="dark"] .my-main{background:transparent!important}
[data-theme="dark"] .my-nav{background:var(--bg)!important;border-color:var(--line)!important}
[data-theme="dark"] .mm-item{color:var(--ink-2)!important}
[data-theme="dark"] .mm-item:hover{background:var(--bg-2)!important;color:var(--ink)!important}
[data-theme="dark"] .mm-item.on{background:var(--blue-lt)!important;color:var(--blue)!important}
[data-theme="dark"] .att-open,[data-theme="dark"] .af-item{background:var(--bg-2)!important;border-color:var(--line)!important;color:var(--ink)!important}
[data-theme="dark"] .scard-h,[data-theme="dark"] .scard-b{background:transparent!important;border-color:var(--line)!important}
[data-theme="dark"] mark{background:#4a3d00!important;color:#ffe066!important}
[data-theme="dark"] .pitem-title,[data-theme="dark"] .g-title,[data-theme="dark"] .qi-title{color:var(--ink)!important}
[data-theme="dark"] .react-bar{border-color:var(--line)!important}
[data-theme="dark"] .rbtn,[data-theme="dark"] .sbtn,[data-theme="dark"] .meta-act{background:var(--bg)!important;border-color:var(--line)!important;color:var(--ink-2)!important}
[data-theme="dark"] .ci-av{filter:brightness(.95)}
[data-theme="dark"] .cm-ta{background:var(--bg)!important;border-color:var(--line)!important;color:var(--ink)!important}
[data-theme="dark"] .cm-reply-input{background:var(--bg-2)!important}
[data-theme="dark"] .ni{background:var(--bg)!important;border-color:var(--line)!important}
[data-theme="dark"] .ni.unread{background:#1A2540!important}
[data-theme="dark"] .noti-item{background:var(--bg)!important;border-color:var(--line)!important;color:var(--ink)!important}
[data-theme="dark"] .noti-item.unread{background:#1A2540!important}
[data-theme="dark"] .promo-band{background:var(--bg-2)!important}
[data-theme="dark"] .nl-card,[data-theme="dark"] .side-card{background:var(--bg)!important;border-color:var(--line)!important;color:var(--ink)!important}

/* === article body text (critical: was hardcoded #2C2C2C, invisible on dark) === */
[data-theme="dark"] .art-body,[data-theme="dark"] .art-body *,
[data-theme="dark"] .q-body,[data-theme="dark"] .q-body *,
[data-theme="dark"] .ans-body,[data-theme="dark"] .ans-body *,
[data-theme="dark"] .cbody,[data-theme="dark"] .cm-text{color:var(--ink)!important}
[data-theme="dark"] .art-title,[data-theme="dark"] .q-title,[data-theme="dark"] .ans-title{color:var(--ink)!important}
[data-theme="dark"] .art-meta,[data-theme="dark"] .art-author-meta,[data-theme="dark"] .crumb,[data-theme="dark"] .breadcrumb,[data-theme="dark"] .breadcrumb *{color:var(--ink-3)!important}
[data-theme="dark"] .art-body a{color:#7BAFFF!important}
[data-theme="dark"] .art-body blockquote{border-left-color:var(--line-2)!important;color:var(--ink-2)!important}
[data-theme="dark"] .art-body hr{border-color:var(--line)!important}
[data-theme="dark"] .art-body pre,[data-theme="dark"] .editor-body pre,[data-theme="dark"] .prompt-text,[data-theme="dark"] .contract-text{background:var(--bg-2)!important;color:var(--ink)!important;border-color:var(--line)!important}
[data-theme="dark"] .art-body code,[data-theme="dark"] .editor-body code{background:var(--bg-2)!important;color:#FFB86C!important}
[data-theme="dark"] .art-body table th{background:var(--bg-2)!important;color:var(--ink)!important;border-color:var(--line)!important}
[data-theme="dark"] .art-body table td{border-color:var(--line)!important;color:var(--ink)!important}
[data-theme="dark"] .income-table th,[data-theme="dark"] .income-table td{border-color:var(--line)!important;color:var(--ink)!important}
[data-theme="dark"] .prompt-box,[data-theme="dark"] .contract-box{background:var(--bg-2)!important;border-color:var(--line)!important}
[data-theme="dark"] .prompt-label,[data-theme="dark"] .contract-label{color:var(--ink-3)!important}
[data-theme="dark"] .prompt-copy{background:var(--bg-3)!important;border-color:var(--line)!important;color:var(--ink-2)!important}

/* === warn / alert boxes === */
[data-theme="dark"] .warn-box,[data-theme="dark"] .attach-alert{background:rgba(249,115,22,.10)!important;border-color:#F97316!important;color:var(--ink)!important}
[data-theme="dark"] .warn-box *,[data-theme="dark"] .attach-alert *{color:var(--ink)!important}
[data-theme="dark"] .warn-label,[data-theme="dark"] .warn-box .warn-label{color:#FB923C!important}
[data-theme="dark"] .good{color:#4ADE80!important}
[data-theme="dark"] .bad{color:#F87171!important}

/* === filters / sticky bars === */
[data-theme="dark"] .filter-tabs,[data-theme="dark"] .sticky-bar,[data-theme="dark"] .sort-bar{background:var(--bg)!important;border-color:var(--line)!important;color:var(--ink-2)!important}

/* === inline-style fallbacks (catch hardcoded colors in HTML inline styles) === */
[data-theme="dark"] [style*="color:#191919"],[data-theme="dark"] [style*="color: #191919"]{color:var(--ink)!important}
[data-theme="dark"] [style*="color:#2C2C2C"],[data-theme="dark"] [style*="color: #2C2C2C"]{color:var(--ink)!important}
[data-theme="dark"] [style*="color:#333"],[data-theme="dark"] [style*="color: #333"]{color:var(--ink)!important}
[data-theme="dark"] [style*="color:#555"],[data-theme="dark"] [style*="color: #555"]{color:var(--ink-2)!important}
[data-theme="dark"] [style*="color:#666"],[data-theme="dark"] [style*="color: #666"]{color:var(--ink-2)!important}
[data-theme="dark"] [style*="color:#777"],[data-theme="dark"] [style*="color: #777"]{color:var(--ink-2)!important}
[data-theme="dark"] [style*="color:#888"],[data-theme="dark"] [style*="color: #888"]{color:var(--ink-3)!important}
[data-theme="dark"] [style*="color:#999"],[data-theme="dark"] [style*="color: #999"]{color:var(--ink-3)!important}
[data-theme="dark"] [style*="color:#AAA"],[data-theme="dark"] [style*="color:#aaa"],[data-theme="dark"] [style*="color: #aaa"]{color:var(--ink-3)!important}
[data-theme="dark"] [style*="background:#fff"],[data-theme="dark"] [style*="background: #fff"],[data-theme="dark"] [style*="background:#FFF"]{background:var(--bg)!important}
[data-theme="dark"] [style*="background:#F7F8FA"],[data-theme="dark"] [style*="background:#f7f8fa"]{background:var(--bg-2)!important}
[data-theme="dark"] [style*="background:#FAFBFC"],[data-theme="dark"] [style*="background:#fafbfc"]{background:var(--bg-2)!important}
[data-theme="dark"] [style*="background:#EDEEF0"],[data-theme="dark"] [style*="background:#edeef0"]{background:var(--bg-3)!important}
[data-theme="dark"] [style*="border:1px solid #E4E5E7"],[data-theme="dark"] [style*="border: 1px solid #E4E5E7"]{border-color:var(--line)!important}
[data-theme="dark"] [style*="border-color:#E4E5E7"]{border-color:var(--line)!important}

#themeToggle{transition:transform .25s ease}
#themeToggle:hover{transform:rotate(15deg)}
`;
  const s=document.createElement('style');s.id='designr-theme-overrides';s.textContent=css;
  if(document.head)document.head.appendChild(s);
  else document.addEventListener('DOMContentLoaded',()=>document.head.appendChild(s));

  function current(){return document.documentElement.getAttribute('data-theme')||'light'}
  function set(t){
    document.documentElement.setAttribute('data-theme',t);
    try{localStorage.setItem(KEY,t)}catch(e){}
    const ic=document.querySelector('#themeToggle .material-icons-round');
    if(ic)ic.textContent=t==='dark'?'light_mode':'dark_mode';
  }
  function toggle(){set(current()==='dark'?'light':'dark')}

  function inject(){
    const navR=document.querySelector('.nav-r');
    if(navR&&!document.getElementById('themeToggle')){
      const btn=document.createElement('button');
      btn.id='themeToggle';
      btn.type='button';
      btn.className='gnb-icon';
      btn.setAttribute('aria-label','테마 전환');
      btn.title='라이트/다크 모드 전환';
      btn.innerHTML='<span class="material-icons-round">'+(current()==='dark'?'light_mode':'dark_mode')+'</span>';
      btn.addEventListener('click',toggle);
      const bell=navR.querySelector('button[aria-label="알림"]');
      navR.insertBefore(btn,bell||navR.firstChild);
    }
    const mobActs=document.querySelector('.gnb-mdr-acts');
    if(mobActs&&!document.getElementById('themeToggleMob')){
      const link=document.createElement('a');
      link.id='themeToggleMob';
      link.href='#';
      link.style.cssText='display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 18px;border-radius:100px;border:1.5px solid var(--line-2);font-size:14px;font-weight:600;color:var(--ink);text-decoration:none';
      link.innerHTML='<span class="material-icons-round" style="font-size:18px">'+(current()==='dark'?'light_mode':'dark_mode')+'</span>'+(current()==='dark'?'라이트 모드':'다크 모드');
      link.addEventListener('click',e=>{
        e.preventDefault();toggle();
        const ic=link.querySelector('.material-icons-round');
        if(ic)ic.textContent=current()==='dark'?'light_mode':'dark_mode';
        link.lastChild.textContent=current()==='dark'?'라이트 모드':'다크 모드';
      });
      mobActs.appendChild(link);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);
  else inject();

  window.DesignrTheme={current,set,toggle};
})();
