'use strict';

angular.module('dsapi.directives', [])
  .directive('dateFromNow', function() {
    return function(scope, element, attrs) {
      scope.$watch(attrs.dateFromNow, function(value) {
        if (value && value > 0) {
          element.text(moment(value).fromNow());
        }
      });
    }
  });

/**
 * bootstrap directives
 */
angular.module('dsapi.bootstrap', [])
  .directive('navBarTop', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        'title': '@'
      },
      template:
        '<div class="navbar navbar-fixed-top">' +
          '<div class="navbar-inner">' +
            '<div class="container">' +
              '<a class="brand" href="#/">{{title}}</a>' +
              '<ul class="nav" ng-transclude></ul>' +
            '</div>' +
          '</div>' +
        '</div>',
      replace: true
    };
  })

  .directive('navBarPills', function() {
    return {
      restrict: 'E',
      transclude: true,
      template:
        '<ul class="nav nav-pills pull-right" ng-transclude>' +
        '</ul>',
      replace: true
    };
  })

  .directive('navLocation', function($location) {
    var match = function(href, url) {
      var href_a = href.split('/');
      var url_a = url.split('/');
      var i;

      for (i in href_a) {
        if (href_a[i] !== url_a[i]) {
          return false;
        }
      }

      return true;
    }

    return {
      restrict: 'E',
      transclude: true,
      scope: {
        'href': '@'
      },
      link: function (scope) {
        scope.location = function (href) {
          return match(href.substr(1), $location.url());
        };
      },
      template:
        '<li ng-class="{active: location(href)}">' +
          '<a href="{{href}}" ng-transclude></a>' +
        '</li>',
      replace: true
    };
  });
