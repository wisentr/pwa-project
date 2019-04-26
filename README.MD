# A Progressive Web App - PWAGram

A Progressive Web App, with Instagram like features, to demonstrate performance benefits of PWAs.

# How to Use

You need [Node.js](https://nodejs.org) installed on your machine. Simply download the installer from [nodejs.org](https://nodejs.org) and go through the installation steps.

Once Node.js is installed, open your command prompt or terminal and **navigate into this project folder**. There, run `npm install` to install all required dependencies.

Finally, run `npm start` to start the development server and visit [localhost:8080](http://localhost:8080) to see the running application.

# Notes

## Preventing the default browser caching

In package.json file, the start script is;  
`"start": "http-server -c-1"`  
`-c-1` flag here ensures that we do not cache any assets using the normal browser cache. This is essential, since I will compare the performance of this app, and it's non-PWA version.

## Scope of ServiceWorker.js

It's scope is the folder where the file is placed in. In other words, putting it anywhere else than the root folder, will cause ServiceWorker to work for only that folder(sometimes that's what we need).  
The files which ServiceWorker should control can also be passed as an argument, while registering the ServiceWorker.

## ServiceWorker Events

ServiceWorkers do not have access to DOM events.
