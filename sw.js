self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/index.html'
	    ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
	  caches.match(event.request).then(function(response) {
		if (response !== undefined) {
		  return response;
		} else {
		  return fetch(event.request).then(function (response) {
			var responseClone = response.clone();
			return response;
		  }).catch(function () {
			     return caches.match('');
		  });
		}
	  })
  );
});

self.addEventListener('message', function(event) {
  console.log(event.data.action);
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('sync', function(event) {
	console.log("sync: "+event);
});
