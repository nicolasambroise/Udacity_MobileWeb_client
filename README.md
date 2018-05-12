# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a _service worker_ to begin the process of creating a seamless offline experience for your users.

### Goals

- Make a mobile-ready app with responsive design.
- Upgrade app performance
- Make the app available for offline use
- Improve accessibility/UX with tabindex and Aria

### How to use it

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


##### 4) Install & Run the Backend Server as specify in the MWS2
`https://github.com/nicolasambroise/mws-restaurant-stage-2`

_Note about version :_ Backend Server depends on node.js LTS Version: v6.11.2 , npm, and sails.js Please make sure you have these installed before proceeding forward.


##### 5) With your server running, visit the site: `http://localhost:8000`

### LightHouse Score (12/05/2018)

| Tool\Pages | [Prod] index.html | [Prod] restaurant.html |
| --- | --- | --- |
| Performance | 93 | 87 |
| PWA | 100 | 100 |
| Best Practice | 88 | 88 |
| accessibility | 100 | 100 |
| SEO | 100 | 100 |

Explanation
- PWA in production use HTTPS (9 points more than with localhost) !
- Performance, fetch are slower in production


### TODO List
- Use HTTP/2 (?)
