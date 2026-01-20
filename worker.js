self.addEventListener('push', e => {
    const data = e.data.json();
    
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        data: data.data 
    });
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    // ดึง URL ที่ส่งมาจาก Server
    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // 1. ถ้าเปิดหน้าเว็บค้างไว้อยู่แล้ว
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // เช็คว่าใช่เว็บเราไหม
                if (client.url.includes('Pick-Pack') && 'focus' in client) {
                    // ⭐ สำคัญ: สั่งให้ไปที่ URL ใหม่ แล้ว Refresh ทันที
                    return client.navigate(urlToOpen).then(c => c.focus());
                }
            }
            // 2. ถ้ายังไม่เปิด ให้เปิดหน้าต่างใหม่
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
