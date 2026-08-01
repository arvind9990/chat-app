/* global clients */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  clients.openWindow("/");
});
