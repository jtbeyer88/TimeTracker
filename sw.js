self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const isClockOut = (event.action === 'clock_out');
  const targetUrl = isClockOut 
    ? 'https://jtbeyer88.github.io/TimeTracker/?action=clock_out' 
    : 'https://jtbeyer88.github.io/TimeTracker/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If the app is already open in memory, focus it
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes('TimeTracker') && 'focus' in client) {
          if (isClockOut) {
            client.postMessage({ action: 'trigger_clock_out' });
          }
          return client.focus();
        }
      }
      // If the app was closed or discarded, launch a fresh window directly to the app
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
