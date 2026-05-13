(function(){
  const USERS_KEY='designr.users';
  const SESSION_KEY='designr.session';

  function loadUsers(){
    try{return JSON.parse(localStorage.getItem(USERS_KEY))||[]}catch(e){return []}
  }
  function saveUsers(list){localStorage.setItem(USERS_KEY,JSON.stringify(list))}
  function hash(str){
    let h=0;for(let i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0}
    return 'h'+(h>>>0).toString(16)+'_'+str.length;
  }
  function getCurrentUser(){
    try{return JSON.parse(localStorage.getItem(SESSION_KEY))||null}catch(e){return null}
  }
  function setSession(user){
    localStorage.setItem(SESSION_KEY,JSON.stringify({email:user.email,nickname:user.nickname,career:user.career||'',loginAt:Date.now()}));
  }
  function clearSession(){localStorage.removeItem(SESSION_KEY)}

  function signup({email,nickname,password,career,agreeRequired}){
    email=(email||'').trim().toLowerCase();
    nickname=(nickname||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return{ok:false,err:'올바른 이메일 주소를 입력하세요.'};
    if(nickname.length<2||nickname.length>12)return{ok:false,err:'닉네임은 2~12자로 입력해주세요.'};
    if(!password||password.length<8||!/[A-Za-z]/.test(password)||!/[0-9]/.test(password))return{ok:false,err:'비밀번호는 8자 이상, 영문+숫자 조합이어야 합니다.'};
    if(!agreeRequired)return{ok:false,err:'필수 약관에 동의해주세요.'};
    const users=loadUsers();
    if(users.some(u=>u.email===email))return{ok:false,err:'이미 가입된 이메일입니다.'};
    if(users.some(u=>u.nickname===nickname))return{ok:false,err:'이미 사용 중인 닉네임입니다.'};
    const user={email,nickname,pw:hash(password),career:career||'',createdAt:Date.now()};
    users.push(user);saveUsers(users);
    setSession(user);
    return{ok:true,user};
  }

  function login({email,password}){
    email=(email||'').trim().toLowerCase();
    if(!email||!password)return{ok:false,err:'이메일과 비밀번호를 입력해주세요.'};
    const users=loadUsers();
    const user=users.find(u=>u.email===email);
    if(!user||user.pw!==hash(password))return{ok:false,err:'이메일 또는 비밀번호가 일치하지 않습니다.'};
    setSession(user);
    return{ok:true,user};
  }

  function logout(){clearSession()}

  function renderNav(){
    const user=getCurrentUser();
    // 알림 벨 숫자 뱃지: 기본은 숨김(.gnb-ndot { display:none }), JS가 .show 부여
    // 알림 데이터는 localStorage(동기)에 있으므로 IndexedDB 준비를 기다리지 않고 즉시 계산해서 깜박임 방지
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
    if(!user)return;
    document.querySelectorAll('.gnb-login').forEach(el=>{
      el.textContent='';
      const ic=document.createElement('span');ic.className='material-icons-round';ic.style.fontSize='18px';ic.style.marginRight='6px';ic.textContent='account_circle';
      el.appendChild(ic);
      el.appendChild(document.createTextNode(user.nickname));
      el.setAttribute('href','community-mypage.html');
      el.setAttribute('title',user.email+' · 클릭하여 마이페이지로 이동');
    });
    document.querySelectorAll('.gnb-mdr-acts a').forEach(a=>{
      if(a.textContent.trim()==='로그인'){
        a.textContent=user.nickname+' 마이페이지';
        a.setAttribute('href','community-mypage.html');
      }
    });
  }

  window.DesignrAuth={signup,login,logout,getCurrentUser,renderNav};

  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',renderNav)}
  else{renderNav()}
})();
