'use strict';

describe('Dataset', function() {
  var datasets;

  beforeEach(module('dsapi.filters'));
  beforeEach(function(){
    datasets = [
      new Dataset({
        'name': 'test_sdc',
        'version': '0.1',
        'os': 'smartos',
        'description': 'some docs',
        'uuid': 'test_sdc-2222',
        'creator_name': 'sdc',
        'expect_creator': 'joyent',
        'published_at': '2012-11-11T11:11:11Z'
      }),
      new Dataset({
        'name': 'test_jpc',
        'version': '0.1',
        'os': 'smartos',
        'description': 'some docs',
        'uuid': 'test_sdc-1111',
        'creator_name': 'jpc',
        'expect_creator': 'joyent',
        'published_at': '2012-11-11T11:11:11Z'
      }),
      new Dataset({
        'name': 'test_community',
        'version': '0.1',
        'os': 'smartos',
        'description': 'some docs',
        'uuid': 'test_community-1111',
        'creator_name': 'mr_awesome',
        'expect_creator': 'community',
        'published_at': '2012-11-11T11:11:11Z'
      })
    ];
  });

  describe('searchDatasets', function() {
    it('should search all searchable fields', inject(function(searchDatasetsFilter) {
      var result = searchDatasetsFilter(datasets, 'test');

      expect(result.length).toBe(3);
    }));

    it('should not search all fields', inject(function(searchDatasetsFilter) {
      var result = searchDatasetsFilter(datasets, 'joyent');

      expect(result.length).toBe(0);
    }));

    it('should combine words by AND', inject(function(searchDatasetsFilter) {
      var result = searchDatasetsFilter(datasets, 'smartos test_sdc');

      expect(result.length).toBe(1);
    }));

    it('should allow to filter by complete field', inject(function(searchDatasetsFilter) {
      var result = searchDatasetsFilter(datasets, 'name:test_sdc');

      expect(result.length).toBe(1);
    }));

    it('should allow to filter by field while typing', inject(function(searchDatasetsFilter) {
      var result;

      result = searchDatasetsFilter(datasets, 'name:test');

      expect(result.length).toBe(3);

      result = searchDatasetsFilter(datasets, 'name:test_s');

      expect(result.length).toBe(1);

      result = searchDatasetsFilter(datasets, 'name:test_sdc');

      expect(result.length).toBe(1);
    }));

    it('should always match from the start', inject(function(searchDatasetsFilter) {
      var result = searchDatasetsFilter(datasets, 'name:community');

      expect(result.length).toBe(0);
    }));

    it('should allow to filter by uuid', inject(function(searchDatasetsFilter) {
      var result;

      result = searchDatasetsFilter(datasets, 'uuid:test_sdc');

      expect(result.length).toBe(2);

      result = searchDatasetsFilter(datasets, 'uuid:test_sdc-1111');

      expect(result.length).toBe(1);
    }));

    it('should allow to combine filter and search', inject(function(searchDatasetsFilter) {
      var result = searchDatasetsFilter(datasets, 'os:smartos community');

      expect(result.length).toBe(1);

      var result = searchDatasetsFilter(datasets, 'os:smartos test');

      expect(result.length).toBe(3);
    }));

    it('should be case insensitive', inject(function(searchDatasetsFilter) {
      var result = searchDatasetsFilter(datasets, 'os:SmartOS cOmmunity');

      expect(result.length).toBe(1);
    }));
  });
});
