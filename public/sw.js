var CACHE_STATIC_NAME = 'static-v5';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var CACHED_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/material.min.js',
  // polyfills do not need to be cached, since the older browsers do not support serviceworkers anyway. But, there's performance gain. 
  // Even modern browsers need to load these files, because they imported in index.html, so storing them in cache will increase performance.
  // This can be optimized with a build workflow, to conditionally load them
  '/src/js/promise.js',
  '/src/js/fetch.js',
  // Styles
  '/src/css/app.css',
  '/src/css/feed.css',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
  '',
  // Images
  '/src/images/main-image.jpg'
]

self.addEventListener("install", function (event) {
  console.log("[ServiceWorker] Installing ServiceWorker ...", event);
  //ensuring installation event is not completed before caching is done.
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        console.log('[ServiceWorker] Precaching App shell');
        /*sw will send the request to the server, get that asset, and stores it, in one step. */
        cache.addAll(CACHED_URLS);
      })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[ServiceWorker] Activating ServiceWorker ...", event);
  event.waitUntil(
    //keys gives all sub-caches in cache storage
    caches.keys()
      .then(function (keyList) {
        //Promise.all takes an array of promises, and waits for all of them to finish
        //then i transform array of strings into array of promises by using map method
        return Promise.all(keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[ServiceWorker] Removing old cache...', key);
            return caches.delete(key);
          }
        }))
      })
  )
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
          return fetch(event.request)
            //res is response from the actual server
            .then(function (res) {
              return caches.open(CACHE_DYNAMIC_NAME)
                //cache is created, or opened if it exists already
                .then(function (cache) {
                  //unlike add, put requires you to provide the request, which I do here
                  //so, put does not send a request, it stores the data you already have
                  cache.put(event.request.url, res.clone())
                  //res.clone() because response obj can be consumed only once, then it will be empty
                  return res;
                })
            })
            //provide the fallback page here
            .catch(function (err) {
              return caches.open(CACHE_STATIC_NAME)
                .then(function (cache) {
                  return cache.match('/offline.html')
                });
            });
        }
      })
  );
});