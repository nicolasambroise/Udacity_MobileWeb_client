let restaurants, neighborhoods, cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

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

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

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
	  source_300webp.media = "(min-width:1000px)";
	  source_300webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,300,"webp");
	  picture.append(source_300webp);
	  const source_200webp = document.createElement('source');
	  source_200webp.media = "(min-width:500px)";
	  source_200webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,200,"webp");
	  picture.append(source_200webp);
	  const source_100webp = document.createElement('source');
	  source_100webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,100,"webp");
	  picture.append(source_100webp);
	  // Jpg for other
	  const source_300jpg = document.createElement('source');
	  source_300jpg.media = "(min-width:1000px)";
	  source_300jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,300,"jpg");
	  picture.append(source_300jpg);
	  const source_200jpg = document.createElement('source');
	  source_200jpg.media = "(min-width:500px)";
	  source_200jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,200,"jpg");
	  picture.append(source_200jpg);
	  const image = document.createElement('img');
	  image.className = 'restaurant-img';
	  image.src = DBHelper.imageUrlForRestaurant(restaurant,100,"jpg");
      image.alt = restaurant.name;
	  picture.append(image);
	const figcaption = document.createElement('figcaption');
    figcaption.innerHTML = restaurant.name;
	figure.append(figcaption);

  // div with textual content and button
  const div = document.createElement('div');
  li.append(div);
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

    // TODO: improve the display of the button !
    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    div.append(more)

  return li;
}

/**
 * Dynamically add title to the GoogleMap iframe.
 */
window.addEventListener('load', () => {
  document.querySelector('#map iframe').setAttribute('title', 'NewYork City Map of Restaurants');
});


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
