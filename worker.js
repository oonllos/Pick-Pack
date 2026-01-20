// worker.js - ฉบับรองรับการเปิดหน้า apply.html

self.addEventListener('push', function(event) {
  // รับข้อมูลที่ส่งมาจาก index.js
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    vibrate: [100, 50, 100],
    // สำคัญ: ส่งต่อ object data (ที่มี url) ไปให้ event click ใช้งาน
    data: data.data 
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  // 1. ปิดการแจ้งเตือนทันทีที่กด
  event.notification.close();

  // 2. ดึง URL ที่แนบมา (จาก index.js)
  // ถ้าไม่มีแนบมา ให้เปิดหน้า apply.html เป็นค่า Default
  let urlToOpen = event.notification.data.url;
  if (!urlToOpen) {
      urlToOpen = 'https://oonllos.github.io/Pick-Pack/apply.html';
  }

  // 3. สั่งให้เปิดหน้าเว็บ
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(windowClients) {
      // กรณี A: ถ้าเปิดเว็บนี้ค้างไว้อยู่แล้ว (ไม่ว่าจะหน้าไหน)
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // ตรวจสอบว่าเป็นเว็บเดียวกันไหม
        if (client.url.includes('Pick-Pack') && 'focus' in client) {
            // สั่งเปลี่ยนหน้าไปที่ apply.html แล้วเด้งขึ้นมาดู
            return client.navigate(urlToOpen).then(client => client.focus());
        }
      }
      // กรณี B: ถ้ายังไม่เปิด ให้เปิดหน้าต่างใหม่เลย
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
