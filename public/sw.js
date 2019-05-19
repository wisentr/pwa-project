self.addEventListener("install", function (event) {
  console.log("[ServiceWorker] Installing ServiceWorker ...", event);
  //ensuring installation event is not completed before caching is done.
  event.waitUntil(
    caches.open('static')
      .then(function (cache) {
        console.log('[ServiceWorker] Precaching App shell');
        /*sw will send the request to the server, get that asset, and stores it, in one step. */
        cache.add('/');
        cache.add('/index.html');
        cache.add('/src/js/app.js');
      })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[ServiceWorker] Activating ServiceWorker ...", event);
  /*To ensure ServiceWorkers are loaded, or are activated correctly */
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    //requests are keys, so i match request
    caches.match(event.request)
      //this will be executed regardless the response is null or not. 
      .then(function (response) {
        //check if the response is null 
        if (response) {
          //returning the response from the cache
          return response;
        } else {
          //if the request key is not in the cache, continue with the original request
          return fetch(event.request);
        }
      })
  );
});