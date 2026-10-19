(function(){
  function initGallery(g){
    var items=[].slice.call(g.querySelectorAll('[data-hook="item-container"]'));
    if(!items.length)return;
    var m=/width:\s*(\d+)px;\s*height:\s*(\d+)px/.exec(items[0].getAttribute('style')||'');
    var ratio=m?(+m[2])/(+m[1]):0.5;
    // hide every existing child subtree of the outer gallery element
    [].slice.call(g.children).forEach(function(c){c.style.display='none';});
    g.style.position='relative';g.style.width='100%';g.style.height='auto';g.style.display='block';g.style.margin='0';
    var stage=document.createElement('div');
    stage.style.cssText='position:relative;width:100%;padding-top:'+(ratio*100)+'%;overflow:hidden;background:#111;';
    items.forEach(function(it){stage.appendChild(it);});
    g.appendChild(stage);
    items.forEach(function(it,i){
      it.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;margin:0;display:block;overflow:hidden;transition:opacity .6s ease;opacity:'+(i===0?'1':'0')+';z-index:'+(i===0?'2':'1')+';';
      [].slice.call(it.querySelectorAll('a,div,span')).forEach(function(e){
        if(e.querySelector('img')){e.style.width='100%';e.style.height='100%';e.style.display='block';}
      });
      it.querySelectorAll('img').forEach(function(im){
        im.style.cssText='width:100%;height:100%;object-fit:contain;display:block;margin:0;';
        im.removeAttribute('srcset');im.removeAttribute('sizes');im.loading='eager';
      });
    });
    var idx=0,timer;
    function show(k){idx=(k+items.length)%items.length;items.forEach(function(it,i){it.style.opacity=i===idx?'1':'0';it.style.zIndex=i===idx?'2':'1';});}
    function auto(){timer=setInterval(function(){show(idx+1);},4500);}
    function reset(){clearInterval(timer);auto();}
    if(items.length>1){
      [['&#8249;','Previous Item',false],['&#8250;','Next Item',true]].forEach(function(a){
        var b=document.createElement('button');
        b.setAttribute('aria-label',a[1]);b.innerHTML=a[0];
        b.style.cssText='position:absolute;top:50%;transform:translateY(-50%);z-index:10;background:rgba(0,0,0,.2);border:0;color:#fff;font-size:40px;line-height:1;padding:12px 12px;cursor:pointer;'+(a[2]?'right:0;':'left:0;');
        b.addEventListener('click',function(){show(idx+(a[2]?1:-1));reset();});
        stage.appendChild(b);
      });
      auto();
    }
  }
  function boot(){
    document.querySelectorAll('.pro-gallery').forEach(function(g){
      if(/-container-/.test(g.id))return; // skip inner filmstrip container
      initGallery(g);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

/* Cloudflare Turnstile loader (explicit render, shared) */
window.__nhssaaTSQueue=window.__nhssaaTSQueue||[];
window.__nhssaaTS=function(){while(window.__nhssaaTSQueue.length){var q=window.__nhssaaTSQueue.shift();q.wid=turnstile.render(q.el,{sitekey:q.key});}};
(function(){var t=document.createElement('script');t.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__nhssaaTS&render=explicit';t.async=true;t.defer=true;document.head.appendChild(t);})();
/* NHSSAA mailing list -> /api/signup proxy (bot-guarded) -> Google Form Sheet under admin@nhssaa.org */
(function(){
  var T0=Date.now();
  function wire(form){
    if(form.__nhssaa) return; form.__nhssaa=true;
    var btn=form.querySelector('button');
    var hp=document.createElement('input');
    hp.type='text'; hp.name='company'; hp.tabIndex=-1; hp.setAttribute('autocomplete','off'); hp.setAttribute('aria-hidden','true');
    hp.style.cssText='position:absolute;left:-9999px;top:-9999px;height:1px;width:1px;overflow:hidden;';
    form.appendChild(hp);
    var ts=document.createElement('div'); form.appendChild(ts);
    var tsq={el:ts,key:'0x4AAAAAAFbAML3b8ZAWbOSA',wid:null}; window.__nhssaaTSQueue.push(tsq);
    if(window.turnstile){window.__nhssaaTS();}
    var note=document.createElement('p');
    note.setAttribute('role','status'); note.style.cssText='margin:8px 0;font-size:16px;';
    form.appendChild(note);
    function go(e){
      e.preventDefault(); e.stopPropagation();
      var fn=form.querySelector('[name="first-name"]'),ln=form.querySelector('[name="last-name"]'),em=form.querySelector('[name="email"]'),ms=form.querySelector('textarea');
      var email=(em&&em.value||'').trim();
      if(!/^.+@.+\.[a-zA-Z]{2,63}$/.test(email)||!(fn&&fn.value.trim())||!(ln&&ln.value.trim())){note.textContent='Please enter your first name, last name and a valid email.';return;}
      var d=new URLSearchParams();
      d.append('first',fn.value.trim());d.append('last',ln.value.trim());
      d.append('email',email);d.append('message',ms?ms.value:'');
      d.append('company',hp.value);d.append('t0',String(T0));
      var tst=form.querySelector('[name="cf-turnstile-response"]');
      var tsv=tst&&tst.value?tst.value:'';
      if(!tsv){note.textContent='Please complete the security check.';return;}
      d.append('cf-turnstile-response',tsv);
      if(btn) btn.disabled=true; note.textContent='Sending...';
      fetch('/api/signup',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:d.toString()})
        .then(function(r){return r.json();})
        .then(function(j){
          if(j&&j.ok){note.textContent='Thank you! You have been added to the NHSSAA mailing list.';form.reset();}
          else{note.textContent='Sorry, something went wrong. Please email admin@nhssaa.org.';}
          if(tsq.wid!==null&&window.turnstile){turnstile.reset(tsq.wid);}
          if(btn)btn.disabled=false;
        })
        .catch(function(){note.textContent='Sorry, something went wrong. Please email admin@nhssaa.org.';if(btn)btn.disabled=false;});
    }
    form.addEventListener('submit',go,true);
    if(btn) btn.addEventListener('click',go,true);
  }
  function init(){document.querySelectorAll('form.wixui-form').forEach(wire);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
