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

          'vendor/bootstrap/js/bootstrap-transition.js'
          'vendor/bootstrap/js/bootstrap-alert.js'
          'vendor/bootstrap/js/bootstrap-button.js'
          'vendor/bootstrap/js/bootstrap-carousel.js'
          'vendor/bootstrap/js/bootstrap-collapse.js'
          'vendor/bootstrap/js/bootstrap-dropdown.js'
          'vendor/bootstrap/js/bootstrap-modal.js'
          'vendor/bootstrap/js/bootstrap-tooltip.js'
          'vendor/bootstrap/js/bootstrap-popover.js'
          'vendor/bootstrap/js/bootstrap-scrollspy.js'
          'vendor/bootstrap/js/bootstrap-tab.js'
          'vendor/bootstrap/js/bootstrap-typeahed.js'
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
