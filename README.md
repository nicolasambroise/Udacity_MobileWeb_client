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
#### 2) Use Python or IIS to set up a local server

##### 2.1 With Python
In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

##### 2.2 With IIS
1. Launch IIS Manager.
2. In the left Connections sidebar click the little arrowhead to open the tree and right click on the **Sites** folder.
3. Click Add Web Site and give it a name, and add the path to the folder where your website is located.
4. In IP address use * and pick the port 8000.

_Note about port :_ This website works with whatever port is picked

_Enable WebP on IIS :_ [help] (https://www.itnota.com/serving-webp-image-iis/)
1. Launch IIS Manager.
2. Click on your main server on the left pane to make sure we're making the change on a server level (as opposed to a site level). Then click on the MIME Types.
3. On the right pane of MIME Types dialog box, click on Add link.
4. We want to add a new MIME type of WebP as an image type so IIS knows how to handle this new format.
In Add MIME Type box, enter **.webp** as the file name extension and **image/webp** as the MIME type and click OK.
5. Now if you reload your Chrome browser, you should be able to see both image files rendered correctly.

##### 3) With your server running, visit the site: `http://localhost:8000`

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.
