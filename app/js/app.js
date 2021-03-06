'use strict';

angular.module('dsapi', [ 'ngRoute', 'dsapi.services', 'dsapi.directives', 'dsapi.bootstrap', 'dsapi.filters' ])
  .config(['$locationProvider', '$routeProvider', function($location, $routeProvider) {
    $location.hashPrefix('!');

    $routeProvider.when('/home', { templateUrl: 'views/home.html', controller: HomeCtrl });
    $routeProvider.when('/configure/search/:query', { templateUrl: 'views/configure.html', controller: HomeCtrl });
    $routeProvider.when('/configure', { templateUrl: 'views/configure.html', controller: HomeCtrl });
    $routeProvider.when('/configure/:uuid', { templateUrl: 'views/builder/index.html', controller: BuilderCtrl });
    $routeProvider.when('/about', { templateUrl: 'views/about.html', controller: HomeCtrl });

    $routeProvider.otherwise({redirectTo: '/home'});
  }]);
