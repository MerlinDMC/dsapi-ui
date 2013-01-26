'use strict';

function HomeCtrl($scope, $routeParams, $location, dsapiDatasets) {
  $scope.datasets = null;
  $scope.latest = null;

  if ($routeParams.query) {
    $scope.query = $routeParams.query;
  }

  dsapiDatasets.then(function(instance) {
    $scope.datasets = instance.all();
    $scope.latest = instance.latest();
  });

  $scope.editManifest = function(uuid) {
    $location.path('/configure/' + uuid);
  };
}

HomeCtrl.$inject = [ '$scope', '$routeParams', '$location', 'dsapiDatasets' ];

function BuilderCtrl($scope, $routeParams, dsapiDatasets) {
  $scope.dataset = null;
  $scope.form = { // all form field will flow in here
    'settings': {},
    'nics': [],
    'disks': [],
    'filesystems': [],
    'metadata': [],
    '_selected_metadata': null
  };
  $scope.temp; // temporary data flows in here

  function clearObject(object) {
    for (prop in object) {
      if (object.hasOwnProperty(prop)) {
        delete object[prop];
      }
    }

    return object;
  }

  function loadBuilderDefaults(options) {
    for (k in options) {
      $scope.form.settings[k] = options[k];
    }
  }

  $scope.addNic = function() {
    clearObject($scope.temp);

    $scope.temp = {
      nic_tag: 'admin'
    };

    if ($scope.isKVM()) {
      $scope.temp.model = ($scope.dataset.nic_driver ? $scope.dataset.nic_driver : $scope.valid_nic_models[0]);
    }
  }

  $scope.editNic = function(data) {
    var nic = {};

    angular.copy(data, nic);
    nic._target = data;

    $scope.temp = nic;
  };

  $scope.saveNic = function(data) {
    var nic = {};

    angular.copy(data, nic);

    if (nic.primary === true) {
      var i, len;

      for (i = 0, len = $scope.form.nics.length; i < len; i++) {
        $scope.form.nics[i].primary = false;
      }
    }

    if (Object.keys(nic).length > 0 && nic.nic_tag && nic.ip) {
      if (data._target) {
        delete nic._target;

        angular.copy(nic, data._target);
      } else {
        $scope.form.nics.push(nic);
      }
    }

    clearObject($scope.temp);
  };

  $scope.removeNic = function(data) {
    var index = $scope.form.nics.indexOf(data);

    if (index >= 0) {
      $scope.form.nics.splice(index, 1);
    }
  };

  $scope.addFilesystem = function() {
    clearObject($scope.temp);

    $scope.temp = {
      type: $scope.valid_filesystem_types[0]
    };
  };

  $scope.editFilesystem = function(data) {
    var fs = {};

    angular.copy(data, fs);
    fs._target = data;

    $scope.temp = fs;
  };

  $scope.saveFilesystem = function(data) {
    var fs = {};

    angular.copy(data, fs);

    if (Object.keys(fs).length > 0 && fs.type && fs.source && fs.target) {
      if (data._target) {
        delete fs._target;

        angular.copy(fs, data._target);
      } else {
        $scope.form.filesystems.push(fs);
      }
    }

    clearObject($scope.temp);
  }

  $scope.removeFilesystem = function(data) {
    var index = $scope.form.filesystems.indexOf(data);

    if (index >= 0) {
      $scope.form.filesystems.splice(index, 1);
    }
  };

  $scope.addDisk = function() {
    clearObject($scope.temp);

    $scope.temp = {
      model: ($scope.dataset.disk_driver ? $scope.dataset.disk_driver : $scope.valid_disk_models[0]),
      compression: $scope.valid_disk_compressions[0].type
    };
  };

  $scope.editDisk = function(data) {
    var disk = {};

    angular.copy(data, disk);
    disk._target = data;

    $scope.temp = disk;
  };

  $scope.saveDisk = function(data) {
    var disk = {};

    angular.copy(data, disk);

    if (Object.keys(disk).length > 0 && disk.model && disk.size) {
      if (data._target) {
        delete disk._target;

        angular.copy(disk, data._target);
      } else {
        $scope.form.disks.push(disk);
      }
    }

    clearObject($scope.temp);
  }

  $scope.removeDisk = function(data) {
    var index = $scope.form.disks.indexOf(data);

    if (index >= 0) {
      $scope.form.disks.splice(index, 1);
    }
  };

  $scope.addMetadata = function(data) {
    var md = {};

    clearObject($scope.temp);

    if (!data) {
      data = {
        name: '',
        type: 'custom',
        value: '',
        description: 'custom key'
      };
    } else {
      if (data.type === 'password') {
        data.initWithRandom(24);
      }
    }

    angular.copy(data, md);

    $scope.temp = md;
  };

  $scope.editMetadata = function(data) {
    var md = {};

    angular.copy(data, md);
    md._target = data;

    $scope.temp = md;
  };

  $scope.saveMetadata = function(data) {
    var metadata = {};

    angular.copy(data, metadata);

    if (Object.keys(metadata).length > 0 && metadata.name && metadata.value) {
      if (metadata.type === 'custom') {
        metadata.title = metadata.name;
      }

      if (data._target) {
        delete metadata._target;

        angular.copy(metadata, data._target);
      } else {
        $scope.form.metadata.push(metadata);
      }
    }

    clearObject($scope.temp);
    $scope.form._selected_metadata = null;
  }

  $scope.removeMetadata = function(data) {
    var index = $scope.form.metadata.indexOf(data);

    if (index >= 0) {
      $scope.form.metadata.splice(index, 1);
    }
  };

  $scope.json = {};
  $scope.json_pretty = '';

  $scope.generateJson = function() {
    var generator = $scope.dataset.getGenerator();

    generator.setOptions($scope.form.settings);

    generator.setNics($scope.form.nics);
    generator.setFilesystems($scope.form.filesystems);
    generator.setDisks($scope.form.disks);
    generator.setMetadata($scope.form.metadata);

    $scope.json = generator.generate();

    $scope.changeOutput('json');
  };

  $scope.changeOutput = function(type) {
    if (type === 'shell') {
      $scope.json_pretty = [
        'vmadm create << EOF',
        JSON.stringify($scope.json, null, 2),
        'EOF'
      ].join("\n");
    } else {
      $scope.json_pretty = [
        JSON.stringify($scope.json, null, 2)
      ].join("\n");
    }
  }

  $scope.isJoyent = function() {
    return $scope.dataset &&
      ($scope.dataset.getBrand() === 'joyent' ||
        $scope.dataset.getBrand() === 'joyent-minimal');
  };

  $scope.isKVM = function() {
    return $scope.dataset && $scope.dataset.getBrand() === 'kvm';
  };

  dsapiDatasets.then(function(instance) {
    $scope.dataset = instance.by_uuid($routeParams.uuid);

    if ($scope.dataset.manifest.builder_info) {
      loadBuilderDefaults($scope.dataset.manifest.builder_info);
    }
  });

  $scope.valid_filesystem_types = ['lofs'];
  $scope.valid_disk_models = ['virtio', 'ide', 'scsi'];
  $scope.valid_disk_compressions = [
    { type: 'off' },
    { type: 'on' },
    { type: 'lzjb' },
    { type: 'gzip' },
    { type: 'zle' },
    { type: 'gzip-1', group: 'gzip' },
    { type: 'gzip-2', group: 'gzip' },
    { type: 'gzip-3', group: 'gzip' },
    { type: 'gzip-4', group: 'gzip' },
    { type: 'gzip-5', group: 'gzip' },
    { type: 'gzip-6', group: 'gzip' },
    { type: 'gzip-7', group: 'gzip' },
    { type: 'gzip-8', group: 'gzip' },
    { type: 'gzip-9', group: 'gzip' }
  ];
  $scope.valid_nic_models = ['virtio', 'e1000', 'rtl8139'];
  $scope.valid_cpu_types = ['qemu64', 'host'];
}

BuilderCtrl.$inject = [ '$scope', '$routeParams', 'dsapiDatasets' ];
