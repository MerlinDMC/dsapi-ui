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

  angular.module('dsapi.bootstrap.accordion', [])
    .controller('AccordionController', ['$scope', function ($scope) {
      var groups = $scope.groups = [];

      this.select = function(group) {
        angular.forEach(groups, function (group) {
          group.selected = false;
        });
        group.selected = true;
      };

      this.toggle = function(group) {
        if (group.selected) {
          group.selected = false;
        } else {
          this.select(group);
        }
      };

      this.addGroup = function(group) {
        groups.push(group);
        if(group.selected) {
          this.select(group);
        }
      };

      this.removeGroup = function(group) {
        groups.splice(groups.indexOf(group), 1);
      };
    }])
    .directive('accordion', function () {
      return {
        restrict:'E',
        transclude:true,
        scope:{},
        controller:'AccordionController',
        template:'<div class="accordion" ng-transclude></div>'
      };
    })
    .directive('accordionGroup', function () {
      return {
        require:'^accordion',
        restrict:'E',
        transclude:true,
        scope:{
          title:'='
        },
        link: function(scope, element, attrs, accordionCtrl) {
          accordionCtrl.addGroup(scope);

          scope.select = function() {
            accordionCtrl.select(scope);
          };

          scope.toggle = function() {
            accordionCtrl.toggle(scope);
          };

          scope.$on('$destroy', function (event) {
            accordionCtrl.removeGroup(scope);
          });
        },
        template:
          '<div class="accordion-group">' +
            '<div class="accordion-heading">' +
              '<a class="accordion-toggle" ng-click="toggle()">{{title}}</a>' +
            '</div>' +
            '<div class="accordion-body collapse" ng-class="{in : selected}">' +
              '<div class="accordion-inner" ng-transclude></div>' +
            '</div>' +
          '</div>',
        replace:true
      };
    });
