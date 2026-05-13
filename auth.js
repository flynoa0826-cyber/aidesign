(function(){
  let currentUser=null;
  let _resolveReady;
  const ready=new Promise(r=>{_resolveReady=r});

  async function loadProfile(userId){
    if(!userId||!window.sb)return null;
    const {data,error}=await sb.from('profiles').select('*').eq('id',userId).maybeSingle();
    if(error){console.warn('profile load',error);return null;}
    return data;
  }

  function setUserFromSession(session,profile){
    if(!session||!session.user){currentUser=null;}
    else{
      const u=session.user;
      currentUser={
        id:u.id,
        email:u.email,
        nickname:profile?.nickname||u.email.split('@')[0],
        career:profile?.career||'',
        job:profile?.job||'',
        bio:profile?.bio||'',
        location:profile?.location||''
      };
    }
    try{document.dispatchEvent(new CustomEvent('designr:auth-changed',{detail:{user:currentUser}}));}catch(e){}
  }

  async function init(){
    if(!window.sb){_resolveReady();return;}
    const {data}=await sb.auth.getSession();
    if(data.session){
      const p=await loadProfile(data.session.user.id);
      setUserFromSession(data.session,p);
    }
    renderNav();
    _resolveReady();
    sb.auth.onAuthStateChange(async(event,session)=>{
      if(session){
        const p=await loadProfile(session.user.id);
        setUserFromSession(session,p);
      }else{
        currentUser=null;
      }
      renderNav();
    });
  }

  function getCurrentUser(){return currentUser}

  async function signup({email,nickname,password,career,agreeRequired}){
    email=(email||'').trim().toLowerCase();
    nickname=(nickname||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return{ok:false,err:'올바른 이메일 주소를 입력하세요.'};
    if(nickname.length<2||nickname.length>12)return{ok:false,err:'닉네임은 2~12자로 입력해주세요.'};
    if(!password||password.length<8||!/[A-Za-z]/.test(password)||!/[0-9]/.test(password))return{ok:false,err:'비밀번호는 8자 이상, 영문+숫자 조합이어야 합니다.'};
    if(!agreeRequired)return{ok:false,err:'필수 약관에 동의해주세요.'};
    if(!window.sb)return{ok:false,err:'데이터베이스 연결 실패 — 새로고침 후 다시 시도해주세요.'};

    const {data:existing}=await sb.from('profiles').select('id').eq('nickname',nickname).maybeSingle();
    if(existing)return{ok:false,err:'이미 사용 중인 닉네임입니다.'};

    const {data,error}=await sb.auth.signUp({email,password});
    if(error){
      if(/already|registered/i.test(error.message))return{ok:false,err:'이미 가입된 이메일입니다.'};
      return{ok:false,err:error.message};
    }
    if(!data.user)return{ok:false,err:'가입에 실패했습니다.'};
    const {error:pe}=await sb.from('profiles').insert({id:data.user.id,email,nickname,career:career||''});
    if(pe)return{ok:false,err:'프로필 생성 실패: '+pe.message};
    if(data.session){
      setUserFromSession(data.session,{nickname,career:career||''});
    }
    renderNav();
    return{ok:true,user:currentUser||{id:data.user.id,email,nickname,career:career||''}};
  }

  async function login({email,password}){
    email=(email||'').trim().toLowerCase();
    if(!email||!password)return{ok:false,err:'이메일과 비밀번호를 입력해주세요.'};
    if(!window.sb)return{ok:false,err:'데이터베이스 연결 실패 — 새로고침 후 다시 시도해주세요.'};
    const {data,error}=await sb.auth.signInWithPassword({email,password});
    if(error)return{ok:false,err:'이메일 또는 비밀번호가 일치하지 않습니다.'};
    const p=await loadProfile(data.user.id);
    setUserFromSession(data.session,p);
    renderNav();
    return{ok:true,user:currentUser};
  }

  async function logout(){
    if(window.sb)await sb.auth.signOut();
    currentUser=null;
    renderNav();
  }

  function renderNav(){
    const user=currentUser;
    function updateBellDot(){
      let count=0;
      if(user){
        try{
          const list=JSON.parse(localStorage.getItem('designr.notifications.'+user.email))||[];
          for(const n of list)if(!n.read)count++;
        }catch(e){}
      }
      document.querySelectorAll('.gnb-ndot').forEach(d=>{
        if(count>0){d.textContent=count>99?'99+':String(count);d.classList.add('show');}
        else{d.textContent='';d.classList.remove('show');}
      });
    }
    updateBellDot();
    document.querySelectorAll('.gnb-login').forEach(el=>{
      if(user){
        el.textContent='';
        const ic=document.createElement('span');ic.className='material-icons-round';ic.style.fontSize='18px';ic.style.marginRight='6px';ic.textContent='account_circle';
        el.appendChild(ic);
        el.appendChild(document.createTextNode(user.nickname));
        el.setAttribute('href','community-mypage.html');
        el.setAttribute('title',user.email+' · 클릭하여 마이페이지로 이동');
      }else{
        el.textContent='로그인';
        el.setAttribute('href','community-auth.html');
        el.removeAttribute('title');
      }
    });
    document.querySelectorAll('.gnb-mdr-acts a').forEach(a=>{
      const t=(a.textContent||'').trim();
      if(user){
        if(t==='로그인'||/마이페이지$/.test(t)){
          a.textContent=user.nickname+' 마이페이지';
          a.setAttribute('href','community-mypage.html');
        }
      }else{
        if(t==='로그인'||/마이페이지$/.test(t)){
          a.textContent='로그인';
          a.setAttribute('href','community-auth.html');
        }
      }
    });
  }

  window.DesignrAuth={signup,login,logout,getCurrentUser,renderNav,ready};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
