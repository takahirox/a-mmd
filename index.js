/**
 * @author Takahiro / https://github.com/takahirox
 *
 * Dependencies
 *  - ammo.js  https://github.com/kripken/ammo.js/
 *
 * TODO
 *  - Import Ammo.js
 *  - PositionalAudio
 */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before' +
                  'AFRAME was available.');
}

require('three/examples/js/loaders/TGALoader');
require('three/examples/js/loaders/MMDLoader');
require('three/examples/js/animation/CCDIKSolver');
require('three/examples/js/animation/MMDPhysics');

// used in MMDLoader
var MMDParser = require('mmd-parser');
if (window) window.MMDParser = MMDParser;

var mmdLoader = new THREE.MMDLoader();
mmdLoader.setTextureCrossOrigin('anonymous');

var mmdHelper = new THREE.MMDHelper();

AFRAME.registerComponent('mmd', {
  schema: {
    audio: {
      type: 'string'
    },
    volume: {
      type: 'number',
      default: 1.0
    },
    audioDelayTime: {
      type: 'number'
    },
    afterglow: {
      type: 'number'
    }
  },

  init: function () {
    this.effect = null;
    this.ready = false;
    this.loader = mmdLoader;
    // one MMDHelper instance per a mmd component
    this.helper = new THREE.MMDHelper();
    this.entityCount = this.getMMDEntityCount(this.el);
    this.el.addEventListener('model-loaded', this.onModelLoaded.bind(this));
  },

  getMMDEntityCount: function (el) {
    var entities = el.querySelectorAll('a-entity');
    var count = 0;

    for(var i = 0, il = entities.length; i < il; i++) {
      var entity = entities[i];
      if(entity.getAttribute('mmd-model') !== null) { count++; }
    }

    return count;
  },

  update: function () {
    var self = this;
    var audioUrl = this.data.audio;
    var volume = this.data.volume;
    var audioDelayTime = this.data.audioDelayTime;
    var loader = this.loader;
    var helper = this.helper;

    function loadAudio () {
      loader.loadAudio(audioUrl, function (audio, listener) {
        if (volume !== 1.0) { audio.setVolume(volume); }
        listener.position.z = 1;
        var params = {};
        if (audioDelayTime !== 0) {
          params.delayTime = audioDelayTime;
        }
        helper.setAudio(audio, listener, params);
        self.checkIfReady();
      });
    }

    if (audioUrl !== '' ) {
      loadAudio();
    } else {
      this.checkIfReady();
    }
  },

  setBlink: function (mesh) {
    var blinkMorphName = 'まばたき';

    this.removeBlinkFromMorphAnimations(mesh, blinkMorphName);

    var loader = this.loader;
    var offset = (Math.random() * 10) | 0;

    var vmd = {
      metadata: {
        name: 'blink',
        coordinateSystem: 'right',
        morphCount: 14,
        cameraCount: 0,
        motionCount: 0
      },
      morphs: [
        {frameNum: 0, morphName: blinkMorphName, weight: 0.0},
        {frameNum: offset + 10, morphName: blinkMorphName, weight: 0.0},
        {frameNum: offset + 15, morphName: blinkMorphName, weight: 1.0},
        {frameNum: offset + 16, morphName: blinkMorphName, weight: 1.0},
        {frameNum: offset + 20, morphName: blinkMorphName, weight: 0.0},
        {frameNum: offset + 40, morphName: blinkMorphName, weight: 0.0},
        {frameNum: offset + 43, morphName: blinkMorphName, weight: 1.0},
        {frameNum: offset + 44, morphName: blinkMorphName, weight: 1.0},
        {frameNum: offset + 46, morphName: blinkMorphName, weight: 0.0},
        {frameNum: offset + 49, morphName: blinkMorphName, weight: 0.0},
        {frameNum: offset + 52, morphName: blinkMorphName, weight: 1.0},
        {frameNum: offset + 53, morphName: blinkMorphName, weight: 1.0},
        {frameNum: offset + 55, morphName: blinkMorphName, weight: 0.0},
        {frameNum: offset + 200, morphName: blinkMorphName, weight: 0.0}
      ],
      cameras: [],
      motions: []
    };
    loader.pourVmdIntoModel(mesh, vmd, 'blink');
    if (mesh.mixer === null || mesh.mixer === undefined) {
      mesh.mixer = new THREE.AnimationMixer(mesh);
    }
    var animations = mesh.geometry.animations;
    var clip = animations[animations.length-1];;
    var action = mesh.mixer.clipAction(clip);
    action.play();
    action.weight = animations.length;
  },

  removeBlinkFromMorphAnimations: function (mesh, blinkMorphName) {
    if (mesh.geometry.animations === undefined) { return; }
    if (mesh.morphTargetDictionary === undefined) { return; }

    var index = mesh.morphTargetDictionary[ blinkMorphName ];

    if (index === undefined) { return; }

    for (var i = 0, il = mesh.geometry.animations.length; i < il; i++ ) {
      var tracks = mesh.geometry.animations[i].tracks;
      for (var j = 0, jl = tracks.length; j < jl; j++) {
        if (tracks[j].name === '.morphTargetInfluences[' + index + ']') {
          tracks.splice(j, 1);
          break;
        }
      }
    }
  },

  onModelLoaded: function (e) {
    var helper = this.helper;
    var format = e.detail.format;
    var mesh = e.detail.model;

    if (format === 'mmd') {
      helper.setAnimation(mesh);
      helper.add(mesh);
    }

    this.checkIfReady();
  },

  checkIfReady: function () {
    var hasAudio = this.data.audio !== '';

    var audioReady = !hasAudio || (this.helper.audioManager !== null);
    var modelsReady = this.helper.meshes.length >= this.entityCount;

    if (audioReady && modelsReady) { this.getReady(); }
  },

  getReady: function () {
    var helper = this.helper;
    var afterglow = this.data.afterglow;

    var params = {};
    if (afterglow !== 0) {
      params.afterglow = afterglow;
    }
    helper.unifyAnimationDuration(params);

    for (var i = 0; i < helper.meshes.length; i++) {
      var mesh = helper.meshes[i];
      mesh.looped = true;
      if (mesh.blink) { this.setBlink(mesh); }
      delete mesh.blink;
    }

    this.ready = true;
  },

  tick: function (time, delta) {
    if (!this.ready) { return; }
    this.helper.animate(delta / 1000);
  }
});

AFRAME.registerComponent('mmd-model', {
  schema: {
    model: {
      type: 'string'
    },
    vpd: {
      type: 'string'
    },
    vmd: {
      type: 'string'
    },
    physics: {
      type: 'boolean',
      default: false
    },
    blink: {
      type: 'boolean',
      default: false
    }
  },

  init: function () {
    this.model = null;
    this.loader = mmdLoader;
    this.helper = mmdHelper;
  },

  update: function () {
    var data = this.data;
    if (!data.model) { return; }
    this.remove();
    this.load();
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  },

  load: function () {
    var self = this;
    var el = this.el;
    var modelUrl = this.data.model;
    var vpdUrl = this.data.vpd;
    var vmdUrl = this.data.vmd;
    var physicsFlag = this.data.physics;
    var loader = this.loader;
    var helper = this.helper;

    function loadModel () {
      loader.loadModel(modelUrl, function (object) {
        var mesh = object;

        if (physicsFlag) {
          helper.setPhysics(mesh);
        }

        if (vmdUrl !== '') {
          loadVmd(mesh);
        } else if (vpdUrl !== '') {
          loadVpd(mesh);
        } else {
          getReady(mesh);
        }
      });
    }

    function loadVpd (mesh) {
      loader.loadVpd(vpdUrl, function (vpd) {
        helper.poseAsVpd(mesh, vpd);
        getReady(mesh);
      });
    }

    function loadVmd (mesh) {
      var urls = vmdUrl.replace(/\s/g, '').split(',');
      loader.loadVmds(urls, function (vmd) {
        loader.pourVmdIntoModel(mesh, vmd);
        getReady(mesh);
      });
    }

    function getReady (mesh) {
        // this property will be removed later
        mesh.blink = self.data.blink;

        self.model = mesh;
        el.setObject3D('mesh', mesh);
        el.emit('model-loaded', {format: 'mmd', model: mesh});
    }

    if (modelUrl !== '') { loadModel(); }
  }
});
