/*Base check, if ServiceWorker is available in user's browser */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(function() {
    console.log("ServiceWorker registered.");
  });
}
