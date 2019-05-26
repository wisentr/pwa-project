var deferredPrompt;

/*Polyfill for old browsers */
if (!window.Promise) {
  window.Promise = Promise;
}

/*Base check, if ServiceWorker is available in user's browser */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(function () {
      console.log("ServiceWorker registered.");
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});
