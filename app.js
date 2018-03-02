// register service worker
window.addEventListener('load', () => {
	console.log("app.js");
	// Initialisation
	//if ('serviceWorker' in navigator) {
	if (!navigator.serviceWorker) {return;}
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
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
					trackInstalling(reg.installing)
				});
	  }
		openSocket();

	}).catch(function(error) {
		 console.log('Registration failed with ' + error);// registration failed
	});

	  // Ensure refresh is only called once.
	  // This works around a bug in "force update on reload".
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
		if (confirm('New version available, press OK to reload the website')) {
			console.log({action: 'skipWaiting'});
		} else {
			alert('Why did you press cancel? You should have confirmed');
		}

	};
	
	function openSocket() {
		  var indexController = this;
		  var latestPostDate = this._postsView.getLatestPostDate();

		  // create a url pointing to /updates with the ws protocol
		  var socketUrl = new URL('/updates', window.location);
		  socketUrl.protocol = 'ws';

		  if (latestPostDate) {
			socketUrl.search = 'since=' + latestPostDate.valueOf();
		  }

		  socketUrl.search += '&' + location.search.slice(1);
		  var ws = new WebSocket(socketUrl.href);

		  // add listeners
		  ws.addEventListener('open', function() {console.log('open');});
		  ws.addEventListener('message', function(event) {console.log(event.data);});
		  ws.addEventListener('close', function() {
			console.log('close');
			// try and reconnect in 5 seconds
			setTimeout(function() {openSocket();}, 5000);
		  });
		};
