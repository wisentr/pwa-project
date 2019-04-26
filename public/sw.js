self.addEventListener("install", function(event) {
  console.log("[ServiceWorker] Installing ServiceWorker ...", event);
});

self.addEventListener("activate", function(event) {
  console.log("[ServiceWorker] Activating ServiceWorker ...", event);
  /*To ensure ServiceWorkers are loaded, or are activated correctly */
  return self.clients.claim();
});
