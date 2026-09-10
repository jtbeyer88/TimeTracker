self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});

// Handle notification interaction (tapping the notification or the Clock Out button)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'clock_out') {
    // Broadcast message to any open client or queue it to clock out
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        if (clientList.length > 0) {
          clientList[0].postMessage({ action: 'trigger_clock_out' });
          return clientList[0].focus();
        } else {
          return self.clients.openWindow('./index.html?action=clock_out');
        }
      })
    );
  } else {
    // Tapping the body of the notification opens/focuses the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          let client = clientList[i];
          if ('focus' in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow('./index.html');
      })
    );
  }
});
