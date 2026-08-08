const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=__dirname;
const M={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
http.createServer((q,r)=>{
  let p=decodeURIComponent(q.url.split('?')[0]);
  if(p==='/'||p.endsWith('/'))p+='index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)){r.writeHead(403);return r.end('403');}
  fs.readFile(f,(e,d)=>{
    if(e){r.writeHead(404);return r.end('404 '+p);}
    r.writeHead(200,{'Content-Type':M[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});
    r.end(d);
  });
}).listen(5173,()=>console.log('serving '+ROOT+' on http://localhost:5173'));
