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

/*
Copyright 2016 Google Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
'use strict';

(function() {
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }

  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) {return;}
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) {return;}
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) {return;}
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) {return;}
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) {return;}
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) {return;}
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        if(idbTransaction.error !== null)  {
          console.log(idbTransaction.error);
        }
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var request = (this._store || this._index)[funcName].apply(this._store, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) {return;}
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length === count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  var exp = {
    open: function(name, version, upgradeCallback) {
      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
      var request = p.request;

      request.onupgradeneeded = function(event) {
        if (upgradeCallback) {
          upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
        }
      };

      return p.then(function(db) {
        return new DB(db);
      });
    },
    delete: function(name) {
      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = exp;
  }
  else {
    self.idb = exp;
  }
}());

let restaurants, neighborhoods, cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOMContentLoaded');
  DBHelper.InitializeIndexedDB((error,status) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Initialization Perfect');
      // TODO use promise
      var PromiseNeighborhoods = fetchNeighborhoods();
      var PromiseCuisines = fetchCuisines();
      // next
      Promise.resolve(PromiseNeighborhoods,PromiseCuisines).then(() => {
        updateRestaurants();
        loadStaticMap();
      });
    }
  });
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
};

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
};

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
};

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

  console.log('updateRestaurants :'+cuisine+' / '+neighborhood);

  if(navigator.onLine && !document.getElementById('gmap-api') && (cuisine !== 'all' || neighborhood !== 'all')){
    console.log('includeAPI');
    includeAPI();
  }

  if(cuisine === 'all' && neighborhood === 'all'){
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    });
  }
  else if (cuisine === 'all') {
    DBHelper.fetchRestaurantByNeighborhood(neighborhood, (error, restaurants) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    });
  }
  else if (neighborhood === 'all') {
    DBHelper.fetchRestaurantByCuisine(cuisine, (error, restaurants) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    });
  }
  else {
    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
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

// TODO in Phase 3 : Add a pagination to load only the first 12 result ( impove UX and reduce load time)
fillRestaurantsHTML = (restaurants = self.restaurants) => {
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

  // TODO: improve the display of the button !
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
loadStaticMap = () => {
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
    includeAPI();
  });
  document.addEventListener('scroll', function(){
    if(flag_scroll === 0){
      flag_scroll++;
      includeAPI();
    }
  });
};

/*
 * Defer rending Include Google Maps API
* https://codepen.io/svinkle/pen/vJmlt
 */
includeAPI = () => {
  console.log('include Google API');
  const gkey = 'AIzaSyC7PG4bxfY8ul6b8YLstueqFeI6eRnnVmk';
  let js;
  let fjs = document.getElementsByTagName('script')[0];
  if (!document.getElementById('gmap-api')) {
    js = document.createElement('script');
    js.id = 'gmap-api';
    js.setAttribute('async', '');
    js.setAttribute('defer', '');
    js.src = 'https://maps.googleapis.com/maps/api/js?key='+gkey+'&sensor=false&libraries=places&force=pwa&callback=initMap';
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
    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: loc,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: false
    });
    addMarkersToMap();

    console.log('Initialize GMap');
    const iframeloaded = document.querySelector('#map iframe') !== null;
    console.log('add title to iframe');
    if(iframeloaded){
      document.querySelector('#map iframe').setAttribute('title', 'New York City Map of Restaurants');
    }
  }
};


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  console.log('addMarkersToMap');
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
  else{console.log('Google map not loaded !');}
};

let restaurant;
var map;

/*
 * Initialisation
 */
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('1. DOMContentLoaded');
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      console.log('2. Initialization Perfect');
      fillBreadcrumb();
      loadStaticMap(self.restaurant);
    }
  });
});

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.InitializeIndexedDB((error,status) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Initialization Perfect');
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
          self.restaurant = restaurant;
          if (!restaurant) {
            console.error(error);
            return;
          }
          fillRestaurantHTML();
          callback(null, restaurant);
        });
      }
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const resto = document.getElementById('restaurant-img');
  const figure = document.createElement('figure');
  resto.append(figure);
  	const picture = document.createElement('picture');
  	figure.append(picture);

	   // Webp for Chrome
	  const source_800webp = document.createElement('source');
	  source_800webp.media = '(min-width:800px)';
	  source_800webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,800,'webp');
	  picture.append(source_800webp);
	  const source_400webp = document.createElement('source');
	  source_400webp.media = '(min-width:500px)';
	  source_400webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,400,'webp');
	  picture.append(source_400webp);
	  const source_300webp = document.createElement('source');
	  source_300webp.media = '(min-width:400px)';
	  source_300webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,300,'webp');
	  picture.append(source_300webp);
	  const source_200webp = document.createElement('source');
	  source_200webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,200,'webp');
	  picture.append(source_200webp);
	  // Jpg for other
  	  const source_800jpg = document.createElement('source');
  	  source_800jpg.media = '(min-width:800px)';
  	  source_800jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,800,'jpg');
  	  picture.append(source_800jpg);
  	  const source_400jpg = document.createElement('source');
  	  source_400jpg.media = '(min-width:500px)';
  	  source_400jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,400,'jpg');
  	  picture.append(source_400jpg);
  const source_300jpg = document.createElement('source');
  	  source_300jpg.media = '(min-width:400px)';
  	  source_300jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,300,'jpg');
  	  picture.append(source_300jpg);
  	  const image = document.createElement('img');
  	  image.className = 'restaurant-img';
  	  image.src = DBHelper.imageUrlForRestaurant(restaurant,200,'jpg');
  image.alt = `${restaurant.name} restaurant's photo in ${restaurant.neighborhood}`;
  	  picture.append(image);
  	const figcaption = document.createElement('figcaption');
  figcaption.innerHTML =  `${restaurant.name} restaurant's photo in ${restaurant.neighborhood}`;
  figure.append(figcaption);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {

  const d = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    // Put in Strong the current day
    day.innerHTML = (key === days[d.getDay()]) ? '<strong>'+key+'</strong>' : key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);
    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  // TODO in Phase 2 : Pagination --> Display by default a max of 10 reviews, add a 'more' button if > 10 reviews
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);

  // add click event to un-blur
  reviewUnblur();
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  // Add class blur only if review.comments > 100 character ( 2 lines)
  if(review.comments.length > 100){li.className = 'blur';}
  const div = document.createElement('div');
  const info = document.createElement('div');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  info.appendChild(name);
  const date = document.createElement('p');
  date.innerHTML = review.date;
  info.appendChild(date);
  div.appendChild(info);
  const rating = document.createElement('span');
  rating.innerHTML = `Rating: ${review.rating}`;
  div.appendChild(rating);
  for (let indexCount = 0; indexCount < 5; indexCount++) {
    let rating = parseInt(review.rating);
    let star = document.createElement('i');
    star.className = rating > indexCount ? 'fa fa-star' : 'fa fa-star-o';
    div.appendChild(star);
  };
  li.appendChild(div);
  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);
  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb').getElementsByTagName('ol')[0];
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.setAttribute('href',`./restaurant.html?id=${restaurant.id}`);
  a.setAttribute('aria-current', 'page');
  a.setAttribute('tabindex', '0');
  a.innerHTML = restaurant.name;
  li.appendChild(a);
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url){url = window.location.href;}
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results){return null;}
  if (!results[2]){return '';}
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Display Full review on Click
 */
reviewUnblur = () => {
  const review_blured = document.querySelectorAll('.blur');
  Array.from(review_blured).forEach(review => {
    review.addEventListener('click', function(event) {
      review.classList.remove('blur');
    });
  });
};

/**
 * Render alternative Static Map
 */
loadStaticMap = (restaurant) => {
  const lat = restaurant.latlng.lat;
  const lng = restaurant.latlng.lng;
  const zoom = 16;
  const height = 400;
  const width = 640;
  const maptype = 'roadmap';
  const key = 'AIzaSyC7PG4bxfY8ul6b8YLstueqFeI6eRnnVmk';
  const staticmap = document.createElement('img');
  let flag_scroll = 0;
  let markers = `&markers=color:0xff0000%7Clabel:${restaurant.name}%7C${lat},${lng}`;

  staticmap.alt = `NewYork City Map of Restaurants -${restaurant.name}`;
  staticmap.src = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=${maptype}&key=${key}&format=png&visual_refresh=true${markers}`;
  document.getElementById('map-static').append(staticmap);
  document.getElementById('map-static').style.display = 'block';

  // load now the google one
  document.getElementById('map-static').addEventListener('click', function(){
    includeAPI();
  });
  document.addEventListener('scroll', function(){
    if(flag_scroll === 0){
      flag_scroll++;
      includeAPI();
    }
  });

};

/*
 * Defer rending Include Google Maps API
* https://codepen.io/svinkle/pen/vJmlt
 */
includeAPI = () => {
  console.log('include Google API');
  const gkey = 'AIzaSyC7PG4bxfY8ul6b8YLstueqFeI6eRnnVmk';
  let js;
  let fjs = document.getElementsByTagName('script')[0];
  if (!document.getElementById('gmap-api')) {
    js = document.createElement('script');
    js.id = 'gmap-api';
    js.setAttribute('async', '');
    js.setAttribute('defer', '');
    js.src = 'https://maps.googleapis.com/maps/api/js?key='+gkey+'&sensor=false&libraries=places&force=pwa&callback=initMap';
    fjs.parentNode.insertBefore(js, fjs);
  }
};

/**
 * Initialize Google map, called from HTML.
 */
initMap = () => {
  if (navigator.onLine) {
    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: restaurant.latlng,
      scrollwheel: false
    });
    DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);

    console.log('Initialize GMap');
    const iframeloaded = document.querySelector('#map iframe') !== null;
    console.log('add title to iframe');
    if(iframeloaded){
      document.querySelector('#map iframe').setAttribute('title', 'New York City Map of Restaurants');
    }
  }
};

/**
 * Smooth Scroll to top
 */
document.getElementById('toTop').addEventListener('click', (event) => {
  event.preventDefault();
  // My Speed depend of current scroll position
  const duration = document.documentElement.scrollTop;
  const start = window.pageYOffset;
  const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
  if ('requestAnimationFrame' in window === false) {window.scroll(0, 0);return;}
  function scroll() {
    const current_time = 'now' in window.performance ? performance.now() : new Date().getTime();
    const time = Math.min(1, ((current_time - startTime) / duration));
    window.scroll(0, Math.ceil((time * (0 - start)) + start));
    if (window.pageYOffset === 0) {return;}
    requestAnimationFrame(scroll);
  }
  scroll();
});

/**
 * Defer CSS style Load
 * https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery
 */

var loadDeferredStyles = function() {
  console.log('loadDeferredStyles');
  var addStylesNode = document.getElementById('deferred-styles');
  var replacement = document.createElement('div');
  replacement.innerHTML = addStylesNode.textContent;
  document.body.appendChild(replacement);
  addStylesNode.parentElement.removeChild(addStylesNode);
};
var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
     window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
if (raf){ raf(function() { window.setTimeout(loadDeferredStyles, 0); });}
else { window.addEventListener('load', loadDeferredStyles);}
