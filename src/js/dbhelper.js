/**
 * Common database helper functions
 *  retrieve function : Open an indexedDB and get values
 *  fetch function : Do a fetch (or XHR request) to get data
 *  store function : Add data in IndexedDB
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
    console.log('[2.1] InitializeIndexedDB');
    if (!('indexedDB' in window)) {
      console.log('This browser doesn\'t support IndexedDB');
      const error = ('This browser doesn\'t support IndexedDB');
      callback(error, null);
    }
    const dbNameRestaurants = 'Time4FoodRestaurantsDatabase';
    const dbNameReviews = 'Time4FoodReviewsDatabase';

    var dbPromiseRestaurants = idb.open(dbNameRestaurants, 1,function(upgradeDb) {
      console.log('[2.2.1] Creating the restaurants object store');
      upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
      var store = upgradeDb.transaction.objectStore('restaurants');
      store.createIndex('neighborhood', 'neighborhood');
      store.createIndex('cuisine_type', 'cuisine_type');
      store.createIndex('neighborhood,cuisine_type', ['neighborhood', 'cuisine_type']);
    });

    var dbPromiseReviews = idb.open(dbNameReviews, 1,function(upgradeDb) {
      console.log('[2.2.2] Creating the reviews object store');
      upgradeDb.createObjectStore('reviews', {keyPath: 'id'});
      var store = upgradeDb.transaction.objectStore('reviews');
      store.createIndex('restaurant_id', 'restaurant_id');
    });
    Promise.all([dbPromiseRestaurants,dbPromiseReviews]).then(() => {
      console.log("[2.2.3] DBPromise Finish");

      // Step 2 : Get data as JSON or wait for it
      if (navigator.onLine) {
        initFetch()
      }
      else{
        console.log('offline');
        window.addEventListener('online', function(e) {
          initFetch()
        });
        callback(null,'offline');
      }
    });

    function initFetch(){
      var PromisefetchRestaurants = fetchRestaurants();
      var PromisefetchReviews = fetchReviews();
      Promise.all([PromisefetchRestaurants,PromisefetchReviews]).then(() => {
        console.log('[2.5] finish fetching data');
        callback(null,'Success');
      });
    }

    function fetchRestaurants(){
      console.log('[2.3.1] online : fetch Restaurants');
      if(self.fetch) {
        // FETCH
        fetch(`${DBHelper.DATABASE_URL}restaurants`, {
          headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }})
          .then(response => response.json())
          .then(function(restaurantsJson) {storeRestaurants(restaurantsJson);})
          .catch(error => callback(error, null));
      } else {
        // XHR
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${DBHelper.DATABASE_URL}restaurants`);
        xhr.onload = () => {
          if (xhr.status === 200) { // Got a success response from server!
            const restaurants = JSON.parse(xhr.responseText);
            storeRestaurants(restaurantsJson);
          } else { // Oops!. Got an error from server.
            const error = (`Request failed. Returned status of ${xhr.status}`);
            callback(error, null);
          }
        };
        xhr.onerror = () => {console.log('An error occurred');};
        xhr.send();
      }
    }
    function fetchReviews(){
      console.log('[2.4.1] online : fetch Reviews');
      if(self.fetch) {
        // FETCH
        fetch(`${DBHelper.DATABASE_URL}reviews`, {
          headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }})
          .then(response => response.json())
          .then(function(reviewsJson) {storeReviews(reviewsJson);})
          .catch(error => callback(error, null));
      } else {
        // XHR
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${DBHelper.DATABASE_URL}reviews`);
        xhr.onload = () => {
          if (xhr.status === 200) { // Got a success response from server!
            const reviews = JSON.parse(xhr.responseText);
            storeReviews(reviewsJson);
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
    function storeRestaurants(JsonRestaurants) {
      console.log('[2.3.2] Store Restaurants in IndexedDB');
      console.log(JsonRestaurants);

      dbPromiseRestaurants.then(function(db) {
        var tx = db.transaction('restaurants','readwrite');
        var store = tx.objectStore('restaurants');
        var items = JsonRestaurants;
        return Promise.all(items.map(function(item) {
          return store.put(item);
        })
        ).catch(function(e) {
          tx.abort();
        }).then(function() {
          console.log('[2.3.3] All Restaurants items added successfully!');
        });
      });
    }
    function storeReviews(JsonReviews) {
      console.log('[2.4.2] Store Reviews in IndexedDB');
      console.log(JsonReviews);

      dbPromiseReviews.then(function(db) {
        var tx = db.transaction('reviews','readwrite');
        var store = tx.objectStore('reviews');
        var items = JsonReviews;

        return Promise.all(items.map(function(item) {
          return store.put(item);
        })
        ).catch(function(e) {
          tx.abort();
        }).then(function() {
          console.log('[2.4.3] All Reviews items added successfully!');
        });
      });
    }

    // end  InitializeIndexedDB
  }

  /**
   * Fetch all restaurants.
   */
  static retrieveRestaurants(callback) {
    console.log('*** Retrieve all Restaurants');
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
  static retrieveRestaurantById(id, callback) {
    console.log('*** Retrieve the Restaurant with ID #'+id);
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
  static retrieveRestaurantByCuisine(cuisine, callback) {
    console.log('*** Retrieve all restaurant By Cuisine :'+cuisine);
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
  static retrieveRestaurantByNeighborhood(neighborhood, callback) {
    console.log('*** Retrieve all restaurant By Neighborhood :'+neighborhood);
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
  static retrieveRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    console.log('*** Retrieve all restaurant By Cuisine and Neighborhood :'+cuisine+','+neighborhood);
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
  static retrieveNeighborhoods(callback) {
    console.log('[3.1] Retrieve Neighborhoods for select list');
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
  static retrieveCuisines(callback) {
    console.log('[3.2] Retrieve Cuisines for select list');
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



  /***********************************************************************************************************************************
   * Review database
   */

   /**
    * retrieve all Reviews
    */
   static retrieveReviews(callback) {
     console.log('*** Retrieve all Reviews');
     const dbName = 'Time4FoodReviewsDatabase';
     var dbPromise = idb.open(dbName);
     dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
     dbPromise.onsuccess = function(event) {db = dbPromise.result;};
     dbPromise.then(function(db) {
       var tx = db.transaction('reviews');
       tx.onerror = function(event) {callback('error starting transaction.',null);};
       var store = tx.objectStore('reviews');
       return store.getAll();
     }).then(function(val){
       console.log(val);
       callback(null, val);
     });
   }
   /**
    * Retrieve a reviews by restaurant ID.
    */
   static retrieveReviewsByRestaurantId(id, callback) {
     console.log('*** Retrieve Reviews By Restaurant ID #'+id);
     const dbName = 'Time4FoodReviewsDatabase';
     var dbPromise = idb.open(dbName);
     dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
     dbPromise.onsuccess = function(event) {db = dbPromise.result;};
     dbPromise.then(function(db) {
       var tx = db.transaction('reviews');
       tx.onerror = function(event) { callback('error starting transaction.',null);};
       var store = tx.objectStore('reviews');
       var restoIndex = store.index('restaurant_id');
       return restoIndex.getAll(parseInt(id));
     }).then(function(val){
       console.log(val);
       callback(null, val);
     });
   }

   /**************************************************************************************************************************
    * Other Script
    */

    /**
     * Defer CSS style Load
     * https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery
     */

    static loadDeferredStyles() {
      console.log('[1.1] loadDeferredStyles');
      var addStylesNode = document.getElementById('deferred-styles');
      var replacement = document.createElement('div');
      replacement.innerHTML = addStylesNode.textContent;
      document.body.appendChild(replacement);
      addStylesNode.parentElement.removeChild(addStylesNode);
    };

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

// End class
}
