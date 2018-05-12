// register service worker
window.addEventListener('load', () => {
	// Initialisation
	if (!navigator.serviceWorker) {return;}
	let prod_path="";
	const path = window.location.href;
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
			reg.addEventListener('updatefound', function() {
				console.log('Update found !');
				trackInstalling(reg.installing);
			});
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

function trackInstalling(worker) {
  var indexController = this;
	worker.addEventListener('statechange', function() {
		if (worker.state == 'installed') {
		  updateReady(worker);
		}
	});
};

function updateReady(worker) {
	console.log("New version available");
	/* TODO in Phase 2
	if (confirm('New version available, press OK to reload the website')) {
		//  use {action: 'skipWaiting'}
	} else {
		alert('Why did you press cancel? You should have confirmed');
	}
	*/
};
