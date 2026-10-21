import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import { parse } from 'parse5';

const root=process.cwd();
const fixture=path.join(root,'src/content/notes/9998-regression');
const output=path.join(root,'.review-builds');
const node=process.execPath;
function run(script:string,args:string[],env:Record<string,string>={}) {
  const result=spawnSync(node,[script,...args],{cwd:root,stdio:'inherit',env:{...process.env,...env}});
  if(result.status!==0) throw new Error(`验证失败：${script} (${result.status})`);
}
function remove(target:string) {
  const resolved=path.resolve(target);
  if(!resolved.startsWith(root+path.sep) || resolved===root) throw new Error('拒绝清理工作区之外的目录');
  fs.rmSync(resolved,{recursive:true,force:true});
}
function htmlFiles(dir:string):string[] {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?htmlFiles(path.join(dir,x.name)):x.name.endsWith('.html')?[path.join(dir,x.name)]:[]);
}
function verifyStatic(dir:string,base:string) {
  const pages=new Map<string,{ids:Set<string>,refs:string[]}>();
  for(const file of htmlFiles(dir)) {
    const html=fs.readFileSync(file,'utf8');
    if(html.includes('REGRESSION_PRIVATE')) throw new Error(`草稿元数据进入输出：${file}`);
    const ids=new Set<string>(),refs:string[]=[];
    function visit(node:any) {
      for(const attr of node.attrs||[]) {
        if(attr.name==='id') ids.add(attr.value);
        if((attr.name==='href'||attr.name==='src') && ['a','link','img','script','source'].includes(node.tagName)) refs.push(attr.value);
      }
      for(const child of node.childNodes||[]) visit(child);
    }
    visit(parse(html)); pages.set(path.resolve(file),{ids,refs});
  }
  for(const [file,data] of pages) for(const ref of data.refs) {
    if(/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(ref)) continue;
    const url=new URL(ref,'http://test'+base+path.relative(dir,file).replace(/\\/g,'/'));
    if(!url.pathname.startsWith(base)) throw new Error(`链接缺少部署前缀：${ref}`);
    let dest=path.resolve(dir,decodeURIComponent(url.pathname.slice(base.length)));
    if(fs.existsSync(dest)&&fs.statSync(dest).isDirectory()) dest=path.join(dest,'index.html');
    if(!fs.existsSync(dest)) throw new Error(`缺失资源：${file} → ${ref}`);
    if(url.hash && pages.has(dest) && !pages.get(dest)!.ids.has(decodeURIComponent(url.hash.slice(1)))) throw new Error(`无效锚点：${ref}`);
  }
  console.log(`静态检查通过：${base}，${pages.size} 页；无草稿泄露、缺失资源或无效锚点。`);
}

if(fs.existsSync(fixture)) throw new Error('临时测试目录已存在，停止以保护现有内容');
let server:http.Server|undefined;
try {
  fs.mkdirSync(fixture,{recursive:true});
  fs.writeFileSync(path.join(fixture,'_meta.json'),JSON.stringify({title:'回归验证'}));
  for(const [name,dir] of [['0001-a','a'],['0002-b','b']]) {
    const media=path.join(fixture,dir,'_media');fs.mkdirSync(media,{recursive:true});
    fs.writeFileSync(path.join(media,'same.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text y="20">${dir}</text></svg>`);
    fs.writeFileSync(path.join(fixture,name+'.mdx'),`---\ntitle: Regression ${dir}\nsummary: Public fixture ${dir}\n---\n# Duplicate title\n\n## Section\n\n<Image src="./${dir}/_media/same.svg" alt="${dir}" />\n\n<Media type="image" src={"./${dir}/_media/same.svg"} alt="${dir}" />`);
  }
  fs.writeFileSync(path.join(fixture,'0003-draft.mdx'),'---\ntitle: REGRESSION_PRIVATE\nsummary: REGRESSION_PRIVATE_SUMMARY\ntags: [REGRESSION_PRIVATE_TAG]\ndraft: true\n---\n# Draft\n\nUnpublished.');
  fs.writeFileSync(path.join(fixture,'0004-diagrams.md'), [
    '---', 'title: Diagram regression', '---',
    '```mermaid title="Markdown flow"', 'flowchart LR', '  A["Start"] --> B["Finish"]', '```',
    '', '```mermaid title="Invalid syntax"', 'this is not valid mermaid', '```',
  ].join('\n'));
  fs.appendFileSync(path.join(fixture,'0001-a.mdx'), '\n\n<BraceMap data={{name:"Legacy compatibility",children:[{name:"Full long label without truncation",description:"Always visible",children:[{name:"Nested detail"}]}]}} />');
  fs.appendFileSync(path.join(fixture,'0001-a.mdx'), '\n\n<Collapse title="默认展开验证">中英文内容 Default expanded</Collapse>');
  for(const target of ['github','cloudflare']) {
    const dest=path.join(output,target);
    remove(dest);
    const env={DEPLOY_TARGET:target,BUILD_OUT_DIR:dest};
    run('scripts/check-content.js',[],env);
    run('scripts/copy-media.js',[],env);
    run('node_modules/astro/astro.js',['build'],env);
    verifyStatic(dest,target==='github'?'/personal-garden/':'/');
  }
  server=http.createServer((req,res)=>{
    const url=new URL(req.url||'/','http://localhost');
    const github=url.pathname.startsWith('/personal-garden/');
    const dir=path.join(output,github?'github':'cloudflare');
    let file=path.resolve(dir,decodeURIComponent(url.pathname.slice(github?'/personal-garden/'.length:1)));
    if(file!==dir&&!file.startsWith(dir+path.sep)) {res.writeHead(403).end();return;}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
    if(!fs.existsSync(file)) {res.writeHead(404).end('Not Found');return;}
    const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2'};
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
  });
  await new Promise<void>(resolve=>server!.listen(4333,'127.0.0.1',resolve));
  // Async child execution keeps the test HTTP server responsive.
  const {spawn}=await import('node:child_process');
  await new Promise<void>((resolve,reject)=>{
    const child=spawn(node,['node_modules/@playwright/test/cli.js','test'],{stdio:'inherit',env:{...process.env}});
    child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`浏览器回归失败：${code}`)));
  });
} finally {
  server?.closeAllConnections();server?.close();
  remove(fixture);
  remove(path.join(root,'public/media/9998-regression'));
}
