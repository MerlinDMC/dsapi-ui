exports.config =
  modules:
    definitions: false
    wrapper: false
  paths:
    public: '_public'
  files:
    javascripts:
      joinTo:
        'js/app.js': /^app/
        'js/vendor.js': /^vendor.*(?!\.min)\.js/
      order:
        before: [
          'vendor/helper/console.js'

          'vendor/angular/angular.js'

          'vendor/bootstrap/js/transition.js'
          'vendor/bootstrap/js/alert.js'
          'vendor/bootstrap/js/button.js'
          'vendor/bootstrap/js/carousel.js'
          'vendor/bootstrap/js/collapse.js'
          'vendor/bootstrap/js/dropdown.js'
          'vendor/bootstrap/js/modal.js'
          'vendor/bootstrap/js/tooltip.js'
          'vendor/bootstrap/js/popover.js'
          'vendor/bootstrap/js/scrollspy.js'
          'vendor/bootstrap/js/tab.js'
          'vendor/bootstrap/js/typeahed.js'
        ]
        after: []
    stylesheets:
      defaultExtension: 'less'
      joinTo:
        'css/app.css': /^(app|vendor)/
      order:
        before: [
          'app/less/_theme.less'
          'app/less/bootstrap.less'
          'app/less/app.less'
        ]
        after: []
  framework: 'angular'
  minify: false
