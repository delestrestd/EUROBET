/* EuroBet Live — Calendriers loader v6c5 (UTF-8 parts, no atob) */
(function(){
  const DATA_PATCHES={9:(s)=>{const a=s.split("");a[1898]="R";return a.join("");},10:(s)=>{const a=s.split("");a[406]="P";a[542]="8";return a.join("");},18:(s)=>{const a=s.split("");a[1521]="N";a[1522]="a";a[1523]="m";return a.join("");},20:(s)=>{const a=s.split("");a[429]="6";return a.join("");},27:(s)=>{const a=s.split("");a[770]="3";return a.join("");}};
  const _fetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const res=await _fetch(input,init);
    try{
      const url=typeof input==="string"?input:(input&&input.url)||"";
      const m=/calendrier-data\.gz\.b64\.part(\d+)/.exec(url);
      if(!m)return res;
      const patch=DATA_PATCHES[+m[1]];
      if(!patch||!res.ok)return res;
      return new Response(patch((await res.text()).replace(/\s+/g,"")),{status:200,headers:{"Content-Type":"text/plain; charset=utf-8"}});
    }catch(e){return res;}
  };
  async function loadJoin(prefix,n){
    const texts=await Promise.all([...Array(n).keys()].map(async i=>{
      const r=await fetch("./"+prefix+i+".js?v=6c5",{cache:"no-cache"});
      if(!r.ok)throw new Error(prefix+i+" HTTP "+r.status);
      return await r.text();
    }));
    return texts.join("");
  }
  async function boot(){
    (0,eval)(await loadJoin("calendrier-addon-app.part",9));
    (0,eval)(await loadJoin("calendrier-v6c5.part",5));
  }
  boot().catch(e=>{console.error("[calendriers]",e);const el=window.contentEl||document.getElementById("content");if(el)el.innerHTML="<div class=\"empty\"><p>Erreur calendriers: "+String(e.message||e)+"</p></div>";});
})();
