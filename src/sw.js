const staticCacheName = 'nico-static-resto-v1';

const srcFiles = [
  'css/styles.css',
  'css/normalize.css',
  'css/small.css',
  'js/dbhelper.js',
  'js/idb.js',
  'js/main.js',
  'js/restaurant_info.js'
]

const distFiles = [
  'css/styles_all.css',
  'js/script_all.js'
]

const staticFiles = [
  './',
  'index.php',  /* Conflict if we use index.html on Heroku */
  'home.html',  /* Conflict if we use index.html on Heroku */
  'restaurant.html',
  'fonts/subset-CaviarDreams.ttf',
  'fonts/subset-fontawesome.ttf',
  'logo/BSicon_REST_16w.png',
  'logo/BSicon_REST.svg',
  'img/1_100w.jpg','img/1_100w.webp','img/1_200w.jpg','img/1_200w.webp',
  'img/1_300w.jpg','img/1_300w.webp','img/1_400w.jpg','img/1_400w.webp',
  'img/1_800w.jpg','img/1_800w.webp',
  'img/2_100w.jpg','img/2_100w.webp','img/2_200w.jpg','img/2_200w.webp',
  'img/2_300w.jpg','img/2_300w.webp','img/2_400w.jpg','img/2_400w.webp',
  'img/2_800w.jpg','img/2_800w.webp',
  'img/3_100w.jpg','img/3_100w.webp','img/3_200w.jpg','img/3_200w.webp',
  'img/3_300w.jpg','img/3_300w.webp','img/3_400w.jpg','img/3_400w.webp',
  'img/3_800w.jpg','img/3_800w.webp',
  'img/4_100w.jpg','img/4_100w.webp','img/4_200w.jpg','img/4_200w.webp',
  'img/4_300w.jpg','img/4_300w.webp','img/4_400w.jpg','img/4_400w.webp',
  'img/4_800w.jpg','img/4_800w.webp',
  'img/5_100w.jpg','img/5_100w.webp','img/5_200w.jpg','img/5_200w.webp',
  'img/5_300w.jpg','img/5_300w.webp','img/5_400w.jpg','img/5_400w.webp',
  'img/5_800w.jpg','img/5_800w.webp',
  'img/6_100w.jpg','img/6_100w.webp','img/6_200w.jpg','img/6_200w.webp',
  'img/6_300w.jpg','img/6_300w.webp','img/6_400w.jpg','img/6_400w.webp',
  'img/6_800w.jpg','img/6_800w.webp',
  'img/7_100w.jpg','img/7_100w.webp','img/7_200w.jpg','img/7_200w.webp',
  'img/7_300w.jpg','img/7_300w.webp','img/7_400w.jpg','img/7_400w.webp',
  'img/7_800w.jpg','img/7_800w.webp',
  'img/8_100w.jpg','img/8_100w.webp','img/8_200w.jpg','img/8_200w.webp',
  'img/8_300w.jpg','img/8_300w.webp','img/8_400w.jpg','img/8_400w.webp',
  'img/8_800w.jpg','img/8_800w.webp',
  'img/9_100w.jpg','img/9_100w.webp','img/9_200w.jpg','img/9_200w.webp',
  'img/9_300w.jpg','img/9_300w.webp','img/9_400w.jpg','img/9_400w.webp',
  'img/9_800w.jpg','img/9_800w.webp',
  'img/10_100w.jpg','img/10_100w.webp','img/10_200w.jpg','img/10_200w.webp',
  'img/10_300w.jpg','img/10_300w.webp','img/10_400w.jpg','img/10_400w.webp',
  'img/10_800w.jpg','img/10_800w.webp',
  'img/no-image_100w.jpg','img/no-image_100w.webp','img/no-image_200w.jpg','img/no-image_200w.webp',
  'img/no-image_300w.jpg','img/no-image_300w.webp','img/no-image_400w.jpg','img/no-image_400w.webp',
  'img/no-image_800w.jpg','img/no-image_800w.webp',
  'manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
        arrayFiles = staticFiles.concat(srcFiles); //distFiles --> Production env.
        return cache.addAll(arrayFiles); // Dev env.
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Exclude map file from cache
  if(event.request.url.indexOf("https://maps.gstatic.com/mapfiles/") > -1){return null;}
  // check for parameter
  if(event.request.url.indexOf('html') > -1){
    console.log('* SW cache '+ event.request.url);
    if(event.request.url.indexOf("?") > -1){ console.log('* SW param '+event.request.url);}
  }

  // Exclude parameters from URL with ignoreSearch option for caching "restaurant.html?id=X"
  event.respondWith(
    caches.match(event.request, {'ignoreSearch': true}).then(function(response) {
      if (response !== undefined) {
		    return response;
		  } else {
		    return fetch(event.request).then(function (response) {
			    return response;
		    }).catch(function () {
			    return caches.match('');
		    });
		  }
	  })
  );
});
self.addEventListener('activate', function(event) {
  // Activating new service worker and deleting old ones.
  var cacheWhitelist = [staticCacheName];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
