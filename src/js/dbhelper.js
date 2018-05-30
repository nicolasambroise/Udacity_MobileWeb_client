/**
 * Common database helper functions.
 */
class DBHelper {

  static get DATABASE_URL() {
     /* 3 servers :
      - Localhost : localhost:8000/ --> prod_path = ""
      - Heroku : https://nia-mws.herokuapp.com/ --> prod_path = ""
      - OVH : https://nicolasambroise.com/mws/ --> prod_path = "/mws"
     */
      const port = 1337;
      const path = window.location.href;

      if(path.indexOf('localhost') > -1){
        return `http://localhost:${port}/`;
      }
      else if (path.indexOf('herokuapp') || path.indexOf('nicolasambroise') > -1) {
        return `https://nia-mws-3.herokuapp.com/`;
      }
      else{console.log('Error Path :'+path);return;}
    }

  /**
   * InitializeIndexedDB
   */
  static InitializeIndexedDB(callback){
    // Step 1 : Build IDB
    console.log('InitializeIndexedDB');
    if (!('indexedDB' in window)) {
      console.log('This browser doesn\'t support IndexedDB');
      const error = ('This browser doesn\'t support IndexedDB');
      callback(error, null);
    }
    const dbName = 'Time4FoodRestaurantsDatabase';

    var dbPromise = idb.open(dbName, 1,function(upgradeDb) {
      console.log('Creating the restaurants object store');
      upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
      console.log('Creating neighborhood and cuisines indexes');
      var store = upgradeDb.transaction.objectStore('restaurants');
      store.createIndex('neighborhood', 'neighborhood');
      store.createIndex('cuisine_type', 'cuisine_type');
      store.createIndex('neighborhood,cuisine_type', ['neighborhood', 'cuisine_type']);
    });
    dbPromise.onupgradeneeded = function(e) {console.log('dbPromise onupgradeneeded');};
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {console.log('dbPromise onSuccess');};

    // Step 2 : Get data as JSON or wait for it
    if (navigator.onLine) {
      requestRestaurant();
    }
    else{
      console.log('offline');
      window.addEventListener('online', function(e) { requestRestaurant(); });

      // TODO : Check if database already exist
      callback(null,'offline');
    }

    function requestRestaurant(){
      console.log('online : request Restaurant');
      if(self.fetch) {
        // FETCH
        fetch(`${DBHelper.DATABASE_URL}restaurants`, {
          headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }})
          .then(response => response.json())
          .then(function(restaurantsJson) {addRestaurants(restaurantsJson);})
          .catch(error => callback(error, null));
      } else {
        // XHR
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${DBHelper.DATABASE_URL}restaurants`);
        xhr.onload = () => {
          if (xhr.status === 200) { // Got a success response from server!
            const restaurants = JSON.parse(xhr.responseText);
            addRestaurants(restaurantsJson);
          } else { // Oops!. Got an error from server.
            const error = (`Request failed. Returned status of ${xhr.status}`);
            callback(error, null);
          }
        };
        xhr.onerror = () => {console.log('An error occurred');};
        xhr.send();
      }
    }

    // Step 3 : Put data in IDB
    function addRestaurants(JsonRestaurants) {
      console.log('addRestaurants');
      console.log(JsonRestaurants);

      // TODO : Add only if index not exist

      dbPromise.then(function(db) {
        var tx = db.transaction('restaurants','readwrite');
        var store = tx.objectStore('restaurants');
        var items = JsonRestaurants;

        return Promise.all(items.map(function(item) {
          return store.put(item);
        })
        ).catch(function(e) {
          tx.abort();
          console.log(e);
        }).then(function() {
          console.log('All items added successfully!');
          callback(null,'success');
        });
      });
    }
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    console.log('fetch all Restaurants');
    const dbName = 'Time4FoodRestaurantsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) {callback('error starting transaction.',null);};
      var store = tx.objectStore('restaurants');
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
    console.log('fetch the Restaurant with ID #'+id);
    const dbName = 'Time4FoodRestaurantsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback('error starting transaction.',null);};
      var store = tx.objectStore('restaurants');
      //console.log(typeof id); id should by Integer !
      return store.get(parseInt(id));
    }).then(function(val){
      callback(null, val);
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    console.log('fetch all restaurant By Cuisine :'+cuisine);
    const dbName = 'Time4FoodRestaurantsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback('error starting transaction.',null);};
      var store = tx.objectStore('restaurants');
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
    console.log('fetch all restaurant By Neighborhood :'+neighborhood);
    const dbName = 'Time4FoodRestaurantsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback('error starting transaction.',null);};
      var store = tx.objectStore('restaurants');
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
    console.log('fetch all restaurant By Cuisine and Neighborhood :'+cuisine+','+neighborhood);
    const dbName = 'Time4FoodRestaurantsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback('error starting transaction.',null);};
      var store = tx.objectStore('restaurants');
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
    console.log('fetchNeighborhoods for select list');
    const dbName = 'Time4FoodRestaurantsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback('error starting transaction.',null);};
      var store = tx.objectStore('restaurants');
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
    console.log('fetchCuisines for select list');
    const dbName = 'Time4FoodRestaurantsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('restaurants');
      tx.onerror = function(event) { callback('error starting transaction.',null);};
      var store = tx.objectStore('restaurants');
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
  static imageUrlForRestaurant(restaurant,size,extension='jpg') {
	  // Add suffix 100, 200, 400 or 800w
	  // Rename extension : WebP for Chrome , Jpg for other
    // Use Svg if no picture found
    if (window.location.href.indexOf('nicolasambroise') > -1) {
      return (restaurant.photograph)? `/mws/img/${restaurant.photograph}_${size}w.${extension}`:`/mws/img/no-image_${size}w.${extension}`;
    }
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

  /**
   * Review database
   */

   static openReviewDatabase() {
     if (!navigator.serviceWorker) {return Promise.resolve();}
     return indexDB.open('Time4FoodReviewsDatabase', 1, function (upgradeDb) {
       let store = upgradeDb.createObjectStore('Time4FoodReviewsDatabase', {
         keyPath: 'id'
       });
       store.createIndex('by-id', 'id');
     });
   }

    static openLocalReviewDatabase() {
      if (!navigator.serviceWorker) {return Promise.resolve();}
      return indexDB.open('Time4FoodReviewsLocalDatabase', 1, function (upgradeDb) {
        let store = upgradeDb.createObjectStore('Time4FoodReviewsLocalDatabase', {
          keyPath: 'restaurant_id'
        });
    store.createIndex('by-id', 'restaurant_id');
    });
  }

}
