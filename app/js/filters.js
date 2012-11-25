'use strict';

angular.module('dsapi.filters', [])
  .filter('shorten', function() {
    return function(text, max_length) {
      max_length = max_length || 0xffffffff;

      if (text.length > max_length) {
        text = text.substring(0, max_length) + '...';
      }

      return text;
    };
  })
  .filter('searchDatasets', function() {
    var searchableKeys = [
      'name',
      'version',
      'os',
      'description'
    ];

    var matchManifest = function(manifest, query) {
      if (!query) {
        return true;
      }

      var k, i, parts, len, kv;

      parts = query.toLowerCase().split(/\s+/);

      for (i = 0, len = parts.length; i < len; i++) {
        var match = false;

        kv = parts[i].match(/^(\w+):(.+)$/);

        if (kv && searchableKeys.indexOf(kv[1]) >= 0) {
          if (manifest[kv[1]].toLowerCase() === kv[2]) {
            match = true;
          }
        } else {
          for (k in searchableKeys) {
            if (manifest[searchableKeys[k]].toLowerCase().search(parts[i]) >= 0) {
              match = true;
            }
          }
        }

        if (!match) {
          return false;
        }
      }

      return true;
    }

    return function(datasets, query) {
      var i;
      var matched = [];

      if (!query) {
        return datasets;
      }

      for (i in datasets) {
        if (matchManifest(datasets[i], query)) {
          matched.push(datasets[i]);
        }
      }

      return matched;
    }
  });
