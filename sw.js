// Version 3.0 - Background Agenda Alerts & Service Worker
let activeTimers = {};

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
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes('TimeTracker') && 'focus' in client) {
          if (isClockOut) {
            client.postMessage({ action: 'trigger_clock_out' });
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle Background Agenda Alarms
self.addEventListener('message', function(event) {
  if (event.data && event.data.action === 'schedule_agenda_alerts') {
    const alerts = event.data.alerts || [];

    // Clear existing timers in worker memory
    Object.keys(activeTimers).forEach(id => clearTimeout(activeTimers[id]));
    activeTimers = {};

    const now = Date.now();

    alerts.forEach(item => {
      const delay = item.reminderEpoch - now;
      if (delay > 0) {
        activeTimers[item.id] = setTimeout(() => {
          self.registration.showNotification(`Upcoming Task at ${item.time}`, {
            body: item.location ? `${item.location}: ${item.task}` : item.task,
            tag: `agenda-reminder-${item.id}`,
            icon: 'https://cdn-icons-png.flaticon.com/512/2972/2972531.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/2972/2972531.png',
            requireInteraction: true,
            vibrate: [200, 100, 200]
          });
          delete activeTimers[item.id];
        }, delay);
      }
    });
  }
});
