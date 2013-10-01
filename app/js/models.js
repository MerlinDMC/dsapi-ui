'use strict';

function MetadataOption(options) {
  this.group = options.group || '';

  this.name = options.name || '';
  this.title = options.title || this.name;
  this.description = options.description || '';

  this.type = options.type || 'text';

  this.value = options.value || '';

  this.initWithRandom = function(length) {
    length = length || 8;

    function randomString(length) {
      var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
      var result = '';

      while (result.length < length) {
        result += chars.substr(Math.floor(Math.random() * chars.length), 1);
      }

      return result;
    }

    this.value = randomString(length);
  };
}

function Dataset(data) {
  this.manifest = data;
  this.metadata = [];

  var _generator = null;

  this.getGenerator = function() {
    if (_generator === null) {
      _generator = new DatasetJsonGenerator(this);
    }

    return _generator;
  };

  this.getCreator = function() {
    if (data.provider) {
      return data.provider;
    }

    switch(data.creator_name) {
      case 'sdc':
      case 'jpc':
        return 'joyent';
      default:
        return 'community';
    }
  };

  this.getBrand = function() {
    if (data.os !== 'smartos') {
      return 'kvm';
    }

    return 'joyent';
  };

  var i, proxy_attrs = [
    'name',
    'version',
    'os',
    'description',
    'uuid',
    'published_at',
    'stats_info'
  ];

  for (i in proxy_attrs) {
    this[proxy_attrs[i]] = this.manifest[proxy_attrs[i]];
  }

  /* parse date data */
  this.published_at = Date.parse(this.published_at);

  /* determine usable metadata and populate metadata list */
  this.metadata.push(new MetadataOption({
    'name': 'user-script',
    'title': 'User-Script',
    'description': 'bash script to be run at first boot used to provision even more stuff automatically',
    'type': 'text'
  }));

  this.metadata.push(new MetadataOption({
    'name': 'user-data',
    'title': 'User-Data',
    'description': 'data that can be used by the user-script',
    'type': 'text'
  }));

  if (this.getBrand() === 'kvm') {
    if (this.manifest.hasOwnProperty('requirements') && this.manifest.requirements.ssh_key) {
      this.metadata.push(new MetadataOption({
        'group': 'password',
        'title': 'SSH-PubKey',
        'name': 'root_authorized_keys',
        'type': 'text',
        'description': 'sets authorized_keys for the root user'
      }));
    }
  } else {
    if (this.manifest.users) {
      for (i in this.manifest.users) {
        var user = this.manifest.users[i];

        this.metadata.push(new MetadataOption({
          'group': 'password',
          'title': user.name,
          'name': user.name + '_pw',
          'type': 'password',
          'description': 'sets the password for the user'
        }));
      }
    } else {
      if ([ 'smartos', 'smartos64',
            'base', 'base64'].indexOf(this.manifest.name) >= 0
          || this.manifest.os === 'smartos') {
        this.metadata.push(new MetadataOption({
          'group': 'password',
          'title': 'root',
          'name': 'root_pw',
          'type': 'password',
          'description': 'sets the password for the user'
        }));

        this.metadata.push(new MetadataOption({
          'group': 'password',
          'title': 'admin',
          'name': 'admin_pw',
          'type': 'password',
          'description': 'sets the password for the user'
        }));
      }
    }
  }

  if (this.manifest.hasOwnProperty('metadata_info')) {
    var options;

    for (i in this.manifest.metadata_info) {
      options = this.manifest.metadata_info[i];

      if (!options.hasOwnProperty('group')) {
        options['group'] = 'custom';
      }

      this.metadata.push(new MetadataOption(options));
    }
  }
}

function DatasetList() {
  var content = [];
  var latest = [];

  function updateLatest() {
    var i, known = {};

    latest.length = 0;

    for (i in content) {
      if (!known[content[i].name]) {
        known[content[i].name] = true;

        latest.push(content[i]);
      }
    }
  }

  this.clear = function() {
    content.length = 0;
    latest.length = 0;
  }

  this.count = function() {
    return content.length;
  }

  this.push = function(ds, batch) {
    if (ds.constructor !== Dataset) {
      ds = new Dataset(ds);
    }

    content.push(ds);

    if (batch) {
      updateLatest();
    }
  }

  this.pushMany = function(list) {
    var i, len;
    for (i = 0, len = list.length; i < len; i++) {
      this.push(list[i], true);
    }

    updateLatest();
  }

  this.all = function() {
    return content;
  }

  this.get = function(index) {
    if (index >= 0 && index < content.length) {
      return content[index];
    }

    return null;
  }

  this.get_by_uuid = function(uuid) {
    var i, len, result = null;

    for (i = 0, len = content.length; i < len; i++) {
      if (content[i].uuid === uuid) {
        result = content[i];
      }
    }

    return result;
  }

  this.latest = function() {
    return latest;
  }

  this.clear();
}

function DatasetJsonGenerator(dataset) {
  var _dataset = dataset;

  var _options = {};
  var _nics = [];
  var _filesystems = [];
  var _disks = [];
  var _metadata = [];

  var brand = _dataset.getBrand();

  /**
   * type: boolean|integer|string|array
   */
  var _json_option_rules = {
    'image_uuid': [
      'string',
      function() {
        return _dataset.uuid;
      },
      [ 'joyent' ]
    ],
    'autoboot': [
      'boolean',
      true,
      [ 'kvm', 'joyent' ]
    ],
    'alias': [
      'string',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'hostname': [
      'string',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'dns_domain': [
      'string',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'resolvers': [
      'array',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'max_physical_memory': [
      'integer',
      function() {
        if (_dataset.getBrand() === 'kvm') {
          return null;
        }

        return 256;
      },
      [ 'joyent' ]
    ],
    'max_swap': [
      'integer',
      function() {
        var result;

        if (_dataset.getBrand() === 'kvm') {
          result = getOptionValue('ram');
        } else {
          result = getOptionValue('max_physical_memory');
        }

        return result;
      },
      [ 'joyent' ]
    ],
    'tmpfs': [
      'integer',
      null,
      [ 'joyent' ]
    ],
    'ram': [
      'integer',
      1024,
      [ 'kvm' ]
    ],
    'quota': [
      'integer',
      null,
      [ 'joyent' ]
    ],
    'cpu_cap': [
      'integer',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'cpu_shares': [
      'integer',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'max_lwps': [
      'integer',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'cpu_type': [
      'string',
      'qemu64',
      [ 'kvm' ]
    ],
    'vcpus': [
      'integer',
      null,
      [ 'kvm' ]
    ]
  };

  var _json_nic_rules = {
    'nic_tag': [
      'string',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'mac': [
      'string',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'ip': [
      'string',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'netmask': [
      'string',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'gateway': [
      'string',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'model': [
      'string',
      null,
      [ 'kvm' ]
    ],
    'vlan_id': [
      'integer',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'primary': [
      'boolean',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'allow_ip_spoofing': [
      'boolean',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'allow_mac_spoofing': [
      'boolean',
      null,
      [ 'kvm', 'joyent' ]
    ],
    'allow_restricted_traffic': [
      'boolean',
      null,
      [ 'kvm', 'joyent' ]
    ]
  };

  var _json_disk_rules = {
    'boot': [
      'boolean',
      false,
      [ 'kvm' ]
    ],
    'image_uuid': [
      'string',
      null,
      [ 'kvm' ]
    ],
    'size': [
      'integer',
      null,
      [ 'kvm' ]
    ],
    'image_size': [
      'integer',
      null,
      [ 'kvm' ]
    ],
    'model': [
      'string',
      null,
      [ 'kvm' ]
    ],
    'compression': [
      'string',
      null,
      [ 'kvm' ]
    ]
  };

  var _json_filesystem_rules = {
    'type': [
      'string',
      'lofs',
      [ 'joyent' ]
    ],
    'source': [
      'string',
      null,
      [ 'joyent' ]
    ],
    'target': [
      'string',
      null,
      [ 'joyent' ]
    ]
  };

  function getOptionValue(name) {
    return getPropertyValue(_options, _json_option_rules, name);
  }

  function getPropertyValue(object, rules, name) {
    var value = null;

    if (object.hasOwnProperty(name)) {
      value = object[name];

      if (typeof(value) === 'string' && value.length === 0) {
        value = null;
      }
    }

    if (rules[name]) {
      var field_info = rules[name];

      if (value === null) {
        if (field_info[1] !== null) {
          if (typeof(field_info[1]) === 'function') {
            value = field_info[1](object, rules);
          } else {
            value = field_info[1];
          }
        }
      } else {
        switch (field_info[0]) {
          case 'boolean':
            value = !!value;
          break;
          case 'integer':
            value = parseInt(value);
            if (!value) {
              value = 0;
            }
          break;
          case 'array':
            value = value.toString().split(/[\s,]+/);
            if (!value) {
              value = null;
            }
          break;
          default:
            value = value.toString();
        }
      }
    }

    return value;
  }

  this.setOption = function(name, value) {
    _options[name] = value;

    return this;
  };

  this.setOptions = function(obj) {
    var prop;

    for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        this.setOption(prop, obj[prop]);
      }
    }

    return this;
  };

  this.setNics = function(nics) {
    var i;

    _nics.length = 0;

    for (i in nics) {
      _nics.push(nics[i]);
    }
  };

  this.setFilesystems = function(filesystems) {
    var i;

    _filesystems.length = 0;

    for (i in filesystems) {
      _filesystems.push(filesystems[i]);
    }
  };

  this.setDisks = function(disks) {
    var i;

    _disks.length = 0;

    // add system disk from dataset for kvm
    if (brand === 'kvm') {
      if (_dataset.manifest.image_size && _dataset.manifest.disk_driver) {
        _disks.push({
          'boot': true,
          'model': _dataset.manifest.disk_driver,
          'image_size': _dataset.manifest.image_size,
          'image_uuid': _dataset.uuid
        });
      }
    }

    for (i in disks) {
      _disks.push(disks[i]);
    }
  };

  this.setMetadata = function(metadata) {
    var i;

    _metadata.length = 0;

    for (i in metadata) {
      _metadata.push(metadata[i]);
    }
  };

  this.generate = function() {
    var json = {};
    var name, i, len;

    json['brand'] = brand;

    // add simple options
    for (name in _json_option_rules) {
      var field_info = _json_option_rules[name];

      if (field_info[2].indexOf(brand) >= 0) {
        var value = getOptionValue(name);

        if (value !== null) {
          json[name] = value;
        }
      }
    }

    // add nics
    if (_nics.length > 0) {
      json.nics = [];

      for (i = 0, len = _nics.length; i < len; i++) {
        var item = {};

        for (name in _json_nic_rules) {
          var field_info = _json_nic_rules[name];

          if (field_info[2].indexOf(brand) >= 0) {
            var value = getPropertyValue(_nics[i], _json_nic_rules, name);

            if (value !== null) {
              item[name] = value;
            }
          }
        }

        json.nics.push(item);
      }
    }

    // add disks
    if (_disks.length > 0) {
      json.disks = [];

      for (i = 0, len = _disks.length; i < len; i++) {
        var item = {};

        for (name in _json_disk_rules) {
          var field_info = _json_disk_rules[name];

          if (field_info[2].indexOf(brand) >= 0) {
            var value = getPropertyValue(_disks[i], _json_disk_rules, name);

            if (value !== null) {
              item[name] = value;
            }
          }
        }

        json.disks.push(item);
      }
    }

    // add filesystems
    if (_filesystems.length > 0) {
      json.filesystems = [];

      for (i = 0, len = _filesystems.length; i < len; i++) {
        var item = {};

        for (name in _json_filesystem_rules) {
          var field_info = _json_filesystem_rules[name];

          if (field_info[2].indexOf(brand) >= 0) {
            var value = getPropertyValue(_filesystems[i], _json_filesystem_rules, name);

            if (value !== null) {
              item[name] = value;
            }
          }
        }

        json.filesystems.push(item);
      }
    }

    // add metadata
    if (_metadata.length > 0) {
      json.customer_metadata = {};
      json.internal_metadata = {};

      for (i = 0, len = _metadata.length; i < len; i++) {
        if (_metadata[i].name.match(/_pw$/)) {
          json.internal_metadata[_metadata[i].name] = _metadata[i].value;
        }

        json.customer_metadata[_metadata[i].name] = _metadata[i].value;
      }
    }

    return json;
  };
}
