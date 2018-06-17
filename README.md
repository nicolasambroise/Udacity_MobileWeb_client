# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a _service worker_ to begin the process of creating a seamless offline experience for your users.

### Goals

- Make a mobile-ready app with responsive design.
- Upgrade app performance (reach lighthouse audit min 90% for each critera)
- Make the app available for offline use (submit review in both online and offline mode)
- Improve accessibility/UX with tabindex and Aria


### Demo
- Demo App (on heroku) : https://nia-mws.herokuapp.com
- Demo Server (on heroku) : https://nia-mws-3.herokuapp.com/restaurants/, https://nia-mws-3.herokuapp.com/reviews/

### How to use it - How to run it locally

#### 1) Download this repository (or fork it !)

_Note about ES6 :_
Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.

#### 2) Generate distribution files with Gulp
1. Install Node and npm
2. Install dependencies
`npm install -g`
3. In the Node Console :
`gulp`

#### 3) Use Python, IIS or Node-Gulp to set up a local server

##### 3.1 With Python
In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

##### 3.2 With IIS
1. Launch IIS Manager.
2. In the left Connections sidebar click the little arrowhead to open the tree and right click on the **Sites** folder.
3. Click Add Web Site and give it a name, and add the path to the folder where your website is located.
4. In IP address use * and pick the port 8000.

_Enable WebP on IIS :_ [help] `https://www.itnota.com/serving-webp-image-iis/`
1. Launch IIS Manager.
2. Click on your main server on the left pane to make sure we're making the change on a server level (as opposed to a site level). Then click on the MIME Types.
3. On the right pane of MIME Types dialog box, click on Add link.
4. We want to add a new MIME type of WebP as an image type so IIS knows how to handle this new format.
In Add MIME Type box, enter **.webp** as the file name extension and **image/webp** as the MIME type and click OK.
5. Now if you reload your Chrome browser, you should be able to see both image files rendered correctly.

##### 3.3 With NodeJS-gulp
1. Install Node and npm (if not previously installed)
2. Install dependencies (if not previously installed)
`npm install -g`
3. In the Node Console :
`gulp serve`
4. The browser open automatically in the dist folder

##### 3.4 With Heroku -> run your app on heroku cloud
1. Install Node and npm (if not previously installed)
2. Install dependencies (if not previously installed)
`npm install -g`
3. In the Node Console :
`gulp`
4. Create an account on Heroku
5. Install Heroku CLI and open cmd :
`heroku login
heroku create YOUR_NAME
git init
heroku git:remote -a YOUR_NAME
git add .
git commit -m 'YOUR_COMMENT'
git push heroku master`
6. Go to https://YOUR_NAME.herokuapp.com to see your app

_Use Heroku for HTML pages :_ [help] https://gist.github.com/wh1tney/2ad13aa5fbdd83f6a489, http://www.lemiffe.com/how-to-deploy-a-static-page-to-heroku-the-easy-way/
1. Use a PHP index page with a redirect

##### 4) Install & Run the Backend Server as specify in the MWS3
`https://github.com/nicolasambroise/mws-restaurant-stage-3`

_Note about version :_ Backend Server depends on node.js LTS Version: v6.11.2 , npm, and sails.js Please make sure you have these installed before proceeding forward.


##### 5) With your server running, visit the site: `http://localhost:8000`

### LightHouse Score (17/06/2018)
Score are based on heroku demo app and heroku server (links above)
LightHouse option : Mobile + 3G

| Tool\Pages | [Prod] index.html | [Prod] restaurant.html |
| --- | --- | --- |
| Performance | 93 | 96 |
| PWA | 91 | 91 |
| Best Practice | 94 | 94 |
| accessibility | 100 | 100 |
| SEO | 100 | 100 |

_Note about blob file error :_ since 10th of june an error appear in the console about blob loading error from inject.preload.js
for people using Adblock 3.1 (more info https://issues.adblockplus.org/ticket/6744, https://stackoverflow.com/questions/50849510/inject-preload-js-failing-to-load-a-file-in-chrome-from-my-dev-environment)

### TODO List
- Performance : Display text while font are loading
- PWA : Redirect HTTPS To HTTP (htaccess is ready, check how to enable it on Herokuapp)
- Best Practice : Use HTTP/2 (check a host with HTTP/2 available)
- Other : Load map async instead of waiting for an event
