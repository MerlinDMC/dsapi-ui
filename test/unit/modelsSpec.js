'use strict';

describe('Dataset', function() {
  var datasets;

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
        'creator_name': 'mr_avesome',
        'expect_creator': 'community',
        'published_at': '2012-11-11T11:11:11Z'
      })
    ];
  });

  it('should be able to create instances', function() {
    expect(datasets.length).toBe(3);

    expect(datasets[0]).toBeDefined();
    expect(datasets[1]).toBeDefined();
    expect(datasets[2]).toBeDefined();
  });

  it('should make raw data accessible over the manifest property', function() {
    var data = { 'creator_name': 'sdc', 'expect_creator': 'joyent', '_hidden': true };
    var ds = new Dataset(data);

    expect(ds.manifest).toBe(data);
  });

  it('should get the correct creator', function() {
    var i;

    expect(datasets[0].getCreator).toBeDefined();

    for (i = 0; i < datasets.length; i++) {
      expect(datasets[i].getCreator()).toBe(datasets[i].manifest.expect_creator);
    }
  });

  it('should return a valid generator instance', function() {
    expect(datasets[0].getGenerator).toBeDefined();
    expect(datasets[0].getGenerator().constructor).toBe(DatasetJsonGenerator);
  });

  it('should proxy `name` property', function() {
    expect(datasets[0].name).toBeDefined();
    expect(datasets[0].name).toBe('test_sdc');
  });

  it('should proxy `version` property', function() {
    expect(datasets[0].version).toBeDefined();
    expect(datasets[0].version).toBe('0.1');
  });

  it('should proxy `os` property', function() {
    expect(datasets[0].os).toBeDefined();
    expect(datasets[0].os).toBe('smartos');
  });

  it('should proxy `description` property', function() {
    expect(datasets[0].description).toBeDefined();
    expect(datasets[0].description).toBe('some docs');
  });

  it('should proxy `uuid` property', function() {
    expect(datasets[0].uuid).toBeDefined();
    expect(datasets[0].uuid).toBe('test_sdc-2222');
  });

  it('should proxy `published_at` property', function() {
    expect(datasets[0].published_at).toBeDefined();
    expect(datasets[0].published_at).toBe(1352632271000 /* 2012-11-11T11:11:11Z */);
  });
});

describe('DatasetList', function() {
  var list;

  beforeEach(function(){
    list = new DatasetList();
  });

  it('should be able to create an empty instance', function() {
    expect(list).toBeDefined();
  });

  it('should export the current count', function() {
    expect(list.count).toBeDefined();
    expect(list.count()).toBe(0);
  });

  it('should allow adding single elements', function() {
    expect(list.count()).toBe(0);

    list.push({ 'type': 'dummy' });

    expect(list.count()).toBe(1);

    list.push({ 'type': 'dummy' });
    list.push({ 'type': 'dummy' });

    expect(list.count()).toBe(3);
  });

  it('should allow adding many elements', function() {
    expect(list.count()).toBe(0);

    list.pushMany([
      { 'type': 'dummy' },
      { 'type': 'dummy' },
      { 'type': 'dummy' }
    ]);

    expect(list.count()).toBe(3);
  });

  it('should allow clearing the list', function() {
    expect(list.count()).toBe(0);

    list.pushMany([
      { 'type': 'dummy' },
      { 'type': 'dummy' },
      { 'type': 'dummy' }
    ]);

    expect(list.count()).toBe(3);

    list.clear();

    expect(list.count()).toBe(0);
  });

  it('should return a full list as array', function() {
    list.pushMany([
      { 'type': 'dummy' },
      { 'type': 'dummy' },
      { 'type': 'dummy' }
    ]);

    expect(list.count()).toBe(3);
    expect(list.all().length).toBe(3);
  });

  it('should allow getting an dataset by index', function() {
    var ds;
    var data = { 'type': 'dummy0' };

    expect(list.count()).toBe(0);

    list.push(data);

    expect(list.count()).toBe(1);

    ds = list.get(0);

    expect(ds).toBeDefined();
    expect(ds.constructor).toBe(Dataset);
    expect(ds.manifest).toBe(data);
  });

  it('should return null if getting an dataset by uuid that doesn\'t exist', function() {
    var ds;
    ds = list.get_by_uuid('non-existent-uuid');

    expect(ds).toBeNull();
  });

  it('should allow getting an dataset by uuid', function() {
    var ds;
    var data = {
      'name': 'test_sdc',
      'version': '0.1',
      'os': 'smartos',
      'description': 'some docs',
      'uuid': 'test_sdc-2222',
      'creator_name': 'sdc',
      'expect_creator': 'joyent',
      'published_at': '2012-11-11T11:11:11Z'
    };

    list.push(data);

    expect(list.count()).toBe(1);

    ds = list.get_by_uuid('test_sdc-2222');

    expect(ds).toBeDefined();
    expect(ds.constructor).toBe(Dataset);
    expect(ds.manifest).toBe(data);
  });

  it('should return a list of the latest dataset versions as array', function() {
    list.pushMany([
      {
        'name': 'test',
        'version': '0.2'
      },
      {
        'name': 'test',
        'version': '0.1'
      },
      {
        'name': 'another test',
        'version': '0.1'
      }
    ]);

    expect(list.count()).toBe(3);

    var latest = list.latest();

    expect(latest.length).toBe(2);

    expect(latest[0].name).toBe('test');
    expect(latest[0].version).toBe('0.2');
    expect(latest[1].name).toBe('another test');
    expect(latest[1].version).toBe('0.1');
  });
});

describe('DatasetJsonGenerator', function() {
  var dataset, generator, json;

  describe('Joyent', function() {
    beforeEach(function(){
      dataset = new Dataset({
        "name": "mongodb",
        "version": "1.4.0",
        "type": "zone-dataset",
        "description": "64-bit MongoDB 2.0 SmartMachine Database Appliance with Quickbackup and Replica Sets",
        "published_at": "2012-10-12T22:37:26.296Z",
        "os": "smartos",
        "files": [
          {
            "path": "mongodb-1.4.0.zfs.bz2",
            "sha1": "2d5dc64f00230b12555489cae7fb6161ae3ac697",
            "size": 147919217,
            "url": "http://datasets.at/datasets/b00acc20-14ab-11e2-85ae-4f03a066e93e/mongodb-1.4.0.zfs.bz2"
          }
        ],
        "requirements": {
          "networks": [
            {
              "name": "net0",
              "description": "public"
            }
          ]
        },
        "users": [
          {
            "name": "root"
          },
          {
            "name": "admin"
          },
          {
            "name": "mongodb"
          }
        ],
        "generate_passwords": true,
        "uuid": "b00acc20-14ab-11e2-85ae-4f03a066e93e",
        "creator_uuid": "352971aa-31ba-496c-9ade-a379feaecd52",
        "vendor_uuid": "352971aa-31ba-496c-9ade-a379feaecd52",
        "creator_name": "sdc",
        "platform_type": "smartos",
        "cloud_name": "sdc",
        "urn": "sdc:sdc:mongodb:1.4.0",
        "created_at": "2012-10-12T22:37:26.296Z",
        "updated_at": "2012-10-12T22:37:26.296Z"
      });

      generator = dataset.getGenerator();
    });

    it('should include the dataset_uuid automatically', function() {
      json = generator.generate();

      expect(json.dataset_uuid).toBe(dataset.uuid);
    });

    it('should set the autoboot flag', function() {
      generator.setOption('autoboot', true);

      json = generator.generate();

      expect(json.autoboot).toBe(true);
    });

    it('should set an alias', function() {
      generator.setOption('alias', 'test-alias');

      json = generator.generate();

      expect(json.alias).toBe('test-alias');
    });

    it('should set an hostname', function() {
      generator.setOption('hostname', 'test-hostname');

      json = generator.generate();

      expect(json.hostname).toBe('test-hostname');
    });

    it('should set an domainname', function() {
      generator.setOption('dns_domain', 'test-domain');

      json = generator.generate();

      expect(json.dns_domain).toBe('test-domain');
    });

    it('should set memory and swap', function() {
      generator.setOption('max_physical_memory', 123);

      json = generator.generate();

      expect(json.max_physical_memory).toBe(123);
      expect(json.max_swap).toBe(2 * 123);

      generator.setOption('max_swap', 123);

      json = generator.generate();

      expect(json.max_physical_memory).toBe(123);
      expect(json.max_swap).toBe(123);
    });

    it('should set an quota', function() {
      generator.setOption('quota', 123);

      json = generator.generate();

      expect(json.quota).toBe(123);
    });

    it('should set an cpu_cap', function() {
      generator.setOption('cpu_cap', 234);

      json = generator.generate();

      expect(json.cpu_cap).toBe(234);
    });

    it('should set an cpu_shares', function() {
      generator.setOption('cpu_shares', 234);

      json = generator.generate();

      expect(json.cpu_shares).toBe(234);
    });

    it('should set an max_lwps', function() {
      generator.setOption('max_lwps', 234);

      json = generator.generate();

      expect(json.max_lwps).toBe(234);
    });
  });

  describe('KVM', function() {
    beforeEach(function(){
      dataset = new Dataset({
        "name": "ubuntu-12.04",
        "version": "2.1.2",
        "type": "zvol",
        "cpu_type": "qemu64",
        "description": "Ubuntu 12.04 2.1.2 VM image",
        "created_at": "2012-11-04T00:54:30.673Z",
        "updated_at": "2012-11-04T00:54:30.673Z",
        "os": "linux",
        "image_size": "16384",
        "files": [
          {
            "path": "ubuntu-12.04-2.1.2.zfs.bz2",
            "sha1": "80fd40bed4d97bb458abc04bdec60854b0a89c1d",
            "size": 1179463338,
            "url": "http://datasets.at/datasets/78ab4d60-2610-11e2-b3f7-b3bd2c369427/ubuntu-12.04-2.1.2.zfs.bz2"
          }
        ],
        "requirements": {
          "networks": [
            {
              "name": "net0",
              "description": "public"
            }
          ],
          "ssh_key": true
        },
        "disk_driver": "virtio",
        "nic_driver": "virtio",
        "uuid": "78ab4d60-2610-11e2-b3f7-b3bd2c369427",
        "creator_uuid": "a979f956-12cb-4216-bf4c-ae73e6f14dde",
        "vendor_uuid": "a979f956-12cb-4216-bf4c-ae73e6f14dde",
        "creator_name": "jpc",
        "platform_type": "smartos",
        "cloud_name": "sdc",
        "urn": "sdc:jpc:ubuntu-12.04:2.1.2",
        "published_at": "2012-11-04T00:54:30.673Z"
      });

      generator = dataset.getGenerator();
    });

    it('should have ram', function() {
      json = generator.generate();

      expect(json.ram).toBe(1024);

      generator.setOption('ram', 2048);

      json = generator.generate();

      expect(json.ram).toBe(2048);
    });

    it('should include a cpu_type', function() {
      json = generator.generate();

      expect(json.cpu_type).toBe('qemu64');

      generator.setOption('cpu_type', 'host');

      json = generator.generate();

      expect(json.cpu_type).toBe('host');
    });

    it('should include number of vcpus', function() {
      generator.setOption('vcpus', 123);

      json = generator.generate();

      expect(json.vcpus).toBe(123);
    });
  });
});

describe('MetadataOption', function() {
  var md;

  beforeEach(function() {
    md = new MetadataOption({
      name: 'test',
      type: 'text'
    });
  });

  it('should have default options', function() {
    expect(md.value).toBe('');
  });

  it('should have default options', function() {
    md.initWithRandom(16);

    expect(md.value).toNotBe('');
  });
});
