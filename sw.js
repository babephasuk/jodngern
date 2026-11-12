// แคชเฉพาะไฟล์หน้าแอป (ไม่มีข้อมูลเงิน) เพื่อให้เปิดเร็ว คำขอไป Apps Script ไม่ผ่านแคช
var CACHE = 'jodngern-4.1.0';
var SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './icon-180.png'];

self.addEventListener('install', function (e) {
  // cache:'reload' = ข้ามแคชของเบราว์เซอร์ ให้ได้ไฟล์ใหม่จาก GitHub จริง ๆ ตอนอัปเดตเวอร์ชัน
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(SHELL.map(function (u) { return new Request(u, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// เปิดจากแคชทันที แล้วดึงไฟล์ใหม่มาเก็บไว้ใช้ครั้งถัดไป
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  var key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(key).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok && res.type === 'basic') c.put(key, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
