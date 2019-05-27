//can not access the project files in sw.js unless imported here specifically
importScripts('/src/js/idb.js');
importScripts('/src/js/db.js');

var CACHE_STATIC_NAME = 'static-v9';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
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

// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName)
//     .then(function (cache) {
//       return cache.keys()
//         .then(function (keys) {
//           if (keys.length > maxItems) {
//             //remove the oldest key from the cache
//             cache.delete(keys[0])
//               //once the keys.length is <= to maxItem, recursive call will stop.
//               .then(trimCache(cacheName, maxItems))
//           }
//         });
//     })
// }

self.addEventListener("install", function (event) {
  console.log("[ServiceWorker] Installing ServiceWorker ...", event);
  //ensuring installation event is not completed before caching is done.
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        console.log('[ServiceWorker] Precaching App shell');
        /*sw will send the request to the server, get that asset, and stores it, in one step. */
        cache.addAll(STATIC_FILES);
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

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', function (event) {
  var url = 'https://pwagram1-dcab1.firebaseio.com/posts';
  if (event.request.url.indexOf(url) > -1) {
    //cache then network, dynamic caching, only for var url defined upside
    event.respondWith(
      fetch(event.request)
        .then(function (res) {
          var clonedRes = res.clone();
          clonedRes.json()//returns a promise
            .then(function (data) {
              for (var key in data) {
                writeData('posts', data[key])
              }
            });
          return res;
        })
    );
    //if the url matches the regexp, load from cache only
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    //cache only strategy for static files
    event.respondWith(
      caches.match(event.request)
    );
  } else {
    //cache with network fallback strategy for all the urls except the var url defined upside.
    event.respondWith(caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function (cache) {
                  //trimCache(CACHE_DYNAMIC_NAME, 30);
                  cache.put(event.request.url, res.clone())
                  return res;
                })
            })
            .catch(function (err) {
              return caches.open(CACHE_STATIC_NAME)
                .then(function (cache) {
                  //if incoming request accepts html for an answer... 
                  if (event.request.headers.get('accept').includes('text/html')) {
                    //fallback to offline.html only when for example /help is requested, not for css files :) 
                    return cache.match('/offline.html')
                  }
                });
            });
        }
      }))
  }
});

/* //default caching strategy - Cache With Network Fallback
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function (cache) {
                  cache.put(event.request.url, res.clone())
                  return res;
                })
            })
            .catch(function (err) {
              return caches.open(CACHE_STATIC_NAME)
                .then(function (cache) {
                  return cache.match('/offline.html')
                });
            });
        }
      })
  );
}); */

/* //Network with cache fallback strategy
self.addEventListener('fetch', function (event) {
  event.respondWith(
    fetch(event.request)
      .then(function(res) {
        return caches.open(CACHE_DYNAMIC_NAME)
          .then(function(cache) {
            cache.put(event.request.url, res.clone());
            return res;
          })
      })
      .catch(function (err) {
        return caches.match(event.request);
      })
  );
}); */