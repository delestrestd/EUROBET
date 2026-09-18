/* EuroBet Live — Calendriers loader v6c5 (UTF-8 fetch+eval, no atob) */
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
  async function boot(){
    const addon=await (await fetch("./calendrier-addon-app.js?v=6c5",{cache:"no-cache"})).text();
    (0,eval)(addon);
    const patch=await (await fetch("./calendrier-v6c5.js?v=6c5",{cache:"no-cache"})).text();
    (0,eval)(patch);
  }
  boot().catch(e=>{console.error("[calendriers]",e);const el=window.contentEl||document.getElementById("content");if(el)el.innerHTML="<div class=\"empty\"><p>Erreur calendriers: "+String(e.message||e)+"</p></div>";});
})();
