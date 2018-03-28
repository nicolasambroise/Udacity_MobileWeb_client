const staticCacheName = 'nico-static-resto-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '.',
        '/',
        'index.html',
        'restaurant.html',
        'css/styles.css',
        'css/font-awesome.min.css',
        'fonts/CaviarDreams.ttf',
        'fonts/fontawesome-webfont.ttf',
        'js/dbhelper.js',
        'js/main.js',
        'js/restaurant_info.js',
        'js/script.js',
        'data/restaurants.json',
        'logo/BSicon_REST.png',
        'logo/BSicon_REST.svg',
        'manifest.json'
	    ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  // console.log(event.request.url);
  // Exclude map file from cache
  if(event.request.url.indexOf("https://maps.gstatic.com/mapfiles/") > -1){
    return null;
  }
  //console.log(event.request);
  event.respondWith(caches.match(event.request).then(function(response) {
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
	}));
});

self.addEventListener('message', function(event) {
  console.log(event.data.action);
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});