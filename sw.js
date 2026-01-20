// sw.js
self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'แจ้งเตือนงานใหม่!';
  const options = {
    body: data.body || 'มีตำแหน่งงานว่างใกล้คุณ',
    icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991195.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2991/2991195.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(event.notification.data.url);
      })
  );
});
