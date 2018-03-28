let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
	  console.log("Initialize GMap");
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
	  loadStaticMap(self.restaurant);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
  // TODO in Phase 2 : Add info to Indexed DB
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  // TODO in Phase 2 : Add fake Phone Number to each restaurant - Book table 
  
  const resto = document.getElementById('restaurant-img');
  const figure = document.createElement('figure');
  resto.append(figure);
  	const picture = document.createElement('picture');
  	figure.append(picture);
	
	   // Webp for Chrome
	  const source_800webp = document.createElement('source');
	  source_800webp.media = "(min-width:800px)";
	  source_800webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,800,"webp");
	  picture.append(source_800webp);
	  const source_400webp = document.createElement('source');
	  source_400webp.media = "(min-width:500px)";
	  source_400webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,400,"webp");
	  picture.append(source_400webp);
	  const source_300webp = document.createElement('source');
	  source_300webp.media = "(min-width:400px)";
	  source_300webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,300,"webp");
	  picture.append(source_300webp);
	  const source_200webp = document.createElement('source');
	  source_200webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,200,"webp");
	  picture.append(source_200webp);
	  // Jpg for other	
  	  const source_800jpg = document.createElement('source');
  	  source_800jpg.media = "(min-width:800px)";
  	  source_800jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,800,"jpg");
  	  picture.append(source_800jpg);
  	  const source_400jpg = document.createElement('source');
  	  source_400jpg.media = "(min-width:500px)";
  	  source_400jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,400,"jpg");
  	  picture.append(source_400jpg);
      const source_300jpg = document.createElement('source');
  	  source_300jpg.media = "(min-width:400px)";
  	  source_300jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,300,"jpg");
  	  picture.append(source_300jpg);
  	  const image = document.createElement('img');
  	  image.className = 'restaurant-img';
  	  image.src = DBHelper.imageUrlForRestaurant(restaurant,200,"jpg");
      image.alt = restaurant.name;
  	  picture.append(image);
  	const figcaption = document.createElement('figcaption');
    figcaption.innerHTML = restaurant.name;
	figure.append(figcaption);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  
  const d = new Date();
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
	// Put in Strong the current day
    day.innerHTML = (key == days[d.getDay()]) ? "<strong>"+key+"</strong>" : key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
  
  // TODO: Display Status : "Open until Xpm" or "Close"
  // Uncomment in Phase 2 - Finish with taking account of lunch break and use MomentJS for time comparaison
  /*
  const openStatus = document.createElement('p');
  const closeTime = (operatingHours[days[d.getDay()]].lastIndexOf("-") > -1) ? operatingHours[days[d.getDay()]].substring(operatingHours[days[d.getDay()]].lastIndexOf("-") + 2) : operatingHours[days[d.getDay()]];
  const openTime = (operatingHours[days[d.getDay()]].indexOf("-") > -1) ? operatingHours[days[d.getDay()]].substring(0, operatingHours[days[d.getDay()]].indexOf("-")) : operatingHours[days[d.getDay()]];
  let closeTimeAmPm = "", closeTimeHour12 = "", closeTimeHour24 = "", closeTimeMin = "";
  let openTimeAmPm = "", openTimeHour12 = "", openTimeHour24 = "", openTimeMin = "";
  
  // closeTime  "- 11:00 pm" or "Closed" or "Sat" 
  let openStatusMsg = "Current Status : "; 
  if(openTime == "Open 24 hours"){openStatusMsg += "<strong>Open</strong>";}
  else{
	// Check Open Time
    if(openTime.indexOf(" ") > -1){
      openTimeAmPm = openTime.substring(openTime.lastIndexOf(" ") + 1);
      openTimeHour12 = openTime.substring(0, openTime.lastIndexOf(":")); 
	  openTimeHour24 = (openTimeAmPm == "pm") ? Number(openTimeHour12) + 12 : Number(openTimeHour12);
      openTimeMin = openTime.substring(0, openTime.lastIndexOf(" ")).substring(openTime.substring(0, openTime.lastIndexOf(" ")).lastIndexOf(":") + 1);
	  console.log("openTime : "+openTimeHour24+":"+openTimeMin);
	}
	else if(openTime == "Closed"){
      openTimeHour24 = 24;
      openTimeMin = 00;
	}
	else if(openTime.indexOf("Sat") > -1){
	  openTimeHour24 = 00;
      openTimeMin = 00;
	}
	else{
     console.log(closeTime);
	 openStatusMsg += "??? ("+closeTime+")";
    }
  // Check Close Time
	if(closeTime.indexOf(" ") > -1){
      closeTimeAmPm = closeTime.substring(closeTime.lastIndexOf(" ") + 1);
      closeTimeHour12 = closeTime.substring(0, closeTime.lastIndexOf(":")); 
	  closeTimeHour24 = (closeTimeAmPm == "pm") ? Number(closeTimeHour12) + 12 : Number(closeTimeHour12);
      closeTimeMin = closeTime.substring(0, closeTime.lastIndexOf(" ")).substring(closeTime.substring(0, closeTime.lastIndexOf(" ")).lastIndexOf(":") + 1);
	  console.log("closeTime : "+closeTimeHour24+":"+closeTimeMin);
	}
	else if(closeTime.indexOf("Sat") > -1){
	  closeTimeHour24 = 24;
      closeTimeMin = 00;
	}
	else{
     console.log(closeTime);
	 openStatusMsg += "??? ("+closeTime+")";
    } 
	
    // Decision Tree 
	// TODO : update take account lunch break
	if(closeTimeHour24 < d.getHours()){
	  openStatusMsg += "<strong>Closed</strong>";
	}
	else if(closeTimeHour24 == d.getHours() && closeTimeMin < d.getMinutes()){
	  openStatusMsg += "<strong>Closed</strong>";
	}
	else if(openTimeHour24 > d.getHours()){
	  openStatusMsg += "<strong>Closed</strong>";
	}
	else if(openTimeHour24 == d.getHours() && openTimeMin > d.getMinutes()){
	  openStatusMsg += "<strong>Closed</strong>";
	}
	else if(openTimeHour24 < d.getHours() && closeTimeHour24 > d.getHours){
	  openStatusMsg += "<strong>Open</strong>";
	  openStatusMsg += (closeTime.indexOf("Sat")) ? "until "+closeTimeHour12+":"+closeTimeMin+" "+closeTimeAmPm : "until Sunday"
	}
	else if(openTimeHour24 < d.getHours() && closeTimeHour24 == d.getHours() && closeTimeMin >= d.getMinutes()){
	  const timeBeforeClose = Number(closeTimeMin) - d.getMinutes();
	  openStatusMsg += "<strong>Open</strong>";
      openStatusMsg += (closeTime.indexOf("Sat")) ? "(close in "+timeBeforeClose+")" : "until Sunday";
	}	
	else if(openTimeHour24 == d.getHours() && openTimeMin <= d.getMinutes && closeTimeHour24 > d.getHours()){
	  openStatusMsg += "<strong>Open</strong>";
	  openStatusMsg += (closeTime.indexOf("Sat")) ? "until "+closeTimeHour12+":"+closeTimeMin+" "+closeTimeAmPm : "until Sunday"
	}
	else{
	 	openStatusMsg += "Error";
	}
  }
  openStatus.innerHTML = openStatusMsg;
  hours.parentElement.insertBefore(openStatus, hours.parentElement.childNodes[0]);
  */
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  // TODO in Phase 2 : Pagination --> Display by default a max of 10 reviews, add a "more" button if > 10 reviews
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);

  // add click event to un-blur
  reviewUnblur();
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  // Add class blur only if review.comments > 100 character ( 2 lines)
  if(review.comments.length > 100) li.className = "blur";
  const div = document.createElement('div');
  li.appendChild(div);
    const info = document.createElement('div');
    div.appendChild(info)
      const name = document.createElement('p');
      name.innerHTML = review.name;
      info.appendChild(name);
      const date = document.createElement('p');
      date.innerHTML = review.date;
      info.appendChild(date);
    const rating = document.createElement('span');
    rating.innerHTML = `Rating: ${review.rating}`;
    div.appendChild(rating);
    for (let indexCount = 0; indexCount < 5; indexCount++) {
      let rating = parseInt(review.rating);
      let star = document.createElement('i');
      star.className = rating > indexCount ? "fa fa-star" : "fa fa-star-o";
      div.appendChild(star);
    };
  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);
  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.setAttribute('aria-current', "page");
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Display Full review on Click
 */
reviewUnblur = () => {
  const review_blured = document.querySelectorAll(".blur");
  Array.from(review_blured).forEach(review => {
      review.addEventListener('click', function(event) {
        review.classList.remove("blur");
      });
  });
}

/**
 * Render alternative Static Map
 */
loadStaticMap = (restaurant) => { 
  const lat = restaurant.latlng.lat;
  const lng = restaurant.latlng.lng;
  const zoom = 16;
  const height = 400;
  const width = 640;
  const maptype = "roadmap";
  const key = "AIzaSyC7PG4bxfY8ul6b8YLstueqFeI6eRnnVmk";
  const staticmap = document.createElement('img');
  staticmap.alt = 'NewYork City Map of Restaurants';
  staticmap.src = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=${maptype}&key=${key}`;
  document.getElementById('map-static').append(staticmap);
	
  if(navigator.onLine){  
    document.getElementById('map-static').style.display = "none";
    console.log('onLine'); 
 }else{
	document.getElementById('map-static').style.display = "block";
    console.log('offLine');
  }	  
}

/**
 * Dynamically add title to the GoogleMap iframe.
 */
window.addEventListener('load', () => {
    const iframeloaded = document.querySelector('#map iframe') !== null
	if(iframeloaded){
		document.querySelector('#map iframe').setAttribute('title', 'New York City Map of Restaurants');
	}
});
