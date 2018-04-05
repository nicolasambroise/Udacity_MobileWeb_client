/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * InitializeIndexedDB
   */
  static InitializeIndexedDB(callback){
    // Step 1 : Build IDB
    if (!('indexedDB' in window)) {
      console.log('This browser doesn\'t support IndexedDB');
      const error = ('This browser doesn\'t support IndexedDB');
      callback(error, null);
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
          store.createIndex('neighborhood,cuisine_type', ['neighborhood', 'cuisine_type']);
      }
    });
    dbPromise.onerror = function(event) {alert("error opening IndexedDB.");};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};

    // Step 2 : Get data as JSON
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

    // Step 3 : Put data in IDB
    function addRestaurants(JsonRestaurants) {
      console.log("addRestaurants");
      console.log(JsonRestaurants);

      dbPromise.then(function(db) {
        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');
        var items = JsonRestaurants;
        return Promise.all(items.map(function(item) {
            return store.add(item);
          })
        ).catch(function(e) {
          tx.abort();
          console.log(e);
        }).then(function() {
          console.log('All items added successfully!');
          callback(null,"success");
        });
      });
    }
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    console.log("fetch all Restaurants");
    const dbName = "Time4FoodDatabase";
    var dbPromise = idb.open(dbName, 3);
    dbPromise.onerror = function(event) {alert("error opening IndexedDB.");};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback("error starting transaction.",null);}
      var store = tx.objectStore("restaurants");
      return store.getAll();
    }).then(function(val){
      console.log(val);
      callback(null, val);
    });
  }
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
      const dbName = "Time4FoodDatabase";
      var dbPromise = idb.open(dbName, 3);
      dbPromise.onerror = function(event) {alert("error opening IndexedDB.");};
      dbPromise.onsuccess = function(event) {db = dbPromise.result;};
      dbPromise.then(function(db) {
        db.transaction("restaurants").objectStore("restaurants").get(id).onsuccess = function(event) {
          console.log("Restaurant is " + event.target.result);
          callback(null, event.target.result);
      };
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    console.log("fetch all restaurant By Cuisine :"+cuisine);
    const dbName = "Time4FoodDatabase";
    var dbPromise = idb.open(dbName, 3);
    dbPromise.onerror = function(event) {alert("error opening IndexedDB.");};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback("error starting transaction.",null);}
      var store = tx.objectStore("restaurants");
      var cuisineIndex = store.index('cuisine_type');
      return cuisineIndex.getAll(cuisine);
    }).then(function(val){
      console.log(val);
      callback(null, val);
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    console.log("fetch all restaurant By Neighborhood :"+neighborhood);
    const dbName = "Time4FoodDatabase";
    var dbPromise = idb.open(dbName, 3);
    dbPromise.onerror = function(event) {alert("error opening IndexedDB.");};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback("error starting transaction.",null);}
      var store = tx.objectStore("restaurants");
      var neighborhoodIndex = store.index('neighborhood');
      return neighborhoodIndex.getAll(neighborhood);
    }).then(function(val){
      console.log(val);
      callback(null, val);
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    console.log("fetch all restaurant By Cuisine and Neighborhood :"+cuisine+","+neighborhood);
    const dbName = "Time4FoodDatabase";
    var dbPromise = idb.open(dbName, 3);
    dbPromise.onerror = function(event) {alert("error opening IndexedDB.");};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback("error starting transaction.",null);}
      var store = tx.objectStore("restaurants");
      var bothIndex = store.index('neighborhood,cuisine_type');
      return bothIndex.getAll([neighborhood,cuisine]);
    }).then(function(val){
      console.log(val);
      callback(null, val);
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    console.log("fetchNeighborhoods for select list");
    const dbName = "Time4FoodDatabase";
    var dbPromise = idb.open(dbName, 3);
    dbPromise.onerror = function(event) {alert("error opening IndexedDB.");};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback("error starting transaction.",null);}
      var store = tx.objectStore("restaurants");
      var neighborhoodIndex = store.index('neighborhood');
      return neighborhoodIndex.getAll();
    }).then(function(val){
      let distinctVal = [];
      val.forEach(function(element) {
        if (distinctVal.indexOf(element.neighborhood) < 0) {
            distinctVal.push(element.neighborhood);
        }
      });
      console.log(distinctVal);
      callback(null, distinctVal);
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    console.log("fetchCuisines for select list");
    const dbName = "Time4FoodDatabase";
    var dbPromise = idb.open(dbName, 3);
    dbPromise.onerror = function(event) {alert("error opening IndexedDB.");};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback("error starting transaction.",null);}
      var store = tx.objectStore("restaurants");
      var cuisineIndex = store.index('cuisine_type');
      return cuisineIndex.getAll();
    }).then(function(val){
      let distinctVal = [];
      val.forEach(function(element) {
        if (distinctVal.indexOf(element.cuisine_type) < 0) {
            distinctVal.push(element.cuisine_type);
        }
      });
      console.log(distinctVal);
      callback(null, distinctVal);
    });
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
    return (restaurant.photograph)? `/img/${restaurant.photograph}_${size}w.${extension}`:`/img/no-image_${size}w.${extension}`;
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
