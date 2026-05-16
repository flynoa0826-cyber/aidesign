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
[data-theme="dark"] .gnb-burger,[data-theme="dark"] .gnb-mob-srch{color:#ffffff!important}
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
[data-theme="dark"] .search-sticky{background:var(--bg)!important;border-bottom-color:var(--line)!important}
[data-theme="dark"] .search-bar{background:var(--bg-2)!important}
[data-theme="dark"] .search-input{background:transparent!important;color:var(--ink)!important;border-color:transparent!important}
[data-theme="dark"] .clear-btn{color:var(--ink-3)!important}
[data-theme="dark"] .clear-btn:hover{color:var(--ink)!important}
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
[data-theme="dark"] .cc.on-sv{background:rgba(255,107,53,.15)!important;border-color:#FF6B35!important;color:#FFB089!important;font-weight:600!important}
[data-theme="dark"] .cc.on-ai{background:rgba(108,59,245,.18)!important;border-color:#8E63FF!important;color:#C7B3FF!important;font-weight:600!important}
[data-theme="dark"] .cc.on-ca{background:rgba(11,173,117,.18)!important;border-color:#10C98A!important;color:#7ADEBE!important;font-weight:600!important}
[data-theme="dark"] .cc.on-pf{background:rgba(232,51,93,.18)!important;border-color:#FF4F76!important;color:#FF96B0!important;font-weight:600!important}
[data-theme="dark"] .cc.on-qa{background:rgba(232,147,11,.18)!important;border-color:#F5A623!important;color:#FFC966!important;font-weight:600!important}
/* category badges (.tag-cat) — dark mode: outlined chip with matching color */
/* === unified category badges (.tc-*) — light & dark mode, used by .tag-cat and .hc-tag === */
.tag-cat,.hc-tag{padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600;border:1.5px solid transparent;display:inline-block;line-height:1.5}
.tc-sv{background:#FFF0E8;border-color:#FF6B35;color:#FF6B35}
.tc-ai{background:#F0ECFE;border-color:#6C3BF5;color:#6C3BF5}
.tc-ca{background:#E6F9F3;border-color:#0BAD75;color:#0BAD75}
.tc-pf{background:#FDEDF1;border-color:#E8335D;color:#E8335D}
.tc-qa{background:#FFF8EC;border-color:#E8930B;color:#E8930B}
[data-theme="dark"] .tc-sv{background:transparent!important;border-color:#FF6B35!important;color:#FFB089!important}
[data-theme="dark"] .tc-ai{background:transparent!important;border-color:#8E63FF!important;color:#C7B3FF!important}
[data-theme="dark"] .tc-ca{background:transparent!important;border-color:#10C98A!important;color:#7ADEBE!important}
[data-theme="dark"] .tc-pf{background:transparent!important;border-color:#FF4F76!important;color:#FF96B0!important}
[data-theme="dark"] .tc-qa{background:transparent!important;border-color:#F5A623!important;color:#FFC966!important}
/* === category page header (.ph) — dark mode: dark bg + cat-color accent === */
[data-theme="dark"] .ph{background:var(--bg-2)!important;border-bottom:1px solid var(--line)!important;position:relative}
[data-theme="dark"] .ph::before{content:'';position:absolute;left:0;top:0;width:100%;height:3px;background:var(--cat);pointer-events:none;z-index:1}
[data-theme="dark"] .ph::after{background:color-mix(in srgb, var(--cat) 10%, transparent)!important}
[data-theme="dark"] .ph-title{color:var(--ink)!important}
[data-theme="dark"] .ph-label{color:var(--cat)!important}
[data-theme="dark"] .ph-desc{color:var(--ink-2)!important}
[data-theme="dark"] .ph-crumb,[data-theme="dark"] .ph-crumb a{color:var(--ink-3)!important}
[data-theme="dark"] .ph-crumb a:hover{color:var(--ink)!important}
[data-theme="dark"] .phs{background:var(--bg)!important;border:1px solid var(--line)!important}
[data-theme="dark"] .phs-n{color:var(--ink)!important}
[data-theme="dark"] .phs-l{color:var(--ink-3)!important}
/* === sidebar CTA banner (.write-banner) — dark mode === */
[data-theme="dark"] .write-banner{background:var(--bg)!important;border:1px solid var(--cat)!important}
[data-theme="dark"] .write-banner::after{background:color-mix(in srgb, var(--cat) 10%, transparent)!important}
[data-theme="dark"] .wb-title{color:var(--ink)!important}
[data-theme="dark"] .wb-desc{color:var(--ink-2)!important}
[data-theme="dark"] .wb-btn{background:var(--cat)!important;color:#fff!important}
[data-theme="dark"] .wb-btn:hover{background:var(--cat)!important;opacity:.85}
/* === portfolio sidebar CTA (.upload-card) — dark mode === */
[data-theme="dark"] .upload-card{background:var(--bg)!important;border:1px solid var(--cat)!important}
[data-theme="dark"] .upload-card::after{background:color-mix(in srgb, var(--cat) 10%, transparent)!important}
[data-theme="dark"] .uc-icon{background:color-mix(in srgb, var(--cat) 20%, transparent)!important}
[data-theme="dark"] .uc-icon .material-icons-round{color:var(--cat)!important}
[data-theme="dark"] .uc-title{color:var(--ink)!important}
[data-theme="dark"] .uc-desc{color:var(--ink-2)!important}
[data-theme="dark"] .uc-btn{background:var(--cat)!important;color:#fff!important}
[data-theme="dark"] .uc-btn:hover{background:var(--cat)!important;opacity:.85}
[data-theme="dark"] .chip,[data-theme="dark"] .ftab,[data-theme="dark"] .sb,[data-theme="dark"] .ntab{background:var(--bg)!important;color:var(--ink-2)!important;border-color:var(--line)!important}
[data-theme="dark"] .ntab.on,[data-theme="dark"] .sb.on{background:var(--blue)!important;color:#fff!important}
[data-theme="dark"] .chip.on,[data-theme="dark"] .ftab.on{background:var(--blue-lt)!important;color:var(--blue)!important;border-color:var(--blue)!important}
[data-theme="dark"] .fbar .ftab.on{background:transparent!important;color:var(--blue)!important;border-color:var(--blue)!important}
[data-theme="dark"] .my-nav,[data-theme="dark"] .my-main{background:transparent!important}
[data-theme="dark"] .my-nav{background:var(--bg)!important;border-color:var(--line)!important}
[data-theme="dark"] .mm-item{color:var(--ink-2)!important}
[data-theme="dark"] .mm-item:hover{background:var(--bg-2)!important;color:var(--ink)!important}
[data-theme="dark"] .mm-item.on{background:var(--blue-lt)!important;color:var(--blue)!important}
[data-theme="dark"] .att-open,[data-theme="dark"] .af-item{background:var(--bg-2)!important;border-color:var(--line)!important;color:var(--ink)!important}
[data-theme="dark"] .af-name{color:#ffffff!important}
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
/* === mobile nav padding: pull search/burger buttons closer to the right edge === */
@media(max-width:900px){.nw{padding:0 16px!important}}
/* === mobile readability: bump 13px text -> 14px, list/card titles 16px -> 18px === */
@media(max-width:600px){
  .pitem-exc,.qi-body,.ri-e,.hot-meta,.w-name,.cat-label,.sec-more,.mob-stag,.nav-status,
  .gnb-footer-desc,.gnb-fcol ul a,.f-desc,.f-col ul a,
  .nl-input,.nl-btn,.nl-desc,.btn-sm,.guide-item,.un-item,
  .ans-meta,.tag-cloud .tg,
  [style*="font-size:13px"]{font-size:14px!important}
  .pitem-title,.qi-title,.g-title,.mp-title{font-size:18px!important}
  /* breadcrumb on detail pages: force single line, ellipsis on the long title */
  .crumb{white-space:nowrap!important;overflow:hidden!important}
  .crumb>a,.crumb>span{flex-shrink:0}
  .crumb>span:last-child{flex-shrink:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
  /* let grid/flex children shrink below their intrinsic content width so
     long titles, nowrap text, and wide images cannot push the page wider
     than the viewport */
  .lay>*,.main>*{min-width:0!important}
}
/* === prevent oversized article images from pushing the page wider than viewport === */
.art-body img,.q-body img,.ans-body img,.editor-body img{max-width:100%!important;height:auto!important;display:block}

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

/* === Dadalla top banner === */
#dadalla-banner{position:relative;display:flex;align-items:center;justify-content:center;gap:12px;padding:10px 48px 10px 20px;background:#15CFA1;color:#0A2F26;font-family:'Noto Sans KR',sans-serif;font-size:13px;font-weight:500;line-height:1.5;text-align:center;z-index:101}
#dadalla-banner .dadalla-link{color:#0A2F26;text-decoration:none;display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center}
#dadalla-banner .dadalla-link:hover{text-decoration:underline}
#dadalla-banner .dadalla-emoji{font-size:16px}
#dadalla-banner .dadalla-cta{font-weight:700;background:#0A2F26;color:#15CFA1;padding:3px 10px;border-radius:100px}
#dadalla-banner .dadalla-close{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:32px;height:32px;border:none;background:transparent;color:#0A2F26;font-size:20px;cursor:pointer;border-radius:50%;display:flex;align-items:center;justify-content:center;line-height:1;opacity:.7;transition:opacity .15s,background .15s}
#dadalla-banner .dadalla-close:hover{opacity:1;background:rgba(0,0,0,.1)}
@media (max-width:640px){
  #dadalla-banner{font-size:12px;padding:9px 40px 9px 14px;gap:8px}
  #dadalla-banner .dadalla-cta{font-size:11px;padding:2px 8px}
  #dadalla-banner .dadalla-msg-long{display:none}
}
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

  function injectBanner(){
    const BANNER_KEY='designr.banner.dadalla.v2';
    const SNOOZE_MS=60*60*1000;
    let dismissed=false;
    try{
      const v=localStorage.getItem(BANNER_KEY);
      if(v){
        const t=parseInt(v,10);
        if(!isNaN(t)&&Date.now()-t<SNOOZE_MS)dismissed=true;
        else if(v==='1')localStorage.removeItem(BANNER_KEY);
      }
    }catch(e){}
    if(dismissed)return;
    if(document.getElementById('dadalla-banner'))return;
    const wrap=document.createElement('div');
    wrap.id='dadalla-banner';
    wrap.innerHTML=
      '<a class="dadalla-link" href="https://dadalla.io" target="_blank" rel="noopener noreferrer">'+
        '<span class="dadalla-emoji">💼</span>'+
        '<span><b>사직서 쓰기 전 잠깐</b><span class="dadalla-msg-long"> — 경제적 해결책부터 확인하세요</span></span>'+
        '<span class="dadalla-cta">dadalla.io →</span>'+
      '</a>'+
      '<button type="button" class="dadalla-close" aria-label="배너 닫기">×</button>';
    document.body.insertBefore(wrap,document.body.firstChild);
    wrap.querySelector('.dadalla-close').addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      try{localStorage.setItem(BANNER_KEY,String(Date.now()))}catch(e2){}
      wrap.remove();
    });
  }

  function inject(){
    injectBanner();
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

  // === mobile swipe navigation between home + category list pages (cyclic) ===
  function initSwipeNav(){
    const PAGES=[
      {file:'index.html',name:'홈'},
      {file:'community-list.html',name:'생존 전략'},
      {file:'community-list-ai.html',name:'AI 실무'},
      {file:'community-list-career.html',name:'커리어 토크'},
      {file:'community-portfolio.html',name:'포트폴리오'},
      {file:'community-list-qa.html',name:'Q&A'}
    ];
    const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    const idx=PAGES.findIndex(p=>p.file===file);
    if(idx<0)return;
    const n=PAGES.length;
    const nextP=PAGES[(idx+1)%n];
    const prevP=PAGES[(idx-1+n)%n];
    const TH=80,MAXY=50,MAXT=600;
    let sx=0,sy=0,st=0,track=false,activeDir=0,canceled=false;
    // overlay
    const css='#designr-swipe-overlay{position:fixed;inset:0;z-index:9999;pointer-events:none;display:none}'+
      '#designr-swipe-overlay.dso-active{display:block}'+
      '#designr-swipe-overlay .dso-bg{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .12s ease-out}'+
      '#designr-swipe-overlay .dso-label{position:absolute;top:80px;left:50%;transform:translateX(-50%) scale(.85);background:rgba(20,20,20,.92);color:#fff;padding:11px 20px;border-radius:100px;font-size:15px;font-weight:700;display:flex;align-items:center;gap:10px;opacity:0;white-space:nowrap;transition:opacity .12s ease-out,transform .12s ease-out;box-shadow:0 8px 32px rgba(0,0,0,.4);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}'+
      '#designr-swipe-overlay .dso-arrow{font-size:18px;line-height:1;font-weight:400}'+
      '#designr-swipe-overlay.dso-spring .dso-bg{transition:opacity .35s ease-out}'+
      '#designr-swipe-overlay.dso-spring .dso-label{transition:opacity .35s cubic-bezier(.34,1.56,.64,1),transform .45s cubic-bezier(.34,1.56,.64,1)}';
    const styleEl=document.createElement('style');styleEl.id='designr-swipe-style';styleEl.textContent=css;
    (document.head||document.documentElement).appendChild(styleEl);
    const ov=document.createElement('div');
    ov.id='designr-swipe-overlay';
    ov.innerHTML='<div class="dso-bg"></div><div class="dso-label"></div>';
    document.body.appendChild(ov);
    const bg=ov.querySelector('.dso-bg');
    const label=ov.querySelector('.dso-label');
    function isInteractive(el){
      while(el&&el!==document.body){
        const tag=el.tagName;
        if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||tag==='BUTTON'||tag==='A')return true;
        if(el.isContentEditable)return true;
        const o=getComputedStyle(el).overflowX;
        if((o==='auto'||o==='scroll')&&el.scrollWidth>el.clientWidth)return true;
        el=el.parentElement;
      }
      return false;
    }
    function setLabel(dx){
      const dir=dx<0?-1:1;
      if(dir!==activeDir){
        activeDir=dir;
        const dest=dir<0?nextP:prevP;
        label.innerHTML=dir<0
          ?'<span class="dso-name">'+dest.name+'</span><span class="dso-arrow">→</span>'
          :'<span class="dso-arrow">←</span><span class="dso-name">'+dest.name+'</span>';
      }
      const progress=Math.min(Math.abs(dx)/TH,1);
      bg.style.opacity=String(0.4*progress);
      label.style.opacity=String(progress);
      label.style.transform='translateX(-50%) scale('+(0.85+0.15*progress)+')';
    }
    function springBack(){
      ov.classList.add('dso-spring');
      bg.style.opacity='0';
      label.style.opacity='0';
      label.style.transform='translateX(-50%) scale(.85)';
      setTimeout(function(){
        ov.classList.remove('dso-active');
        ov.classList.remove('dso-spring');
      },460);
    }
    document.addEventListener('touchstart',function(e){
      if(window.innerWidth>900)return;
      if(e.touches.length!==1)return;
      if(isInteractive(e.target))return;
      const t=e.touches[0];
      sx=t.clientX;sy=t.clientY;st=Date.now();
      track=true;canceled=false;activeDir=0;
    },{passive:true});
    document.addEventListener('touchmove',function(e){
      if(!track||canceled)return;
      const t=e.touches[0];
      const dx=t.clientX-sx;
      const dy=t.clientY-sy;
      if(Math.abs(dy)>MAXY&&Math.abs(dy)>Math.abs(dx)){
        canceled=true;
        if(ov.classList.contains('dso-active'))springBack();
        return;
      }
      if(Math.abs(dx)<15)return;
      ov.classList.remove('dso-spring');
      ov.classList.add('dso-active');
      setLabel(dx);
    },{passive:true});
    document.addEventListener('touchend',function(e){
      if(!track){return;}
      track=false;
      if(canceled){canceled=false;return;}
      const t=e.changedTouches[0];
      const dx=t.clientX-sx,dy=t.clientY-sy,dt=Date.now()-st;
      if(dt>MAXT||Math.abs(dy)>MAXY||Math.abs(dx)<TH){
        if(ov.classList.contains('dso-active'))springBack();
        return;
      }
      // commit: brief flash before navigation
      bg.style.opacity='0.55';
      label.style.opacity='1';
      label.style.transform='translateX(-50%) scale(1.08)';
      setTimeout(function(){
        location.href=dx<0?nextP.file:prevP.file;
      },140);
    },{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initSwipeNav);
  else initSwipeNav();

  window.DesignrTheme={current,set,toggle};
})();
