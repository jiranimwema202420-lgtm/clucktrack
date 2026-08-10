<<<<<<< HEAD
if(!self.define){let e,s={};const n=(n,t)=>(n=new URL(n+".js",t).href,s[n]||new Promise(s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()}).then(()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e}));self.define=(t,c)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let i={};const r=e=>n(e,a),o={module:{uri:a},exports:i,require:r};s[a]=Promise.all(t.map(e=>o[e]||r(e))).then(e=>(c(...e),i))}}define(["./workbox-4754cb34"],function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/GR53sBAsjBov0E34YJNsQ/_buildManifest.js",revision:"2370abe699a90a4b27b85228fcc48c31"},{url:"/_next/static/GR53sBAsjBov0E34YJNsQ/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/1043-6ac353ede7f5f809.js",revision:"6ac353ede7f5f809"},{url:"/_next/static/chunks/1100-ebdc66e9706dbea1.js",revision:"ebdc66e9706dbea1"},{url:"/_next/static/chunks/1966.b8f83f7ba376c962.js",revision:"b8f83f7ba376c962"},{url:"/_next/static/chunks/1968-91d9a685479d65a7.js",revision:"91d9a685479d65a7"},{url:"/_next/static/chunks/2039-a7134b990b8c6339.js",revision:"a7134b990b8c6339"},{url:"/_next/static/chunks/3373-43ba5b845488b389.js",revision:"43ba5b845488b389"},{url:"/_next/static/chunks/3646-c7d1f788d898345b.js",revision:"c7d1f788d898345b"},{url:"/_next/static/chunks/3659-c1730aa6326ca291.js",revision:"c1730aa6326ca291"},{url:"/_next/static/chunks/3739-14661e80355c9a92.js",revision:"14661e80355c9a92"},{url:"/_next/static/chunks/3794-cf38005d10217e99.js",revision:"cf38005d10217e99"},{url:"/_next/static/chunks/3899.3f761f7e3a944e8c.js",revision:"3f761f7e3a944e8c"},{url:"/_next/static/chunks/4856-195bbf0afff28b27.js",revision:"195bbf0afff28b27"},{url:"/_next/static/chunks/4bd1b696-6b5c0c72b0eadc5f.js",revision:"6b5c0c72b0eadc5f"},{url:"/_next/static/chunks/644-8fe36df50dc03df0.js",revision:"8fe36df50dc03df0"},{url:"/_next/static/chunks/7058-43b5ce5b8a084ab6.js",revision:"43b5ce5b8a084ab6"},{url:"/_next/static/chunks/7486-74712ff4416ffd35.js",revision:"74712ff4416ffd35"},{url:"/_next/static/chunks/8291-3a1757aa8ae67587.js",revision:"3a1757aa8ae67587"},{url:"/_next/static/chunks/833-36b11cd9ab6ce308.js",revision:"36b11cd9ab6ce308"},{url:"/_next/static/chunks/9010-7cce602fdf8b9c5e.js",revision:"7cce602fdf8b9c5e"},{url:"/_next/static/chunks/9386-8b87451bdc41736a.js",revision:"8b87451bdc41736a"},{url:"/_next/static/chunks/9490-ce56b50b8af501b6.js",revision:"ce56b50b8af501b6"},{url:"/_next/static/chunks/9783-6cef1eba75b7ecce.js",revision:"6cef1eba75b7ecce"},{url:"/_next/static/chunks/9844-56622345371a416c.js",revision:"56622345371a416c"},{url:"/_next/static/chunks/app/_global-error/page-652516c188282988.js",revision:"652516c188282988"},{url:"/_next/static/chunks/app/_not-found/page-bc8d1f5de2e67162.js",revision:"bc8d1f5de2e67162"},{url:"/_next/static/chunks/app/contacts/page-cff8b62af21eea9c.js",revision:"cff8b62af21eea9c"},{url:"/_next/static/chunks/app/dashboard/page-bc9e71874d7ac6db.js",revision:"bc9e71874d7ac6db"},{url:"/_next/static/chunks/app/expenditure/page-b38f613273445942.js",revision:"b38f613273445942"},{url:"/_next/static/chunks/app/feed-optimization/page-5bfab784b583c3d8.js",revision:"5bfab784b583c3d8"},{url:"/_next/static/chunks/app/financials/page-69a0fde92ce358e1.js",revision:"69a0fde92ce358e1"},{url:"/_next/static/chunks/app/health-prediction/page-09b5a957ee38f450.js",revision:"09b5a957ee38f450"},{url:"/_next/static/chunks/app/help/page-10f9783675384b3d.js",revision:"10f9783675384b3d"},{url:"/_next/static/chunks/app/inventory/page-b12eedf01cb70f6c.js",revision:"b12eedf01cb70f6c"},{url:"/_next/static/chunks/app/layout-82cc74136d0d8f67.js",revision:"82cc74136d0d8f67"},{url:"/_next/static/chunks/app/login/page-e02f01b7f3d16e9e.js",revision:"e02f01b7f3d16e9e"},{url:"/_next/static/chunks/app/page-5b995b27c82c6b2d.js",revision:"5b995b27c82c6b2d"},{url:"/_next/static/chunks/app/poultry-qa/page-80e22417d6b3dc53.js",revision:"80e22417d6b3dc53"},{url:"/_next/static/chunks/app/reports/page-1f58762b0d370967.js",revision:"1f58762b0d370967"},{url:"/_next/static/chunks/app/sales/page-290c40ecb5c29f7a.js",revision:"290c40ecb5c29f7a"},{url:"/_next/static/chunks/app/settings/page-ba24b65616023045.js",revision:"ba24b65616023045"},{url:"/_next/static/chunks/bc9e92e6-b36bb7522dd162d2.js",revision:"b36bb7522dd162d2"},{url:"/_next/static/chunks/ceb9e9aa-64ca9a7d71e600e1.js",revision:"64ca9a7d71e600e1"},{url:"/_next/static/chunks/framework-a676db37b243fc59.js",revision:"a676db37b243fc59"},{url:"/_next/static/chunks/main-app-f277a30ae168a5f9.js",revision:"f277a30ae168a5f9"},{url:"/_next/static/chunks/main-c105f0f9de4f9322.js",revision:"c105f0f9de4f9322"},{url:"/_next/static/chunks/next/dist/client/components/builtin/app-error-652516c188282988.js",revision:"652516c188282988"},{url:"/_next/static/chunks/next/dist/client/components/builtin/forbidden-652516c188282988.js",revision:"652516c188282988"},{url:"/_next/static/chunks/next/dist/client/components/builtin/global-error-9218167acdc60fd3.js",revision:"9218167acdc60fd3"},{url:"/_next/static/chunks/next/dist/client/components/builtin/not-found-652516c188282988.js",revision:"652516c188282988"},{url:"/_next/static/chunks/next/dist/client/components/builtin/unauthorized-652516c188282988.js",revision:"652516c188282988"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-e61c5584ea94d1e7.js",revision:"e61c5584ea94d1e7"},{url:"/_next/static/css/b4f5bc4047075b76.css",revision:"b4f5bc4047075b76"},{url:"/manifest.json",revision:"d7922fa6a24bd2647f7546b455f50266"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:t})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")},new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")},new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(({url:e})=>!(self.origin===e.origin),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")});
=======

const CACHE_NAME = 'pwa-cache-v1';
const STATIC_ASSETS = [
    // Pre-cache static assets here if needed
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


self.addEventListener('fetch', (event) => {
    const { request } = event;

    // For navigation requests, use a network-first strategy.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // If the fetch is successful, clone the response and cache it.
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // If the network fails, try to serve the response from the cache.
                    return caches.match(request);
                })
        );
        return;
    }

    // For other requests (images, videos, scripts, styles), use a cache-first strategy.
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            });
        })
    );
});

//background sync logic flow 
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('[SW] Background sync triggered: sync-data');
        event.waitUntil(handleSyncData());
    }
});

async function handleSyncData() {

    //debug log if something went wrong or process gets stuck
    console.error('[SW] Error: Background sync process encountered a problem.');
}
>>>>>>> 6adaac7 (fix: update CluckTrack PWA for Next.js 16)
