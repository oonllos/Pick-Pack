self.addEventListener('push', e => {
    const data = e.data.json();
    
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        data: data.data // สำคัญมาก: ส่ง url ต่อไปให้ event click
    });
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    // ดึง URL จาก Deep Link หรือใช้ Default
    const urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // ถ้าเปิดหน้าเว็บค้างไว้อยู่แล้ว ให้ Refresh ไปที่ URL นั้น
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url && 'focus' in client) {
                    client.navigate(urlToOpen); // บังคับเปลี่ยนหน้าไปที่ ?mode=apply
                    return client.focus();
                }
            }
            // ถ้ายังไม่เปิด ให้เปิดหน้าใหม่
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
