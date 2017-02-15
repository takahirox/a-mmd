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
    autoplay: {
      type: 'boolean',
      default: true
    },
    volume: {
      type: 'number',
      default: 1.0
    },
    audioDelayTime: {
      type: 'number',
      default: 0.0
    },
    afterglow: {
      type: 'number',
      default: 0.0
    }
  },

  init: function () {
    var self = this;
    this.playing = false;
    this.loader = mmdLoader;
    this.helper = null;
    this.el.addEventListener('model-loaded', function() {
      self.setupModelsIfReady();
    });
  },

  update: function () {
    this.remove();
    this.setupHelper();
    this.load();
    this.setupModelsIfReady();
  },

  remove: function () {
    this.cleanupHelper();
  },

  tick: function (time, delta) {
    if (!this.playing) { return; }
    this.helper.animate(delta / 1000);
  },

  play: function () {
    this.playing = true;
  },

  stop: function () {
    this.playing = false;

    var helper = this.helper;

    if (helper === null) { return; }

    var audioManager = helper.audioManager;
    if (audioManager !== null) {
      audioManager.audio.stop();
    }

    var meshes = helper.meshes;
    for (var i = 0, il = meshes.length; i < il; i++) {
      var mixer = meshes[i].mixer;
      if (mixer !== null && mixer !== undefined) {
        mixer.stopAllAction();
      }
    }
  },

  setupHelper: function () {
    // one MMDHelper instance per a mmd component
    this.helper = new THREE.MMDHelper();
  },

  cleanupHelper: function () {
    this.stop();
    this.helper = null;
  },

  load: function () {
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

        self.setupModelsIfReady();
      });
    }

    if (audioUrl !== '') {
      loadAudio();
    }
  },

  getMMDEntities: function () {
    var el = this.el;
    var entities = el.querySelectorAll('a-entity');

    var readIndex = 0;
    var writeIndex = 0;
    for(var i = 0, il = entities.length; i < il; i++) {
      var entity = entities[i];
      if (entity.getAttribute('mmd-model') !== null) {
        entities[writeIndex] = entities[readIndex];
        writeIndex++;
      }
      readIndex++;
    }
    entities.length = writeIndex;

    return entities;
  },

  setupModelsIfReady: function () {
    if (this.checkIfReady()) { this.setupModels(); }
  },

  checkIfReady: function () {
    return (this.helper !== null &&
      this.checkIfAudioReady() && this.checkIfModelsReady());
  },

  checkIfAudioReady: function () {
    return (this.data.audio === '') || (this.helper.audioManager !== null);
  },

  checkIfModelsReady: function () {
    var entities = this.getMMDEntities();

    for(var i = 0, il = entities.length; i < il; i++) {
      if (entities[i].getObject3D('mesh') === undefined) { return false; }
    }

    return true;
  },

  setupModels: function () {
    var helper = this.helper;
    var afterglow = this.data.afterglow;
    var autoplay = this.data.autoplay;

    var entities = this.getMMDEntities();

    for(var i = 0, il = entities.length; i < il; i++) {
      var mesh = entities[i].getObject3D('mesh');
      if (mesh !== undefined) {
        helper.setAnimation(mesh);
        helper.add(mesh);
      }
    }

    var params = {};
    if (afterglow !== 0) {
      params.afterglow = afterglow;
    }
    helper.unifyAnimationDuration(params);

    // blink animation duration should be independent of other animations.
    // so set it after we call unifyAnimationDuration().
    for (var i = 0, il = helper.meshes.length; i < il; i++) {
      var mesh = helper.meshes[i];
      mesh.looped = true;
      if (mesh.blink) { this.setBlink(mesh); }
      delete mesh.blink;
    }

    if (autoplay) { this.play(); }
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
          setup(mesh);
        }
      });
    }

    function loadVpd (mesh) {
      loader.loadVpd(vpdUrl, function (vpd) {
        helper.poseAsVpd(mesh, vpd);
        setup(mesh);
      });
    }

    function loadVmd (mesh) {
      var urls = vmdUrl.replace(/\s/g, '').split(',');
      loader.loadVmds(urls, function (vmd) {
        loader.pourVmdIntoModel(mesh, vmd);
        setup(mesh);
      });
    }

    function setup (mesh) {
      // this property will be removed in mmd.setupModels()
      mesh.blink = self.data.blink;

      self.model = mesh;
      el.setObject3D('mesh', mesh);
      el.emit('model-loaded', {format: 'mmd', model: mesh});
    }

    if (modelUrl !== '') { loadModel(); }
  }
});
