const staticCacheName = 'nico-static-resto-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/index.html',
        '/restaurant.html',
        '/css/styles.css',
        '/css/font-awesome.min.css',
        '/fonts/CaviarDreams.ttf',
        '/fonts/fontawesome-webfont.ttf',
        '/img/1_100w.jpg',
        '/img/2_100w.jpg',
        '/img/3_100w.jpg',
        '/img/4_100w.jpg',
        '/img/5_100w.jpg',
        '/img/6_100w.jpg',
        '/img/7_100w.jpg',
        '/img/8_100w.jpg',
        '/img/9_100w.jpg',
        '/img/10_100w.jpg',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/js/script.js',
        '/logo/BSicon_REST.png',
        '/logo/BSicon_REST.svg',
        'manifest.json'
	    ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log(event.request.url);
  event.respondWith(
	  caches.match(event.request).then(function(response) {
		if (response !== undefined) {
		  return response;
		} else {
		  return fetch(event.request).then(function (response) {
			const responseClone = response.clone();
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
