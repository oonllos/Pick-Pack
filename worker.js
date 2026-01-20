// worker.js - ฉบับแก้ไข (Fix Navigation & Force Apply Page)

self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Push data parse failed', e);
    }
  }
  
  const options = {
    body: data.body || 'มีงานใหม่เข้ามา!',
    icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    vibrate: [100, 50, 100],
    // ส่งต่อ object data ทั้งก้อนไปให้ event click
    data: data.data || {} 
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Makro Job Alert', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  // 1. ปิดการแจ้งเตือนทันที
  event.notification.close();

  // 2. ดึง URL และตรวจสอบความถูกต้อง
  const notificationData = event.notification.data || {};
  let urlToOpen = notificationData.url;

  // ⭐ แก้ไขจุดสำคัญ: ถ้า URL ว่างเปล่า หรือเป็นลิ้งค์เก่า (/?mode=apply) ให้บังคับไปหน้า apply.html
  // เพื่อป้องกันไม่ให้เด้งกลับไปหน้า Home
  if (!urlToOpen || urlToOpen === '/' || urlToOpen.includes('?mode=apply')) {
      urlToOpen = 'https://oonllos.github.io/Pick-Pack/apply.html';
  }

  // 3. สั่งให้เปิดหน้าเว็บ
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(windowClients) {
      // กรณี A: ถ้ามีหน้าเว็บของแอพเปิดค้างไว้อยู่แล้ว
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // ตรวจสอบว่าเป็นเว็บเราไหม (เช็คจากชื่อโฟลเดอร์ Pick-Pack)
        if (client.url.includes('Pick-Pack') && 'focus' in client) {
            // สเต็ปสำคัญ: สั่ง Focus เรียกหน้าจอก่อน แล้วค่อยโหลดหน้าใหม่
            return client.focus().then(() => {
                return client.navigate(urlToOpen);
            });
        }
      }
      // กรณี B: ถ้ายังไม่เปิดเลย ให้เปิดหน้าต่างใหม่
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
