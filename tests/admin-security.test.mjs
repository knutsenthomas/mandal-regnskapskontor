import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
function response() { return { code: 200, headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(s) { this.code=s;return this; }, json(v) { this.body=v;return this; } }; }
async function handler(file, options = {}) {
 const calls=[];
 const user=options.user || {id:'admin-id',email:'admin@example.invalid',email_confirmed_at:'2026-01-01'};
 const client={auth:{getUser:async()=>({data:{user},error:options.invalidToken?{}:null}),admin:{
  inviteUserByEmail:async()=>{calls.push('invite');return {data:{},error:null};},
  listUsers:async()=>({data:{users:[{id:'target',email:'target@example.invalid'}]}}),
  deleteUser:async()=>{calls.push('delete');return {};}
 }},from:()=>({select:async()=>({data:options.members ?? [{email:'ADMIN@example.invalid'}],error:options.lookupError?{}:null}),upsert:async()=>{calls.push('upsert');return {};},delete:()=>({eq:async()=>{calls.push('remove');return {};}})})};
 const context=vm.createContext({Buffer,URL,URLSearchParams,Date,console:{error(){}},process:{env:{SUPABASE_SERVICE_ROLE_KEY:'synthetic',...options.env}},fetch:options.fetch || (async()=>{throw Error('Network forbidden');})});
 const cache=new Map();
 const builtin=(name,values)=>new vm.SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);},{context,identifier:name});
 const modules={'@supabase/supabase-js':builtin('supabase',{createClient:()=>client}),'node:crypto':builtin('crypto',{default:crypto})};
 async function load(filename) {
  if(cache.has(filename))return cache.get(filename);
  const mod=new vm.SourceTextModule(await fs.readFile(filename,'utf8'),{context,identifier:filename});cache.set(filename,mod);
  await mod.link(async(name,from)=>modules[name]||load(path.resolve(path.dirname(from.identifier),name)));return mod;
 }
 const mod=await load(path.join(root,file));await mod.evaluate();return {run:mod.namespace.default,calls};
}
for(const file of ['api/invite-admin.js','api/remove-admin.js','api/ga4-overview.js']) {
 for(const [name,options,headers,status] of [
  ['anonymous',{}, {},401],['malformed bearer',{}, {authorization:'Bearer a b'},401],
  ['invalid token',{invalidToken:true},{authorization:'Bearer test'},401],
  ['unverified email',{user:{id:'id',email:'admin@example.invalid'}},{authorization:'Bearer test'},401],
  ['ordinary user',{members:[]},{authorization:'Bearer test'},403],
  ['lookup failure',{lookupError:true},{authorization:'Bearer test'},503]
 ]) test(file+' rejects '+name+' before privileged effects',async()=>{
  const {run,calls}=await handler(file,options),res=response();await run({method:file.includes('ga4')?'GET':'POST',headers,body:{email:'target@example.invalid',role:'admin'}},res);assert.equal(res.code,status);assert.deepEqual(calls,[]);
 });
}
for(const file of ['api/invite-admin.js','api/remove-admin.js'])test(file+' preserves verified administrator operation',async()=>{
 const {run,calls}=await handler(file),res=response();await run({method:'POST',headers:{authorization:'Bearer test',origin:'https://attacker.invalid'},body:{email:'target@example.invalid'}},res);assert.equal(res.code,200);assert.equal(calls.length,2);
});
test('GA fails closed with no configured private key',async()=>{
 const {run}=await handler('api/ga4-overview.js'),res=response();await run({method:'GET',headers:{authorization:'Bearer test'},query:{}},res);assert.equal(res.code,503);
 assert.doesNotMatch(await fs.readFile(path.join(root,'api/ga4-overview.js'),'utf8'),/-----BEGIN PRIVATE KEY-----/);
});
test('GA preserves configured administrator analytics using mocked Google responses',async()=>{
 const privateKey=crypto.generateKeyPairSync('rsa',{modulusLength:2048}).privateKey.export({type:'pkcs8',format:'pem'});
 const {run}=await handler('api/ga4-overview.js',{env:{GA_SERVICE_ACCOUNT_PRIVATE_KEY:privateKey},fetch:async url=>({ok:true,json:async()=>String(url).includes('oauth2.googleapis.com')?{access_token:'synthetic'}:{rows:[]}})}),res=response();
 await run({method:'GET',headers:{authorization:'Bearer test'},query:{}},res);assert.equal(res.code,200);
});
test('legacy PHP entry points all authenticate before parsing or writing',async()=>{
 for(const dir of ['public/api','deployment/one.com/onecom-root-ready/httpd.www/api','deployment/one.com/upload-ready-2026-03-30/httpd.www/api']) {
  const helper=await fs.readFile(path.join(root,dir,'_bootstrap.php'),'utf8');assert.match(helper,/function app_require_admin\(/);assert.match(helper,/email_confirmed_at/);assert.match(helper,/admin_users/);
  for(const file of ['invite-admin.php','remove-admin.php']) {const source=await fs.readFile(path.join(root,dir,file),'utf8');assert.ok(source.indexOf('app_require_admin();')<source.indexOf('app_json_input()'));}
 }
});
