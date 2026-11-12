import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
async function walk(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? walk(`${dir}/${e.name}`) : `${dir}/${e.name}`,
      ),
    )
  ).flat();
}
const files = (await walk("web")).filter((f) => !f.endsWith("/sw.js"));
const precache = files.map((f) => "/" + f.slice(4));
const digest = createHash("sha256");
for (const f of files) digest.update(await readFile(f));
const name = "prohor-v3-" + digest.digest("hex").slice(0, 12);
const code = `const CACHE=${JSON.stringify(name)},FILES=${JSON.stringify(precache)};
self.addEventListener('install',e=>e.waitUntil((async()=>{await(await caches.open(CACHE)).addAll(FILES);await self.skipWaiting();})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('prohor-')&&k!==CACHE)await caches.delete(k);await self.clients.claim();})()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
 if(e.request.mode==='navigate'){e.respondWith((async()=>{try{const res=await fetch(e.request);if(res.ok)return res;}catch{}return (await caches.open(CACHE)).match('/index.html');})());return;}
 e.respondWith((async()=>{const c=await caches.open(CACHE);const hit=await c.match(e.request);if(hit)return hit;return fetch(e.request);})());});
`;
await writeFile("web/sw.js", code);
console.log("Offline precache:", files.length, "files; cache", name);
