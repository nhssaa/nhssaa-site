(function(){
 if(!matchMedia('(max-width: 760px)').matches)return;
 var main=document.querySelector('main');if(!main)return;
 var root=document.createElement('div');root.id='nhssaa-mobile';
 var header=document.createElement('header');var logo=document.querySelector('header img');if(logo){var l=document.createElement('a');l.href='/';l.appendChild(logo.cloneNode(true));header.appendChild(l)}
 var toggle=document.createElement('button');toggle.textContent='Menu';toggle.setAttribute('aria-expanded','false');header.appendChild(toggle);
 var nav=document.createElement('nav');nav.setAttribute('aria-label','Mobile navigation');nav.hidden=true;
 var home=document.createElement('a');home.href='/';home.textContent='HOME';nav.appendChild(home);var seen=new Set(['/']);document.querySelectorAll('header a[href]').forEach(function(a){var h=a.getAttribute('href'),t=a.textContent.trim();if(t&&h&&!seen.has(h)){seen.add(h);var c=document.createElement('a');c.href=h;c.textContent=t;nav.appendChild(c)}});
 toggle.onclick=function(){nav.hidden=!nav.hidden;toggle.setAttribute('aria-expanded',String(!nav.hidden))};root.appendChild(header);root.appendChild(nav);
 var content=document.createElement('main');var gallery=main.querySelector('.pro-gallery');
 if(gallery){var pics=[...gallery.querySelectorAll('img')];var unique=new Set();var strip=document.createElement('div');strip.className='mobile-gallery';pics.forEach(function(i){var s=i.currentSrc||i.src;if(unique.has(s))return;unique.add(s);var im=document.createElement('img');im.src=s;im.alt=i.alt||'NHSSAA event';strip.appendChild(im)});content.appendChild(strip)}
 var last='';main.querySelectorAll('h1,h2,h3,h4,h5,h6,p,blockquote,img,a,form').forEach(function(n){if(n.closest('.pro-gallery'))return;if(n.tagName==='P'&&n.querySelector('p,form,footer'))return;if(n.closest('blockquote')&&n.tagName!=='BLOCKQUOTE')return;if(n.closest('footer'))return;if(n.closest('form')&&n.tagName!=='FORM')return;if(n.tagName==='A'&&n.querySelector('img'))return;if(n.tagName==='A'&&n.closest('p'))return;var txt=n.textContent.trim();if(!txt&&n.tagName!=='IMG')return;if(txt&&txt===last)return;last=txt;
 var out;
 if(n.tagName==='IMG'){out=document.createElement('img');out.src=n.currentSrc||n.src;out.alt=n.alt||'';out.loading='lazy'}
 else if(n.tagName==='FORM'){out=document.createElement('form');out.className='mobile-signup';out.setAttribute('aria-label','Join the NHSSAA mailing list');out.innerHTML='<label>First name<input name="first-name" autocomplete="given-name" required></label><label>Last name<input name="last-name" autocomplete="family-name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Message (optional)<textarea name="message"></textarea></label><input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;top:-9999px;height:1px;width:1px;overflow:hidden"><button type="submit">JOIN NOW</button><p class="signup-note" role="status"></p>';}
 else if(n.tagName==='A'){out=document.createElement('a');out.href=n.href;out.textContent=txt;out.className='mobile-link'}
 else {out=document.createElement(n.tagName.toLowerCase());if(n.querySelector('a[href]')){out=n.cloneNode(true);[out,...out.querySelectorAll('*')].forEach(function(x){x.removeAttribute('style');x.removeAttribute('class');x.removeAttribute('id')})}else out.textContent=txt;}
 content.appendChild(out);
 });root.appendChild(content);
 var wform=document.querySelector('form.wixui-form');
 if(wform&&!content.querySelector('form.mobile-signup')){
  var mh=document.createElement('h2');mh.textContent='Join our mailing list for information, updates & more!';content.appendChild(mh);
  var mf=document.createElement('form');mf.className='mobile-signup';mf.setAttribute('aria-label','Join the NHSSAA mailing list');
  mf.innerHTML='<label>First name<input name="first-name" autocomplete="given-name" required></label><label>Last name<input name="last-name" autocomplete="family-name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Message (optional)<textarea name="message"></textarea></label><input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;top:-9999px;height:1px;width:1px;overflow:hidden"><button type="submit">JOIN NOW</button><p class="signup-note" role="status"></p>';
  content.appendChild(mf);
 }
 var T0=Date.now();
 content.querySelectorAll('form.mobile-signup').forEach(function(f){
  f.addEventListener('submit',function(e){
   e.preventDefault();
   var note=f.querySelector('.signup-note'),btn=f.querySelector('button');
   var fn=f.querySelector('[name=first-name]').value.trim(),ln=f.querySelector('[name=last-name]').value.trim(),em=f.querySelector('[name=email]').value.trim(),ms=f.querySelector('[name=message]').value;
   if(!fn||!ln||!/^.+@.+\.[a-zA-Z]{2,63}$/.test(em)){note.textContent='Please enter your first name, last name and a valid email.';return;}
   var d=new URLSearchParams();
   d.append('first',fn);d.append('last',ln);d.append('email',em);d.append('message',ms);d.append('company',f.querySelector('[name=company]').value);d.append('t0',String(T0));
   btn.disabled=true;note.textContent='Sending...';
   fetch('/api/signup',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:d.toString()})
    .then(function(r){return r.json();}).then(function(j){if(j&&j.ok){note.textContent='Thank you! You have been added to the NHSSAA mailing list.';f.reset();}else{note.textContent='Sorry, something went wrong. Please email admin@nhssaa.org.';}btn.disabled=false;})
    .catch(function(){note.textContent='Sorry, something went wrong. Please email admin@nhssaa.org.';btn.disabled=false;});
  });
 });var foot=document.createElement('footer');foot.textContent='©2025 by National High School Sports Analytics Association, Inc. Contact us at info@nhssaa.org';root.appendChild(foot);
 [...document.body.children].forEach(function(e){if(!['SCRIPT','STYLE'].includes(e.tagName))e.classList.add('nhssaa-desktop-root')});document.body.appendChild(root);
 var meta=document.querySelector('meta[name=viewport]');if(meta)meta.content='width=device-width, initial-scale=1';
})();
