self.addEventListener('push', e => {
    const data = e.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        vibrate: [200, 100, 200]
    });
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});
