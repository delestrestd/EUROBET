est(".cal-q-row");
  if(!q||!row)return;
  row.classList.toggle("has-value",!!String(q.value||"").trim());
}
function enhanceSearch(root){
  const el=root||document.getElementById("content")||document;
  const wrap=el.querySelector&&el.querySelector(".cal-suggest-wrap");
  if(!wrap)return;
  const input=wrap.querySelector("#calQ");
  if(!input)return;
  let row=wrap.querySelector(".cal-q-row");
  if(!row){
    row=document.createElement("div");
    row.className="cal-q-row";
    input.parentNode.insertBefore(row,input);
    row.appendChild(input);
  }
  let btn=row.querySelector(".cal-q-clear");
  if(!btn){
    btn=document.createElement("button");
    btn.type="button";
    btn.className="cal-q-clear";
    btn.setAttribute("aria-label","Effacer la recherche");
    btn.title="Effacer";
    btn.textContent="\u00d7";
    row.appendChild(btn);
    btn.addEventListener("click",ev=>{
      ev.preventDefault();ev.stopPropagation();
      input.value="";
      input.dispatchEvent(new Event("input",{bubbles:true}));
      const box=document.getElementById("calSuggest");
      if(box){box.classList.remove("open");box.innerHTML="";}
      syncClearBtn();
      input.focus();
    });
  }
  if(!input.dataset.clearWired){
    input.dataset.clearWired="1";
    input.addEventListener("input",syncClearBtn);
    input.addEventListener("change",syncClearBtn);
  }
  syncClearBtn();
}
function install(){
  css();
  const el=window.contentEl||document.getElementById("content");
  if(!el)return;
  enhanceList(el);
  enhanceSearch(el);
  if(el.dataset.histObsV6c5==="1")return;
  el.dataset.histObsV6c5="1";
  new MutationObserver(()=>{css();enhanceList(el);enhanceSearch(el);}).observe(el,{childList:true,subtree:true});
  el.addEventListener("click",ev=>{
    const h2h=ev.target.closest("[data-h2h-home]");
    if(h2h&&el.contains(h2h)){
      ev.preventDefault();ev.stopPropagation();
      openH2H(h2h.getAttribute("data-h2h-home"),h2h.getAttribute("data-h2h-away"));
      return;
    }
    const row=ev.target.closest(".cal-row");
    if(row&&el.contains(row)&&!ev.target.closest("a,button")){
      const pair=parseTeamsFromRow(row);
      if(pair){ev.preventDefault();openH2H(pair.home,pair.away);}
    }
  });
}
const _p=JSON.parse;
JSON.parse=function(t,r){
  const v=_p.call(this,t,r);
  try{if(Array.isArray(v)&&v.length>100&&v[0]&&v[0].home&&v[0].away&&v[0].d&&v[0].st)window.__calDataV6c3=v;}catch(e){}
  return v;
};
css();install();
const prev=window.__renderCalendriers;
if(typeof prev==="function")window.__renderCalendriers=async function(){const r=await prev.apply(this,arguments);install();return r;};
setInterval(install,800);
})();
