let restaurants, neighborhoods, cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('[1] DOMContentLoaded');
  DBHelper.loadDeferredStyles();
  console.log('[2] Start loading Contents');
  DBHelper.InitializeIndexedDB((error,status) => {
    if (error) {console.error(error); }
    else {
      console.log('[3] Initialization Restaurants Perfect');
      console.log(status);


      //Promise.all([retrieveNeighborhoods(),retrieveCuisines()]).then(data) => {
      retrieveNeighborhoods((error,status) => {
        if (error) {console.error(error); } else {
          retrieveCuisines((error,status) => {
            if (error) {console.error(error); } else {
              console.log('[4] Data Retrieve Perfect');
              updateRestaurants(() => {
                console.log("[4.6] Update done ");
              });
            }
          });
        }
      });
    }
  });
  loadStaticMap((error,status) => {
    if (error) {console.error(error); } else {
      console.log('[5.2] Load Static Map Success');
    }
  });
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
retrieveNeighborhoods = (callback) => {
  DBHelper.retrieveNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
      callback(error,null);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
      callback(null,"Success");
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  select.innerHTML = '<option value="all" selected>All Neighborhoods</option>'; // reset select
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
retrieveCuisines = (callback) => {
  DBHelper.retrieveCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
      callback(error,null);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
      callback(null,"Success");
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  select.innerHTML = '<option value="all" selected>All Cuisines</option>'; // reset select
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};



/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  console.log('[4.1] UpdateRestaurants :'+cuisine+' / '+neighborhood);

  if(navigator.onLine && !document.getElementById('gmap-api') && (cuisine !== 'all' || neighborhood !== 'all')){
    console.log('[Event] Change Select --> includeAPI ');
    includeAPI();
  }

  console.log('[4.2] Retrieve Restaurants');
  if(cuisine === 'all' && neighborhood === 'all'){
    DBHelper.retrieveRestaurants((error, restaurants) => {
      if (error) {console.error(error);} else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    });
  }
  else if (cuisine === 'all') {
    DBHelper.retrieveRestaurantByNeighborhood(neighborhood, (error, restaurants) => {
      if (error) {console.error(error);} else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    });
  }
  else if (neighborhood === 'all') {
    DBHelper.retrieveRestaurantByCuisine(cuisine, (error, restaurants) => {
      if (error) {console.error(error);} else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    });
  }
  else {
    DBHelper.retrieveRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
      if (error) {console.error(error);} else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    });
  }
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  console.log('[4.3] Reset Restaurants');
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  console.log('[4.4] Fill Restaurants');
  const ul = document.getElementById('restaurants-list');
  if(restaurants.length > 0){
    restaurants.forEach(restaurant => {
      ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
  }
  else{
    // An error message is better than nothing !
    const p = document.createElement('p');
    const i = document.createElement('em');
    i.innerHTML = 'Sorry, no restaurants matched your selected filters !';
    p.append(i);
    ul.append(p);
  }
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  // Add figure element with picture
  const figure = document.createElement('figure');
  li.append(figure);
  const picture = document.createElement('picture');
  figure.append(picture);

	  // Webp for Chrome
	  const source_300webp = document.createElement('source');
	  source_300webp.media = '(min-width:1000px)';
	  source_300webp.type = 'image/webp'; // debug test in prod
	  source_300webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,300,'webp');
	  picture.append(source_300webp);
	  const source_200webp = document.createElement('source');
	  source_200webp.media = '(min-width:500px)';
	  source_200webp.type = 'image/webp'; // debug test in prod
	  source_200webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,200,'webp');
	  picture.append(source_200webp);
	  const source_100webp = document.createElement('source');
	  source_100webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,100,'webp');
	  source_100webp.type = 'image/webp'; // debug test in prod
	  picture.append(source_100webp);
	  // Jpg for other
	  const source_300jpg = document.createElement('source');
	  source_300jpg.media = '(min-width:1000px)';
	  source_300jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,300,'jpg');
	  picture.append(source_300jpg);
	  const source_200jpg = document.createElement('source');
	  source_200jpg.media = '(min-width:500px)';
	  source_200jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,200,'jpg');
	  picture.append(source_200jpg);
	  const image = document.createElement('img');
	  image.className = 'restaurant-img';
	  image.src = DBHelper.imageUrlForRestaurant(restaurant,100,'jpg');
  image.alt = `${restaurant.name} restaurant's photo in ${restaurant.neighborhood}`;
	  picture.append(image);
	  const figcaption = document.createElement('figcaption');
  figcaption.innerHTML =  `${restaurant.name} restaurant's photo in ${restaurant.neighborhood}`;
	  figure.append(figcaption);

  // div with textual content and button
  const div = document.createElement('div');
  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  div.append(name);
  const cuisine = document.createElement('p');
  cuisine.className = 'restaurant-cuisine';
  cuisine.innerHTML = restaurant.cuisine_type;
  div.append(cuisine);
  const neighborhood = document.createElement('p');
  neighborhood.className = 'restaurant-neighborhood';
  neighborhood.innerHTML = restaurant.neighborhood;
  div.append(neighborhood);
  const address = document.createElement('p');
  address.className = 'restaurant-address';
  address.innerHTML = restaurant.address;
  div.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('title', 'View details : ' + restaurant.name);
  more.setAttribute('aria-label', 'View details : ' + restaurant.name);
  more.setAttribute('tabindex', '0');
  div.append(more);
  li.append(div);
  return li;
};

/**
 * Render alternative Static Map
 */
loadStaticMap = (callback) => {
  console.log('[5.1] Load static map');
  const lat = 40.722216;
  const lng = -73.987501;
  const zoom = 12;
  const height = 400;
  const width = 640;
  const maptype = 'roadmap';
  const key = 'AIzaSyC7PG4bxfY8ul6b8YLstueqFeI6eRnnVmk';
  const staticmap = document.createElement('img');
  let flag_scroll = 0;

  // TODO replace with a fetch
  let markers = '&markers=color:0xff0000%7Clabel:%7C40.713829,-73.989667';
  markers += '&markers=color:0xff0000%7Clabel:%7C40.683555,-73.966393';
  markers += '&markers=color:0xff0000%7Clabel:%7C40.747143,-73.985414';
  markers += '&markers=color:0xff0000%7Clabel:%7C40.722216,-73.987501';
  markers += '&markers=color:0xff0000%7Clabel:%7C40.705089,-73.933585';

  markers += '&markers=color:0xff0000%7Clabel:%7C40.674925,-74.016162';
  markers += '&markers=color:0xff0000%7Clabel:%7C40.727397,-73.983645';
  markers += '&markers=color:0xff0000%7Clabel:%7C40.726584,-74.002082';
  markers += '&markers=color:0xff0000%7Clabel:%7C40.743797,-73.950652';
  markers += '&markers=color:0xff0000%7Clabel:%7C40.743394,-73.954235';

  staticmap.alt = 'NewYork City Map of Restaurants';
  staticmap.src = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=${maptype}&key=${key}&format=png&visual_refresh=true${markers}`;

  document.getElementById('map-static').append(staticmap);
  document.getElementById('map-static').style.display = 'block';

  // load now the google one
  document.getElementById('map-static').addEventListener('click', function(){
    if(navigator.onLine && !document.getElementById('gmap-api')){
      console.log('[Event] Click on Map --> includeAPI ');
      includeAPI();
    }
  });
  document.addEventListener('scroll', function(){
    if(navigator.onLine && !document.getElementById('gmap-api') && flag_scroll === 0){
      console.log('[Event] Scroll --> includeAPI ');
      flag_scroll++;
      includeAPI();
    }
  });

  callback(null,"Success")
};

/*
 * Defer rending Include Google Maps API
* https://codepen.io/svinkle/pen/vJmlt
 */
includeAPI = () => {
  console.log('[6.1] Include Google API');
  const gkey = 'AIzaSyC7PG4bxfY8ul6b8YLstueqFeI6eRnnVmk';
  let js;
  let fjs = document.getElementsByTagName('script')[0];
  if (!document.getElementById('gmap-api')) {
    js = document.createElement('script');
    js.id = 'gmap-api';
    js.setAttribute('async', '');
    js.setAttribute('defer', '');
    js.src = 'https://maps.googleapis.com/maps/api/js?key='+gkey+'&libraries=places&force=pwa&callback=initMap';
    fjs.parentNode.insertBefore(js, fjs);
  }
};

/**
 * Initialize Google map, called from HTML.
 */
initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  if (navigator.onLine) {
    console.log('[6.2] Initialize GMap');
    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: loc,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: false
    });
    addMarkersToMap();

    console.log('[6.3] Add title to iframe');
    const iframeloaded = document.querySelector('#map iframe') !== null;
    if(iframeloaded){
      document.querySelector('#map iframe').setAttribute('title', 'New York City Map of Restaurants');
    }
  }
};


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  console.log('[4.5] Add Markers To Map');
  console.log(restaurants);
  if (typeof google === 'object' && typeof google.maps === 'object' && restaurants !== null && restaurants !== undefined && restaurants.length > 0) {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
      google.maps.event.addListener(marker, 'click', () => {
        window.location.href = marker.url;
      });
      self.markers.push(marker);
    });
  }
  else{
    console.log('Google map not loaded !');
  }
};
