/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    if(self.fetch) {
      // FETCH
      fetch('http://localhost:1337/restaurants', {})
      .then(response => response.json())
      .then(function(restaurantsJson) {addRestaurants(restaurantsJson);})
      .catch(e => requestError(e, 'restaurants'));

      function requestError(e, part) {
        const error = (e);
        callback(error, null);
      }
    } else {
      // XHR
      let xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://localhost:1337/restaurants');
      xhr.onload = () => {
        if (xhr.status === 200) { // Got a success response from server!
          const restaurants = JSON.parse(xhr.responseText);
          console.log(restaurants);
          callback(null, restaurants);
        } else { // Oops!. Got an error from server.
          const error = (`Request failed. Returned status of ${xhr.status}`);
          callback(error, null);
        }
      };
      xhr.onerror = () => {console.log( 'An error occurred 😞' );};
      xhr.send();
    }

    if (!('indexedDB' in window)) {
      console.log('This browser doesn\'t support IndexedDB');
      return;
    }
    const dbName = "Time4FoodDatabase";
    var dbPromise = idb.open(dbName, 3, function(upgradeDb) {
      switch (upgradeDb.oldVersion) {
        case 0:
          // a placeholder case so that the switch block will
          // execute when the database is first created
        case 1:
          console.log('Creating the restaurants object store');
          upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        case 2:
          console.log('Creating neighborhood and cuisines indexes');
          var store = upgradeDb.transaction.objectStore('restaurants');
          store.createIndex('neighborhood', 'neighborhood');
          store.createIndex('cuisine_type', 'cuisine_type');
       case 3:
          console.log('Creating neighborhood - cuisines indexes');
          var store = upgradeDb.transaction.objectStore('restaurants');
          store.createIndex('neighborhood, cuisine_type', ['neighborhood', 'cuisine_type']);
      }
    });
    dbPromise.onerror = function(event) {alert("error opening IndexedDB.");};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};

    function addRestaurants(JsonRestaurants) {
      console.log("addRestaurants");
      console.log(JsonRestaurants);
      dbPromise.then(function(db) {
        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');
        var items = JsonRestaurants;
        return Promise.all(items.map(function(item) {
            //console.log('Adding item: ', item);
            return store.add(item);
          })
        ).catch(function(e) {
          tx.abort();
          console.log(e);
        }).then(function() {
          console.log('All items added successfully!');
        });
      });
      callback(null, restaurants)
    }

  }
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    db.transaction("restaurants").objectStore("restaurants").get(id).onsuccess = function(event) {
        console.log("Restaurant is " + event.target.result);
        callback(null, event.target.result);
    };
    //
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    db.transaction("restaurants").objectStore("cuisine_type").get(cuisine).onsuccess = function(event) {
        console.log("Cuisine is " + event.target.result);
        callback(null, event.target.result);
    };
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    db.transaction("restaurants").objectStore("neighborhood").get(neighborhood).onsuccess = function(event) {
        console.log("Neighborhood is " + event.target.result);
        callback(null, event.target.result);
    };
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    db.transaction("restaurants").objectStore("neighborhood,cuisine_type").get([neighborhood,cuisine]).onsuccess = function(event) {
        console.log("Neighborhood-cuisine is " + event.target.result);
        callback(null, event.target.result);
    };
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    db.transaction("restaurants").objectStore("neighborhood").getAll().onsuccess = function(event) {
        console.log("Neighborhood is " + event.target.result);
        callback(null, event.target.result);
    };
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
      // Get all cuisines from all restaurants
      // Remove duplicates from cuisines
    idb.transaction("restaurants").objectStore("cuisine_type").getAll().onsuccess = function(event) {
        console.log("Cuisine is " + event.target.result);
        callback(null, event.target.result);
    };
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant,size,extension="jpg") {
	// Add suffix 100, 200, 400 or 800w
	// Rename extension : WebP for Chrome , Jpg for other
  // Use Svg if no picture found
  //return (restaurant.photograph)? `/img/${restaurant.photograph}_${size}w.${extension}`:`/img/0_${size}w.${extension}`;
  return (restaurant.photograph)? `/img/${restaurant.photograph}_${size}w.${extension}`:`/logo/BSicon_REST.svg`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
