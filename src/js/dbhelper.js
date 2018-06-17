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
      return 'https://nia-mws-3.herokuapp.com/';
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
    const dbNameTempReviews = 'Time4FoodTempReviewsDatabase';

    var dbPromiseRestaurants = idb.open(dbNameRestaurants, 1,function(upgradeDb) {
      if (!upgradeDb.objectStoreNames.contains('restaurants')) {
        console.log('[2.2.1] Creating the restaurants object store');
        upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        var store = upgradeDb.transaction.objectStore('restaurants');
        store.createIndex('neighborhood', 'neighborhood');
        store.createIndex('cuisine_type', 'cuisine_type');
        store.createIndex('neighborhood,cuisine_type', ['neighborhood', 'cuisine_type']);
      }
      else {
        console.log('[2.2.1] Restaurants object store already exist');
      }
    });

    var dbPromiseReviews = idb.open(dbNameReviews, 1,function(upgradeDb) {
      if (!upgradeDb.objectStoreNames.contains('reviews')) {
        console.log('[2.2.2] Creating the reviews object store');
        upgradeDb.createObjectStore('reviews', {keyPath: 'id'});
        var store = upgradeDb.transaction.objectStore('reviews');
        store.createIndex('restaurant_id', 'restaurant_id');
      }
      else {
        console.log('[2.2.2] Reviews object store already exist');
      }
    });

    var dbPromiseTempReviews =idb.open(dbNameTempReviews, 1,function(upgradeDb) {
      if (!upgradeDb.objectStoreNames.contains('tempReviews')) {
        console.log('[2.2.3] Creating the temp reviews object store');
        upgradeDb.createObjectStore('tempReviews', {autoIncrement:true});
        var store = upgradeDb.transaction.objectStore('tempReviews');
      }
      else {
        console.log('[2.2.3] Temp review object store already exist');
      }
    });

    console.log('[2.2] Wait for All store created');
    Promise.all([dbPromiseRestaurants,dbPromiseReviews,dbPromiseTempReviews])
      .then(data => {
        console.log(data);
        console.log('[2.3] DBPromise Finish');
        console.log('check off/on line '+navigator.onLine);
        // Step 2 : Get data as JSON or wait for it
        if (navigator.onLine) {
          initFetch((error,status) => {
            if(error){callback(error,null);}
            else{callback(null,'Online');}
          });
        }
        else{
          console.log('offline');
          window.addEventListener('online', function(e) {
            initFetch((error,status) => {
              if(error){callback(error,null);}
              else{callback(null,'Online');}
            });
          });
          callback(null,'Offline');
        }
      });

    function initFetch(callback) {
      console.log('[2.4-5-6] Wait for All data fetched');
      const promises = [
        new Promise(resolve => fetchRestaurants(resolve)),
        new Promise(resolve => fetchReviews(resolve)),
        new Promise(resolve => checkTempStore(resolve)),
      ];
      Promise.all(promises)
        .then(data => {
          console.log(data);
          console.log('[2.7] finish fetching data');
          callback(null,'[initFetch] Success');
        }
      );}

    function fetchRestaurants(resolve){
      console.log('[2.4.1] online : fetch Restaurants');
      if(self.fetch) {
        // FETCH
        fetch(`${DBHelper.DATABASE_URL}restaurants`, {
          headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }})
          .then(response => response.json())
          .then(restaurantsJson => {
            var storeRestaurantsPromise = new Promise(resolve => storeRestaurants(restaurantsJson,resolve));
            storeRestaurantsPromise.then(() =>{resolve('Restaurant Ok'); });
          })
          .catch(error => callback(error, null));
      } else {
        // XHR
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${DBHelper.DATABASE_URL}restaurants`);
        xhr.onload = () => {
          if (xhr.status === 200) { // Got a success response from server!
            const restaurants = JSON.parse(xhr.responseText);
            var storeRestaurantsPromise = new Promise(resolve => storeRestaurants(restaurantsJson,resolve));
            storeRestaurantsPromise.then(() =>{resolve('Restaurant Ok'); });
          } else { // Oops!. Got an error from server.
            const error = (`Request failed. Returned status of ${xhr.status}`);
            callback(error, null);
          }
        };
        xhr.onerror = () => {console.log('An error occurred');};
        xhr.send();
      }
    }
    function fetchReviews(resolve){
      console.log('[2.5.1] online : fetch Reviews');
      if(self.fetch) {
        // FETCH
        fetch(`${DBHelper.DATABASE_URL}reviews`, {
          headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }})
          .then(response => response.json())
          .then(reviewsJson => {
            var storeReviewsPromise = new Promise(resolve => storeReviews(reviewsJson,resolve));
            storeReviewsPromise.then(() =>{resolve('Reviews Ok'); });
          })
          .catch(error => callback(error, null));
      } else {
        // XHR
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${DBHelper.DATABASE_URL}reviews`);
        xhr.onload = () => {
          if (xhr.status === 200) { // Got a success response from server!
            const reviews = JSON.parse(xhr.responseText);
            var storeReviewsPromise = new Promise(resolve => storeReviews(reviewsJson,resolve));
            storeReviewsPromise.then(() =>{resolve('Reviews Ok'); });
          } else { // Oops!. Got an error from server.
            const error = (`Request failed. Returned status of ${xhr.status}`);
            callback(error, null);
          }
        };
        xhr.onerror = () => {console.log('An error occurred');};
        xhr.send();
      }
    }

    function checkTempStore(resolve){
      if (navigator.onLine) {
        var TempReviewsPromise = DBHelper.retrieveTempReviews((error, JsonTempReview) => {
          if(JsonTempReview){
            console.log('[2.6.1] Temp Review not empty ');
            console.log(JsonTempReview);
            // loop on each result
            var items = JsonTempReview;
            const ul = document.getElementById('reviews-list');

            return Promise.all(items.map(function(item) {
              console.log(item);
              var createNewReviewPromise = new Promise(resolve => DBHelper.createNewReview(item,resolve));
              return createNewReviewPromise.then((item) =>{
                console.log('[7.5] Success add Review ('+item.id+')');
                // Update review HTML
                ul.appendChild(createReviewHTML(item,null));
                // Update IDB
                var storeReviewsPromise = new Promise(resolve => DBHelper.storeReview(item,resolve));
                storeReviewsPromise.then(() =>{
                  console.log('[7.6] FINISH New Review ('+item.id+')');
                });
              });
            })).catch(function(e) {
              tx.abort();
            }).then(function() {
              console.log('[2.6.2] Success add Review ');
              //delete all temp
              DBHelper.deleteTempReviews();
              resolve('tempReviews Ok');
            });
          }
          else{
            console.log('[2.6] Temp Review empty ');
            resolve('tempReviews empty');
          }
        });
      }
    }

    // Step 3 : Put data in IDB
    function storeRestaurants(JsonRestaurants,resolve) {
      console.log('[2.4.2] Store Restaurants in IndexedDB');
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
          console.log('[2.4.3] All Restaurants items added successfully!');
          resolve('ok');
        });
      });
    }
    function storeReviews(JsonReviews,resolve) {
      console.log('[2.5.2] Store Reviews in IndexedDB');
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
          console.log('[2.5.3] All Reviews items added successfully!');
          resolve('ok');
        });
      });
    }
  } // end  InitializeIndexedDB

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
      callback(null, val);
    });
  }

  /**
  * Retrieve a reviews by review ID.
  */
  static retrieveReviewsByReviewId(id, callback) {
    console.log('*** Retrieve Reviews By ID #'+id);
    const dbName = 'Time4FoodReviewsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('reviews');
      tx.onerror = function(event) { callback('error starting transaction.',null);};
      var store = tx.objectStore('reviews');
      return store.get(parseInt(id));
    }).then(function(val){
      console.log(val);
      callback(null, val);
    });
  }

  /***********************************************************************************************************************************
  * Temp Review database
  */

  static createNewReview(JSONdata,resolve){
    console.log(`*** create New Review : ${DBHelper.DATABASE_URL}reviews/`);
    if(self.fetch) {
      console.log(JSONdata);
      console.log(JSON.stringify(JSONdata));
      // FETCH
      fetch(`${DBHelper.DATABASE_URL}reviews/`, {
        headers : {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(JSONdata)
      })
        .then(response => response.json())
        .then(function(JsonSuccess) {
          console.log(JsonSuccess);
          alert('Well done ! Your comment is successfully created !');
          resolve(JsonSuccess);
        }
      );
    } else {
      // XHR
      let xhr = new XMLHttpRequest();
      xhr.open('POST', `${DBHelper.DATABASE_URL}reviews/`,true);
      xhr.onload = () => {
        if (xhr.status === 200) { // Got a success response from server!
          const JsonSuccess = JSON.parse(xhr.responseText);
          alert('Well done ! Your comment is successfully created !');
          resolve(JsonSuccess);
        } else { // Oops!. Got an error from server.
          const error = (`Request failed. Returned status of ${xhr.status}`);
          alert(error);
        }
      };
      xhr.onerror = () => {console.log('An error occurred');};
      xhr.send();
    }
  }

  /**
  * Store temp reviews
  */
  static storeTempReview(JsonReview,resolve) {
    console.log('*** Store Temp Reviews in IndexedDB');
    console.log(JsonReview);
    const dbName = 'Time4FoodTempReviewsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      console.log('open transaction with store : tempReviews');
      var tx = db.transaction('tempReviews','readwrite');
      tx.oncomplete = function(event) {console.log('*** Transaction done.');};
      tx.onerror = function(event) {console.log('*** Transaction error.');};
      var store = tx.objectStore('tempReviews');
      console.log(typeof(JsonReview));
      console.log(JsonReview);
      var storePromise = store.add(JsonReview);
      storePromise.then(function() {
        console.log('[7.X] Review items added successfully to temp Idb!');
        resolve('ok');
      });
    });
  }

  static storeReview(JsonReview,resolve) {
    console.log('*** Store Reviews in IndexedDB');
    console.log(JsonReview);
    const dbName = 'Time4FoodReviewsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      console.log('open transaction with store : reviews');
      var tx = db.transaction('reviews','readwrite');
      tx.oncomplete = function(event) {console.log('*** Transaction done.');};
      tx.onerror = function(event) {console.log('*** Transaction error.');};
      var store = tx.objectStore('reviews');
      console.log(typeof(JsonReview));
      console.log(JsonReview);
      var storePromise = store.add(JsonReview);
      storePromise.then(function() {
        console.log('[7.X] Review items added successfully to review Idb!');
        resolve('ok');
      });
    });
  }
  /**
  * Retrieve temp reviews
  */
  static retrieveTempReviews(callback) {
    const dbName = 'Time4FoodTempReviewsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('tempReviews');
      tx.onerror = function(event) { callback('error starting transaction.',null);};
      var store = tx.objectStore('tempReviews');
      return store.getAll();
    }).then(function(val){
      if(val.length > 0){
        console.log('[7.X] Retrieve Temp reviews : ');
        console.log(val);
        callback(null, val);
      } else {
        callback('empty',null);
      }
    });
  }

  /**
  * Delete temp reviews
  */
  static deleteTempReviews() {
    const dbName = 'Time4FoodTempReviewsDatabase';
    var dbPromise = idb.open(dbName);
    dbPromise.onerror = function(event) {alert('error opening IndexedDB.');};
    dbPromise.onsuccess = function(event) {db = dbPromise.result;};
    dbPromise.then(function(db) {
      var tx = db.transaction('tempReviews', 'readwrite');
      tx.onerror = function(event) { callback('error starting transaction.',null);};
      var store = tx.objectStore('tempReviews');
      return store.clear();
    }).then(function(val){
      console.log('[7.X] Clear Temp reviews done : '+ val);
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
    // Use default image if no picture found
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
