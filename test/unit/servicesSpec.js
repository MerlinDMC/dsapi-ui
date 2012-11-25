'use strict';

describe('dsapiDatasets', function() {
  beforeEach(module('dsapi.services'));

  describe('dsapiDatasets', function() {
    var service, $httpBackend;
    var datasets = [
      { 'creator_name': 'sdc', 'expect_creator': 'joyent' },
      { 'creator_name': 'jpc', 'expect_creator': 'joyent' },
      { 'creator_name': 'mr_awesome', 'expect_creator': 'community' }
    ];

    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;

      /* service will grab the list of datasets on instantiation */
      $httpBackend.when('GET', '/datasets')
        .respond(datasets);
    }));

    beforeEach(inject(function(dsapiDatasets) {
      service = dsapiDatasets;

      $httpBackend.flush();
    }));

    it('should exist', function() {
      expect(service).toBeDefined();
    });

    it('should have more than 0 datasets', function() {
      service.then(function(instance) {
        expect(instance.count).toBeDefined();
        expect(instance.count()).toBe(3);
      });
    });

    it('should give back all datasets as array', function() {
      service.then(function(instance) {
        expect(instance.all).toBeDefined();
        expect(instance.all().length).toBe(3);
      });
    });

    it('should be able to retrieve a dataset by index', function() {
      service.then(function(instance) {
        expect(instance.get).toBeDefined();
        expect(instance.get(0)).toBeDefined();
        expect(instance.get(0).constructor).toBe(Dataset);
        expect(instance.get(0).manifest).toBeDefined();
        expect(instance.get(0).manifest).toBe(datasets[0]);
        expect(instance.get(1).manifest).toBe(datasets[1]);
      });
    });
  });
});