# dsapi-ui
the frontend for [datasets.at](http://datasets.at/)

dsapi-ui provides human readable dataset / image listings with search and filter functions plus a (hopefully simple) builder for JSON files to be used with vmadm on [SmartOS](http://smartos.org/)

The complete UI is build client side and needs no special server side technology. But you'll need an dsapi server or at least a JSON file with dataset listing to use the UI. By default this listing should be accessible at `/datasets`.

## projects used
- [Brunch](http://brunch.io/)
- [AngularJS](http://angularjs.org/)
- [moment.js](http://momentjs.com/)
- [Bootstrap](http://twitter.github.com/bootstrap/)

## development
1. install grunt `npm install -g grunt` (you'll need to have nodejs and npm already installed)
2. install development dependencies with `npm install`
3. build the project with `brunch build`
4. upload everything in `_public/` to your destination server

to do quick changes and test locally you can use the included web-server

1. run `brunch watch`
2. run `scripts/web-server.js`
3. open [the development version](http://localhost:8000/_public/index.html) in your browser

a `/datasets` file is already included so that all basic functions should be usable

## what if you did patches that need to be included?
**fork!** - and send pull requests
