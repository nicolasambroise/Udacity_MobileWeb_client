// register service worker
window.addEventListener('load', () => {
	// Initialisation
	if (!navigator.serviceWorker) {return;}
	let prod_path="";
	const path = window.location.href;
  /* 3 servers :
	 - Localhost : localhost:8000/ --> prod_path = ""
	 - Heroku : https://nia-mws.herokuapp.com/ --> prod_path = ""
   - OVH : https://nicolasambroise.com/mws/ --> prod_path = "/mws"
	*/
	if (path.indexOf('nicolasambroise') > -1) { prod_path="/mws";}
  navigator.serviceWorker.register(prod_path+'/sw.js', { scope: prod_path+'/' }).then(
		function(reg) {
			if (!navigator.serviceWorker.controller) {return;}
			if(reg.installing) {
			  console.log('Service worker installing');
			  trackInstalling(reg.installing);return;
			} else if(reg.waiting) {
			  console.log('Service worker installed');
			  updateReady(reg.waiting);return;
			} else if(reg.active) {
			  console.log('Service worker active');
			}
		}).catch(function(error) {
	  	 console.log('Registration failed with ' + error);
	  });
	  var refreshing;
	  navigator.serviceWorker.addEventListener('controllerchange', function() {
			if (refreshing) return;
			console.log('Refreshing !');
			window.location.reload();
			refreshing = true;
	  });
});

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
