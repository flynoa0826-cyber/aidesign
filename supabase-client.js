(function(){
  const SUPABASE_URL='https://pckmplfmwnoxsgajyfgm.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_WBTwfMUX9jOfsTYUjij8_Q_2gH0tbUM';
  if(!window.supabase||!window.supabase.createClient){
    console.error('[DESIGNR] Supabase JS SDK가 로드되지 않았습니다.');
    return;
  }
  window.sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });
})();
