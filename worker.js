self.addEventListener('push', e => {
    const data = e.data.json();
    
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        vibrate: [200, 100, 200],
        // รับข้อมูล url ที่ส่งมาจาก Server
        data: data.data 
    });
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    // ดึง URL จากข้อมูลที่แนบมา (ถ้าไม่มีให้เปิดหน้าแรก)
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // ถ้าเปิดหน้าเว็บอยู่แล้ว ให้ Focus หน้านั้น
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // ถ้ายังไม่เปิด ให้เปิดหน้าต่างใหม่
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
