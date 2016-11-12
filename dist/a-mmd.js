/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author Takahiro / https://github.com/takahirox
	 *
	 * Dependencies
	 *  - charsetencoder.min.js  https://github.com/takahirox/charset-encoder-js
	 *  - ammo.js                https://github.com/kripken/ammo.js/
	 *
	 * TODO
	 *  - Embed the above two libs
	 *  - PositionalAudio
	 */

	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}

	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);

	var mmdLoader = new THREE.MMDLoader();
	//mmdLoader.enableImageCrossOrigin(true);

	var mmdHelper = new THREE.MMDHelper(
	  // dummy
	  {
	    getSize: function() {
	      return {width:1, height:1}
	    },
	    setSize: function(width, height) {}
	  }
	);

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
	    var dummy = {
	      getSize: function() {
	        return {width:1, height:1}
	      },
	      setSize: function(width, height) {}
	    };
	    this.loader = mmdLoader;
	    // one MMDHelper instance per a mmd component
	    this.helper = new THREE.MMDHelper(
	      // dummy
	      {
	        getSize: function() {
	          return {width:1, height:1}
	        },
	        setSize: function(width, height) {}
	      }
	    );
	    this.entityCount = this.getMMDEntityCount(this.el);
	    this.el.addEventListener('model-loaded', this.onModelLoaded.bind(this));
	  },

	  setupOutlineEffect: function (el) {
	    var sceneEl = el.sceneEl;
	    var renderer = sceneEl.renderer;
	    var effect = sceneEl.effect;

	    // override scene's effect
	    if (renderer !== undefined) {
	      var keys = Object.keys(renderer);
	      for (var i = 0, il = keys.length; i < il; i++) {
	        var key = keys[i];
	        if (THREE.OutlineEffect.prototype[key] === undefined) {
	          THREE.OutlineEffect.prototype[key] = typeof renderer[key] === 'function' ? renderer[key].bind(renderer) : renderer[key];
	        }
	      }

	      this.effect = new THREE.OutlineEffect(renderer);
	      sceneEl.effect = new THREE.VREffect(this.effect);
	    }
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
	    var el = this.el;
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
	    if (this.effect === null) { this.setupOutlineEffect(this.el); }
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
	    this.mesh = null;
	    this.loader = mmdLoader;
	    this.helper = mmdHelper;
	  },

	  update: function () {
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

	        self.mesh = mesh;
	        el.setObject3D('mesh', mesh);
	        el.emit('model-loaded', {format: 'mmd', model: mesh});
	    }

	    if (modelUrl !== '') { loadModel(); }
	  }
	});



/***/ },
/* 1 */
/***/ function(module, exports) {

	/*
	 * @author Daosheng Mu / https://github.com/DaoshengMu/
	 * @author mrdoob / http://mrdoob.com/
	 * @author takahirox / https://github.com/takahirox/
	 */

	THREE.TGALoader = function ( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	};

	THREE.TGALoader.prototype.load = function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var texture = new THREE.Texture();

		var loader = new THREE.XHRLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );

		loader.load( url, function ( buffer ) {

			texture.image = scope.parse( buffer );
			texture.needsUpdate = true;

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

		}, onProgress, onError );

		return texture;

	};

	// reference from vthibault, https://github.com/vthibault/roBrowser/blob/master/src/Loaders/Targa.js
	THREE.TGALoader.prototype.parse = function ( buffer ) {

		// TGA Constants
		var TGA_TYPE_NO_DATA = 0,
		TGA_TYPE_INDEXED = 1,
		TGA_TYPE_RGB = 2,
		TGA_TYPE_GREY = 3,
		TGA_TYPE_RLE_INDEXED = 9,
		TGA_TYPE_RLE_RGB = 10,
		TGA_TYPE_RLE_GREY = 11,

		TGA_ORIGIN_MASK = 0x30,
		TGA_ORIGIN_SHIFT = 0x04,
		TGA_ORIGIN_BL = 0x00,
		TGA_ORIGIN_BR = 0x01,
		TGA_ORIGIN_UL = 0x02,
		TGA_ORIGIN_UR = 0x03;


		if ( buffer.length < 19 )
			console.error( 'THREE.TGALoader.parse: Not enough data to contain header.' );

		var content = new Uint8Array( buffer ),
			offset = 0,
			header = {
				id_length:       content[ offset ++ ],
				colormap_type:   content[ offset ++ ],
				image_type:      content[ offset ++ ],
				colormap_index:  content[ offset ++ ] | content[ offset ++ ] << 8,
				colormap_length: content[ offset ++ ] | content[ offset ++ ] << 8,
				colormap_size:   content[ offset ++ ],

				origin: [
					content[ offset ++ ] | content[ offset ++ ] << 8,
					content[ offset ++ ] | content[ offset ++ ] << 8
				],
				width:      content[ offset ++ ] | content[ offset ++ ] << 8,
				height:     content[ offset ++ ] | content[ offset ++ ] << 8,
				pixel_size: content[ offset ++ ],
				flags:      content[ offset ++ ]
			};

		function tgaCheckHeader( header ) {

			switch ( header.image_type ) {

				// Check indexed type
				case TGA_TYPE_INDEXED:
				case TGA_TYPE_RLE_INDEXED:
					if ( header.colormap_length > 256 || header.colormap_size !== 24 || header.colormap_type !== 1 ) {

						console.error( 'THREE.TGALoader.parse.tgaCheckHeader: Invalid type colormap data for indexed type' );

					}
					break;

				// Check colormap type
				case TGA_TYPE_RGB:
				case TGA_TYPE_GREY:
				case TGA_TYPE_RLE_RGB:
				case TGA_TYPE_RLE_GREY:
					if ( header.colormap_type ) {

						console.error( 'THREE.TGALoader.parse.tgaCheckHeader: Invalid type colormap data for colormap type' );

					}
					break;

				// What the need of a file without data ?
				case TGA_TYPE_NO_DATA:
					console.error( 'THREE.TGALoader.parse.tgaCheckHeader: No data' );

				// Invalid type ?
				default:
					console.error( 'THREE.TGALoader.parse.tgaCheckHeader: Invalid type " ' + header.image_type + '"' );

			}

			// Check image width and height
			if ( header.width <= 0 || header.height <= 0 ) {

				console.error( 'THREE.TGALoader.parse.tgaCheckHeader: Invalid image size' );

			}

			// Check image pixel size
			if ( header.pixel_size !== 8  &&
				header.pixel_size !== 16 &&
				header.pixel_size !== 24 &&
				header.pixel_size !== 32 ) {

				console.error( 'THREE.TGALoader.parse.tgaCheckHeader: Invalid pixel size "' + header.pixel_size + '"' );

			}

		}

		// Check tga if it is valid format
		tgaCheckHeader( header );

		if ( header.id_length + offset > buffer.length ) {

			console.error( 'THREE.TGALoader.parse: No data' );

		}

		// Skip the needn't data
		offset += header.id_length;

		// Get targa information about RLE compression and palette
		var use_rle = false,
			use_pal = false,
			use_grey = false;

		switch ( header.image_type ) {

			case TGA_TYPE_RLE_INDEXED:
				use_rle = true;
				use_pal = true;
				break;

			case TGA_TYPE_INDEXED:
				use_pal = true;
				break;

			case TGA_TYPE_RLE_RGB:
				use_rle = true;
				break;

			case TGA_TYPE_RGB:
				break;

			case TGA_TYPE_RLE_GREY:
				use_rle = true;
				use_grey = true;
				break;

			case TGA_TYPE_GREY:
				use_grey = true;
				break;

		}

		// Parse tga image buffer
		function tgaParse( use_rle, use_pal, header, offset, data ) {

			var pixel_data,
				pixel_size,
				pixel_total,
				palettes;

			pixel_size = header.pixel_size >> 3;
			pixel_total = header.width * header.height * pixel_size;

			 // Read palettes
			 if ( use_pal ) {

				 palettes = data.subarray( offset, offset += header.colormap_length * ( header.colormap_size >> 3 ) );

			 }

			 // Read RLE
			 if ( use_rle ) {

				 pixel_data = new Uint8Array( pixel_total );

				var c, count, i;
				var shift = 0;
				var pixels = new Uint8Array( pixel_size );

				while ( shift < pixel_total ) {

					c     = data[ offset ++ ];
					count = ( c & 0x7f ) + 1;

					// RLE pixels.
					if ( c & 0x80 ) {

						// Bind pixel tmp array
						for ( i = 0; i < pixel_size; ++ i ) {

							pixels[ i ] = data[ offset ++ ];

						}

						// Copy pixel array
						for ( i = 0; i < count; ++ i ) {

							pixel_data.set( pixels, shift + i * pixel_size );

						}

						shift += pixel_size * count;

					} else {

						// Raw pixels.
						count *= pixel_size;
						for ( i = 0; i < count; ++ i ) {

							pixel_data[ shift + i ] = data[ offset ++ ];

						}
						shift += count;

					}

				}

			 } else {

				// RAW Pixels
				pixel_data = data.subarray(
					 offset, offset += ( use_pal ? header.width * header.height : pixel_total )
				);

			 }

			 return {
				pixel_data: pixel_data,
				palettes: palettes
			 };

		}

		function tgaGetImageData8bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image, palettes ) {

			var colormap = palettes;
			var color, i = 0, x, y;
			var width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i ++ ) {

					color = image[ i ];
					imageData[ ( x + width * y ) * 4 + 3 ] = 255;
					imageData[ ( x + width * y ) * 4 + 2 ] = colormap[ ( color * 3 ) + 0 ];
					imageData[ ( x + width * y ) * 4 + 1 ] = colormap[ ( color * 3 ) + 1 ];
					imageData[ ( x + width * y ) * 4 + 0 ] = colormap[ ( color * 3 ) + 2 ];

				}

			}

			return imageData;

		}

		function tgaGetImageData16bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

			var color, i = 0, x, y;
			var width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {

					color = image[ i + 0 ] + ( image[ i + 1 ] << 8 ); // Inversed ?
					imageData[ ( x + width * y ) * 4 + 0 ] = ( color & 0x7C00 ) >> 7;
					imageData[ ( x + width * y ) * 4 + 1 ] = ( color & 0x03E0 ) >> 2;
					imageData[ ( x + width * y ) * 4 + 2 ] = ( color & 0x001F ) >> 3;
					imageData[ ( x + width * y ) * 4 + 3 ] = ( color & 0x8000 ) ? 0 : 255;

				}

			}

			return imageData;

		}

		function tgaGetImageData24bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

			var i = 0, x, y;
			var width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i += 3 ) {

					imageData[ ( x + width * y ) * 4 + 3 ] = 255;
					imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
					imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
					imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];

				}

			}

			return imageData;

		}

		function tgaGetImageData32bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

			var i = 0, x, y;
			var width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i += 4 ) {

					imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
					imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
					imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];
					imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 3 ];

				}

			}

			return imageData;

		}

		function tgaGetImageDataGrey8bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

			var color, i = 0, x, y;
			var width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i ++ ) {

					color = image[ i ];
					imageData[ ( x + width * y ) * 4 + 0 ] = color;
					imageData[ ( x + width * y ) * 4 + 1 ] = color;
					imageData[ ( x + width * y ) * 4 + 2 ] = color;
					imageData[ ( x + width * y ) * 4 + 3 ] = 255;

				}

			}

			return imageData;

		}

		function tgaGetImageDataGrey16bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

			var i = 0, x, y;
			var width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {

					imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 0 ];
					imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 0 ];
					imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
					imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 1 ];

				}

			}

			return imageData;

		}

		function getTgaRGBA( data, width, height, image, palette ) {

			var x_start,
				y_start,
				x_step,
				y_step,
				x_end,
				y_end;

			switch ( ( header.flags & TGA_ORIGIN_MASK ) >> TGA_ORIGIN_SHIFT ) {
				default:
				case TGA_ORIGIN_UL:
					x_start = 0;
					x_step = 1;
					x_end = width;
					y_start = 0;
					y_step = 1;
					y_end = height;
					break;

				case TGA_ORIGIN_BL:
					x_start = 0;
					x_step = 1;
					x_end = width;
					y_start = height - 1;
					y_step = - 1;
					y_end = - 1;
					break;

				case TGA_ORIGIN_UR:
					x_start = width - 1;
					x_step = - 1;
					x_end = - 1;
					y_start = 0;
					y_step = 1;
					y_end = height;
					break;

				case TGA_ORIGIN_BR:
					x_start = width - 1;
					x_step = - 1;
					x_end = - 1;
					y_start = height - 1;
					y_step = - 1;
					y_end = - 1;
					break;

			}

			if ( use_grey ) {

				switch ( header.pixel_size ) {
					case 8:
						tgaGetImageDataGrey8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;
					case 16:
						tgaGetImageDataGrey16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;
					default:
						console.error( 'THREE.TGALoader.parse.getTgaRGBA: not support this format' );
						break;
				}

			} else {

				switch ( header.pixel_size ) {
					case 8:
						tgaGetImageData8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image, palette );
						break;

					case 16:
						tgaGetImageData16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;

					case 24:
						tgaGetImageData24bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;

					case 32:
						tgaGetImageData32bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;

					default:
						console.error( 'THREE.TGALoader.parse.getTgaRGBA: not support this format' );
						break;
				}

			}

			// Load image data according to specific method
			// var func = 'tgaGetImageData' + (use_grey ? 'Grey' : '') + (header.pixel_size) + 'bits';
			// func(data, y_start, y_step, y_end, x_start, x_step, x_end, width, image, palette );
			return data;

		}

		var canvas = document.createElement( 'canvas' );
		canvas.width = header.width;
		canvas.height = header.height;

		var context = canvas.getContext( '2d' );
		var imageData = context.createImageData( header.width, header.height );

		var result = tgaParse( use_rle, use_pal, header, offset, content );
		var rgbaData = getTgaRGBA( imageData.data, header.width, header.height, result.pixel_data, result.palettes );

		context.putImageData( imageData, 0, 0 );

		return canvas;

	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * @author takahiro / https://github.com/takahirox
	 *
	 * Dependencies
	 *  - charset-encoder-js https://github.com/takahirox/charset-encoder-js
	 *  - ammo.js https://github.com/kripken/ammo.js
	 *  - THREE.TGALoader
	 *  - THREE.MMDPhysics
	 *  - THREE.CCDIKSolver
	 *  - THREE.OutlineEffect
	 *
	 *
	 * This loader loads and parses PMD/PMX and VMD binary files
	 * then creates mesh for Three.js.
	 *
	 * PMD/PMX is a model data format and VMD is a motion data format
	 * used in MMD(Miku Miku Dance).
	 *
	 * MMD is a 3D CG animation tool which is popular in Japan.
	 *
	 *
	 * MMD official site
	 *  http://www.geocities.jp/higuchuu4/index_e.htm
	 *
	 * PMD, VMD format
	 *  http://blog.goo.ne.jp/torisu_tetosuki/e/209ad341d3ece2b1b4df24abf619d6e4
	 *
	 * PMX format
	 *  http://gulshan-i-raz.geo.jp/labs/2012/10/17/pmx-format1/
	 *
	 *
	 * TODO
	 *  - light motion in vmd support.
	 *  - SDEF support.
	 *  - uv/material/bone morphing support.
	 *  - more precise grant skinning support.
	 *  - shadow support.
	 */

	THREE.MMDLoader = function ( manager ) {

		THREE.Loader.call( this );
		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	};

	THREE.MMDLoader.prototype = Object.create( THREE.Loader.prototype );
	THREE.MMDLoader.prototype.constructor = THREE.MMDLoader;

	/*
	 * base64 encoded defalut toon textures toon00.bmp - toon10.bmp
	 * Users don't need to prepare default texture files.
	 *
	 * This idea is from http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mmd.three.js
	 */
	THREE.MMDLoader.prototype.defaultToonTextures = [
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/bWiiMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh8aBHZBl14e8wAAAABJRU5ErkJggg==',
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOUlEQVRYR+3WMREAMAwDsYY/yoDI7MLwIiP40+RJklfcCCBAgAABAgTqArfb/QMCCBAgQIAAgbbAB3z/e0F3js2cAAAAAElFTkSuQmCC',
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/B5ilMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh81dWyx0gFwKAAAAABJRU5ErkJggg==',
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOklEQVRYR+3WoREAMAwDsWb/UQtCy9wxTOQJ/oQ8SXKKGwEECBAgQIBAXeDt7f4BAQQIECBAgEBb4AOz8Hzx7WLY4wAAAABJRU5ErkJggg==',
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABPUlEQVRYR+1XwW7CMAy1+f9fZOMysSEOEweEOPRNdm3HbdOyIhAcklPrOs/PLy9RygBALxzcCDQFmgJNgaZAU6Ap0BR4PwX8gsRMVLssMRH5HcpzJEaWL7EVg9F1IHRlyqQohgVr4FGUlUcMJSjcUlDw0zvjeun70cLWmneoyf7NgBTQSniBTQQSuJAZsOnnaczjIMb5hCiuHKxokCrJfVnrctyZL0PkJAJe1HMil4nxeyi3Ypfn1kX51jpPvo/JeCNC4PhVdHdJw2XjBR8brF8PEIhNVn12AgP7uHsTBguBn53MUZCqv7Lp07Pn5k1Ro+uWmUNn7D+M57rtk7aG0Vo73xyF/fbFf0bPJjDXngnGocDTdFhygZjwUQrMNrDcmZlQT50VJ/g/UwNyHpu778+yW+/ksOz/BFo54P4AsUXMfRq7XWsAAAAASUVORK5CYII=',
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACMElEQVRYR+2Xv4pTQRTGf2dubhLdICiii2KnYKHVolhauKWPoGAnNr6BD6CvIVaihYuI2i1ia0BY0MZGRHQXjZj/mSPnnskfNWiWZUlzJ5k7M2cm833nO5Mziej2DWWJRUoCpQKlAntSQCqgw39/iUWAGmh37jrRnVsKlgpiqmkoGVABA7E57fvY+pJDdgKqF6HzFCSADkDq+F6AHABtQ+UMVE5D7zXod7fFNhTEckTbj5XQgHzNN+5tQvc5NG7C6BNkp6D3EmpXHDR+dQAjFLchW3VS9rlw3JBh+B7ys5Cf9z0GW1C/7P32AyBAOAz1q4jGliIH3YPuBnSfQX4OGreTIgEYQb/pBDtPnEQ4CivXYPAWBk13oHrB54yA9QuSn2H4AcKRpEILDt0BUzj+RLR1V5EqjD66NPRBVpLcQwjHoHYJOhsQv6U4mnzmrIXJCFr4LDwm/xBUoboG9XX4cc9VKdYoSA2yk5NQLJaKDUjTBoveG3Z2TElTxwjNK4M3LEZgUdDdruvcXzKBpStgp2NPiWi3ks9ZXxIoFVi+AvHLdc9TqtjL3/aYjpPlrzOcEnK62Szhimdd7xX232zFDTgtxezOu3WNMRLjiKgjtOhHVMd1loynVHvOgjuIIJMaELEqhJAV/RCSLbWTcfPFakFgFlALTRRvx+ok6Hlp/Q+v3fmx90bMyUzaEAhmM3KvHlXTL5DxnbGf/1M8RNNACLL5MNtPxP/mypJAqcDSFfgFhpYqWUzhTEAAAAAASUVORK5CYII=',
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=',
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII='
	];

	THREE.MMDLoader.prototype.load = function ( modelUrl, vmdUrls, callback, onProgress, onError ) {

		var scope = this;

		this.loadModel( modelUrl, function ( mesh ) {

			scope.loadVmds( vmdUrls, function ( vmd ) {

				scope.pourVmdIntoModel( mesh, vmd );
				callback( mesh );

			}, onProgress, onError );

		}, onProgress, onError );

	};

	THREE.MMDLoader.prototype.loadModel = function ( url, callback, onProgress, onError ) {

		var scope = this;

		var texturePath = this.extractUrlBase( url );
		var modelExtension = this.extractExtension( url );

		this.loadFileAsBuffer( url, function ( buffer ) {

			callback( scope.createModel( buffer, modelExtension, texturePath ) );

		}, onProgress, onError );

	};

	THREE.MMDLoader.prototype.createModel = function ( buffer, modelExtension, texturePath ) {

		return this.createMesh( this.parseModel( buffer, modelExtension ), texturePath );

	};

	THREE.MMDLoader.prototype.loadVmd = function ( url, callback, onProgress, onError ) {

		var scope = this;

		this.loadFileAsBuffer( url, function ( buffer ) {

			callback( scope.parseVmd( buffer ) );

		}, onProgress, onError );

	};

	THREE.MMDLoader.prototype.loadVmds = function ( urls, callback, onProgress, onError ) {

		var scope = this;

		var vmds = [];

		function run () {

			var url = urls.shift();

			scope.loadVmd( url, function ( vmd ) {

				vmds.push( vmd );

				if ( urls.length > 0 ) {

					run();

				} else {

					callback( scope.mergeVmds( vmds ) );

				}

			}, onProgress, onError );

		};

		run();

	};

	THREE.MMDLoader.prototype.loadAudio = function ( url, callback, onProgress, onError ) {

		var listener = new THREE.AudioListener();
		var audio = new THREE.Audio( listener );
		var loader = new THREE.AudioLoader( this.manager );

		loader.load( url, function ( buffer ) {

			audio.setBuffer( buffer );
			callback( audio, listener );

		}, onProgress, onError );

	};

	THREE.MMDLoader.prototype.loadVpd = function ( url, callback, onProgress, onError, params ) {

		var scope = this;

		var func = ( ( params && params.charcode === 'unicode' ) ? this.loadFileAsText : this.loadFileAsShiftJISText ).bind( this );

		func( url, function ( text ) {

			callback( scope.parseVpd( text ) );

		}, onProgress, onError );

	};

	THREE.MMDLoader.prototype.mergeVmds = function ( vmds ) {

		var v = {};
		v.metadata = {};
		v.metadata.name = vmds[ 0 ].metadata.name;
		v.metadata.coordinateSystem = vmds[ 0 ].metadata.coordinateSystem;
		v.metadata.motionCount = 0;
		v.metadata.morphCount = 0;
		v.metadata.cameraCount = 0;
		v.motions = [];
		v.morphs = [];
		v.cameras = [];

		for ( var i = 0; i < vmds.length; i++ ) {

			var v2 = vmds[ i ];

			v.metadata.motionCount += v2.metadata.motionCount;
			v.metadata.morphCount += v2.metadata.morphCount;
			v.metadata.cameraCount += v2.metadata.cameraCount;

			for ( var j = 0; j < v2.metadata.motionCount; j++ ) {

				v.motions.push( v2.motions[ j ] );

			}

			for ( var j = 0; j < v2.metadata.morphCount; j++ ) {

				v.morphs.push( v2.morphs[ j ] );

			}

			for ( var j = 0; j < v2.metadata.cameraCount; j++ ) {

				v.cameras.push( v2.cameras[ j ] );

			}

		}

		return v;

	};

	THREE.MMDLoader.prototype.pourVmdIntoModel = function ( mesh, vmd, name ) {

		this.createAnimation( mesh, vmd, name );

	};

	THREE.MMDLoader.prototype.pourVmdIntoCamera = function ( camera, vmd, name ) {

		var helper = new THREE.MMDLoader.DataCreationHelper();

		var initAnimation = function () {

			var orderedMotions = helper.createOrderedMotionArray( vmd.cameras );

			var times = [];
			var centers = [];
			var quaternions = [];
			var positions = [];
			var fovs = [];

			var cInterpolations = [];
			var qInterpolations = [];
			var pInterpolations = [];
			var fInterpolations = [];

			var quaternion = new THREE.Quaternion();
			var euler = new THREE.Euler();
			var position = new THREE.Vector3();
			var center = new THREE.Vector3();

			var pushVector3 = function ( array, vec ) {

				array.push( vec.x );
				array.push( vec.y );
				array.push( vec.z );

			};

			var pushQuaternion = function ( array, q ) {

				array.push( q.x );
				array.push( q.y );
				array.push( q.z );
				array.push( q.w );

			};

			var pushInterpolation = function ( array, interpolation, index ) {

				array.push( interpolation[ index * 4 + 0 ] / 127 ); // x1
				array.push( interpolation[ index * 4 + 1 ] / 127 ); // x2
				array.push( interpolation[ index * 4 + 2 ] / 127 ); // y1
				array.push( interpolation[ index * 4 + 3 ] / 127 ); // y2

			};

			var createTrack = function ( node, type, times, values, interpolations ) {

				/*
				 * optimizes here not to let KeyframeTrackPrototype optimize
				 * because KeyframeTrackPrototype optimizes times and values but
				 * doesn't optimize interpolations.
				 */
				if ( times.length > 2 ) {

					times = times.slice();
					values = values.slice();
					interpolations = interpolations.slice();

					var stride = values.length / times.length;
					var interpolateStride = ( stride === 3 ) ? 12 : 4;  // 3: Vector3, others: Quaternion or Number

					var aheadIndex = 2;
					var index = 1;

					for ( aheadIndex = 2, endIndex = times.length; aheadIndex < endIndex; aheadIndex ++ ) {

						for ( var i = 0; i < stride; i ++ ) {

							if ( values[ index * stride + i ] !== values[ ( index - 1 ) * stride + i ] ||
								values[ index * stride + i ] !== values[ aheadIndex * stride + i ] ) {

								index ++;
								break;

							}

						}

						if ( aheadIndex > index ) {

							times[ index ] = times[ aheadIndex ];

							for ( var i = 0; i < stride; i ++ ) {

								values[ index * stride + i ] = values[ aheadIndex * stride + i ];

							}

							for ( var i = 0; i < interpolateStride; i ++ ) {

								interpolations[ index * interpolateStride + i ] = interpolations[ aheadIndex * interpolateStride + i ];

							}

						}

					}

					times.length = index + 1;
					values.length = ( index + 1 ) * stride;
					interpolations.length = ( index + 1 ) * interpolateStride;

				}

				return new THREE.MMDLoader[ type ]( node, times, values, interpolations );

			};

			for ( var i = 0; i < orderedMotions.length; i++ ) {

				var m = orderedMotions[ i ];

				var time = m.frameNum / 30;
				var pos = m.position;
				var rot = m.rotation;
				var distance = m.distance;
				var fov = m.fov;
				var interpolation = m.interpolation;

				position.set( 0, 0, -distance );
				center.set( pos[ 0 ], pos[ 1 ], pos[ 2 ] );

				euler.set( -rot[ 0 ], -rot[ 1 ], -rot[ 2 ] );
				quaternion.setFromEuler( euler );

				position.add( center );
				position.applyQuaternion( quaternion );

				/*
				 * Note: This is a workaround not to make Animation system calculate lerp
				 *       if the diff from the last frame is 1 frame (in 30fps).
				 */
				if ( times.length > 0 && time < times[ times.length - 1 ] + ( 1 / 30 ) * 1.5 ) {

					times[ times.length - 1 ] = time - 1e-13;

				}

				times.push( time );

				pushVector3( centers, center );
				pushQuaternion( quaternions, quaternion );
				pushVector3( positions, position );

				fovs.push( fov );

				for ( var j = 0; j < 3; j ++ ) {

					pushInterpolation( cInterpolations, interpolation, j );

				}

				pushInterpolation( qInterpolations, interpolation, 3 );

				// use same one parameter for x, y, z axis.
				for ( var j = 0; j < 3; j ++ ) {

					pushInterpolation( pInterpolations, interpolation, 4 );

				}

				pushInterpolation( fInterpolations, interpolation, 5 );

			}

			if ( times.length === 0 ) return;

			var tracks = [];

			tracks.push( createTrack( '.center', 'VectorKeyframeTrackEx', times, centers, cInterpolations ) );
			tracks.push( createTrack( '.quaternion', 'QuaternionKeyframeTrackEx', times, quaternions, qInterpolations ) );
			tracks.push( createTrack( '.position', 'VectorKeyframeTrackEx', times, positions, pInterpolations ) );
			tracks.push( createTrack( '.fov', 'NumberKeyframeTrackEx', times, fovs, fInterpolations ) );

			var clip = new THREE.AnimationClip( name === undefined ? THREE.Math.generateUUID() : name, -1, tracks );

			if ( clip !== null ) {

				if ( camera.center === undefined ) camera.center = new THREE.Vector3( 0, 0, 0 );
				if ( camera.animations === undefined ) camera.animations = [];
				camera.animations.push( clip );

			}

		};

		this.leftToRightVmd( vmd );

		initAnimation();

	};

	THREE.MMDLoader.prototype.extractExtension = function ( url ) {

		var index = url.lastIndexOf( '.' );

		if ( index < 0 ) {

			return null;

		}

		return url.slice( index + 1 );

	};

	THREE.MMDLoader.prototype.loadFile = function ( url, onLoad, onProgress, onError, responseType, mimeType ) {

		var loader = new THREE.FileLoader( this.manager );

		if ( mimeType !== undefined ) loader.setMimeType( mimeType );

		loader.setResponseType( responseType );

		var request = loader.load( url, function ( result ) {

			onLoad( result );

		}, onProgress, onError );

		return request;

	};

	THREE.MMDLoader.prototype.loadFileAsBuffer = function ( url, onLoad, onProgress, onError ) {

		this.loadFile( url, onLoad, onProgress, onError, 'arraybuffer' );

	};

	THREE.MMDLoader.prototype.loadFileAsText = function ( url, onLoad, onProgress, onError ) {

		this.loadFile( url, onLoad, onProgress, onError, 'text' );

	};

	THREE.MMDLoader.prototype.loadFileAsShiftJISText = function ( url, onLoad, onProgress, onError ) {

		var request = this.loadFile( url, onLoad, onProgress, onError, 'text', 'text/plain; charset=shift_jis' );

	};

	THREE.MMDLoader.prototype.parseModel = function ( buffer, modelExtension ) {

		// Should I judge from model data header?
		switch( modelExtension.toLowerCase() ) {

			case 'pmd':
				return this.parsePmd( buffer );

			case 'pmx':
				return this.parsePmx( buffer );

			default:
				throw 'extension ' + modelExtension + ' is not supported.';

		}

	};

	THREE.MMDLoader.prototype.parsePmd = function ( buffer ) {

		var pmd = {};
		var dv = new THREE.MMDLoader.DataView( buffer );
		var helper = new THREE.MMDLoader.DataCreationHelper();

		pmd.metadata = {};
		pmd.metadata.format = 'pmd';
		pmd.metadata.coordinateSystem = 'left';

		var parseHeader = function () {

			var metadata = pmd.metadata;
			metadata.magic = dv.getChars( 3 );

			if ( metadata.magic !== 'Pmd' ) {

				throw 'PMD file magic is not Pmd, but ' + metadata.magic;

			}

			metadata.version = dv.getFloat32();
			metadata.modelName = dv.getSjisStringsAsUnicode( 20 );
			metadata.comment = dv.getSjisStringsAsUnicode( 256 );

		};

		var parseVertices = function () {

			var parseVertex = function () {

				var p = {};
				p.position = dv.getFloat32Array( 3 );
				p.normal = dv.getFloat32Array( 3 );
				p.uv = dv.getFloat32Array( 2 );
				p.skinIndices = dv.getUint16Array( 2 );
				p.skinWeights = [ dv.getUint8() / 100 ];
				p.skinWeights.push( 1.0 - p.skinWeights[ 0 ] );
				p.edgeFlag = dv.getUint8();
				return p;

			};

			var metadata = pmd.metadata;
			metadata.vertexCount = dv.getUint32();

			pmd.vertices = [];

			for ( var i = 0; i < metadata.vertexCount; i++ ) {

				pmd.vertices.push( parseVertex() );

			}

		};

		var parseFaces = function () {

			var parseFace = function () {

				var p = {};
				p.indices = dv.getUint16Array( 3 );
				return p;

			};

			var metadata = pmd.metadata;
			metadata.faceCount = dv.getUint32() / 3;

			pmd.faces = [];

			for ( var i = 0; i < metadata.faceCount; i++ ) {

				pmd.faces.push( parseFace() );

			}

		};

		var parseMaterials = function () {

			var parseMaterial = function () {

				var p = {};
				p.diffuse = dv.getFloat32Array( 4 );
				p.shininess = dv.getFloat32();
				p.specular = dv.getFloat32Array( 3 );
				p.ambient = dv.getFloat32Array( 3 );
				p.toonIndex = dv.getInt8();
				p.edgeFlag = dv.getUint8();
				p.faceCount = dv.getUint32() / 3;
				p.fileName = dv.getSjisStringsAsUnicode( 20 );
				return p;

			};

			var metadata = pmd.metadata;
			metadata.materialCount = dv.getUint32();

			pmd.materials = [];

			for ( var i = 0; i < metadata.materialCount; i++ ) {

				pmd.materials.push( parseMaterial() );

			}

		};

		var parseBones = function () {

			var parseBone = function () {

				var p = {};
				p.name = dv.getSjisStringsAsUnicode( 20 );
				p.parentIndex = dv.getInt16();
				p.tailIndex = dv.getInt16();
				p.type = dv.getUint8();
				p.ikIndex = dv.getInt16();
				p.position = dv.getFloat32Array( 3 );
				return p;

			};

			var metadata = pmd.metadata;
			metadata.boneCount = dv.getUint16();

			pmd.bones = [];

			for ( var i = 0; i < metadata.boneCount; i++ ) {

				pmd.bones.push( parseBone() );

			}

		};

		var parseIks = function () {

			var parseIk = function () {

				var p = {};
				p.target = dv.getUint16();
				p.effector = dv.getUint16();
				p.linkCount = dv.getUint8();
				p.iteration = dv.getUint16();
				p.maxAngle = dv.getFloat32();

				p.links = [];
				for ( var i = 0; i < p.linkCount; i++ ) {

					var link = {}
					link.index = dv.getUint16();
					p.links.push( link );

				}

				return p;

			};

			var metadata = pmd.metadata;
			metadata.ikCount = dv.getUint16();

			pmd.iks = [];

			for ( var i = 0; i < metadata.ikCount; i++ ) {

				pmd.iks.push( parseIk() );

			}

		};

		var parseMorphs = function () {

			var parseMorph = function () {

				var p = {};
				p.name = dv.getSjisStringsAsUnicode( 20 );
				p.elementCount = dv.getUint32();
				p.type = dv.getUint8();

				p.elements = [];
				for ( var i = 0; i < p.elementCount; i++ ) {

					p.elements.push( {
						index: dv.getUint32(),
						position: dv.getFloat32Array( 3 )
					} ) ;

				}

				return p;

			};

			var metadata = pmd.metadata;
			metadata.morphCount = dv.getUint16();

			pmd.morphs = [];

			for ( var i = 0; i < metadata.morphCount; i++ ) {

				pmd.morphs.push( parseMorph() );

			}


		};

		var parseMorphFrames = function () {

			var parseMorphFrame = function () {

				var p = {};
				p.index = dv.getUint16();
				return p;

			};

			var metadata = pmd.metadata;
			metadata.morphFrameCount = dv.getUint8();

			pmd.morphFrames = [];

			for ( var i = 0; i < metadata.morphFrameCount; i++ ) {

				pmd.morphFrames.push( parseMorphFrame() );

			}

		};

		var parseBoneFrameNames = function () {

			var parseBoneFrameName = function () {

				var p = {};
				p.name = dv.getSjisStringsAsUnicode( 50 );
				return p;

			};

			var metadata = pmd.metadata;
			metadata.boneFrameNameCount = dv.getUint8();

			pmd.boneFrameNames = [];

			for ( var i = 0; i < metadata.boneFrameNameCount; i++ ) {

				pmd.boneFrameNames.push( parseBoneFrameName() );

			}

		};

		var parseBoneFrames = function () {

			var parseBoneFrame = function () {

				var p = {};
				p.boneIndex = dv.getInt16();
				p.frameIndex = dv.getUint8();
				return p;

			};

			var metadata = pmd.metadata;
			metadata.boneFrameCount = dv.getUint32();

			pmd.boneFrames = [];

			for ( var i = 0; i < metadata.boneFrameCount; i++ ) {

				pmd.boneFrames.push( parseBoneFrame() );

			}

		};

		var parseEnglishHeader = function () {

			var metadata = pmd.metadata;
			metadata.englishCompatibility = dv.getUint8();

			if ( metadata.englishCompatibility > 0 ) {

				metadata.englishModelName = dv.getSjisStringsAsUnicode( 20 );
				metadata.englishComment = dv.getSjisStringsAsUnicode( 256 );

			}

		};

		var parseEnglishBoneNames = function () {

			var parseEnglishBoneName = function () {

				var p = {};
				p.name = dv.getSjisStringsAsUnicode( 20 );
				return p;

			};

			var metadata = pmd.metadata;

			if ( metadata.englishCompatibility === 0 ) {

				return;

			}

			pmd.englishBoneNames = [];

			for ( var i = 0; i < metadata.boneCount; i++ ) {

				pmd.englishBoneNames.push( parseEnglishBoneName() );

			}

		};

		var parseEnglishMorphNames = function () {

			var parseEnglishMorphName = function () {

				var p = {};
				p.name = dv.getSjisStringsAsUnicode( 20 );
				return p;

			};

			var metadata = pmd.metadata;

			if ( metadata.englishCompatibility === 0 ) {

				return;

			}

			pmd.englishMorphNames = [];

			for ( var i = 0; i < metadata.morphCount - 1; i++ ) {

				pmd.englishMorphNames.push( parseEnglishMorphName() );

			}

		};

		var parseEnglishBoneFrameNames = function () {

			var parseEnglishBoneFrameName = function () {

				var p = {};
				p.name = dv.getSjisStringsAsUnicode( 50 );
				return p;

			};

			var metadata = pmd.metadata;

			if ( metadata.englishCompatibility === 0 ) {

				return;

			}

			pmd.englishBoneFrameNames = [];

			for ( var i = 0; i < metadata.boneFrameNameCount; i++ ) {

				pmd.englishBoneFrameNames.push( parseEnglishBoneFrameName() );

			}

		};

		var parseToonTextures = function () {

			var parseToonTexture = function () {

				var p = {};
				p.fileName = dv.getSjisStringsAsUnicode( 100 );
				return p;

			};

			pmd.toonTextures = [];

			for ( var i = 0; i < 10; i++ ) {

				pmd.toonTextures.push( parseToonTexture() );

			}

		};

		var parseRigidBodies = function () {

			var parseRigidBody = function () {

				var p = {};
				p.name = dv.getSjisStringsAsUnicode( 20 );
				p.boneIndex = dv.getInt16();
				p.groupIndex = dv.getUint8();
				p.groupTarget = dv.getUint16();
				p.shapeType = dv.getUint8();
				p.width = dv.getFloat32();
				p.height = dv.getFloat32();
				p.depth = dv.getFloat32();
				p.position = dv.getFloat32Array( 3 );
				p.rotation = dv.getFloat32Array( 3 );
				p.weight = dv.getFloat32();
				p.positionDamping = dv.getFloat32();
				p.rotationDamping = dv.getFloat32();
				p.restitution = dv.getFloat32();
				p.friction = dv.getFloat32();
				p.type = dv.getUint8();
				return p;

			};

			var metadata = pmd.metadata;
			metadata.rigidBodyCount = dv.getUint32();

			pmd.rigidBodies = [];

			for ( var i = 0; i < metadata.rigidBodyCount; i++ ) {

				pmd.rigidBodies.push( parseRigidBody() );

			}

		};

		var parseConstraints = function () {

			var parseConstraint = function () {

				var p = {};
				p.name = dv.getSjisStringsAsUnicode( 20 );
				p.rigidBodyIndex1 = dv.getUint32();
				p.rigidBodyIndex2 = dv.getUint32();
				p.position = dv.getFloat32Array( 3 );
				p.rotation = dv.getFloat32Array( 3 );
				p.translationLimitation1 = dv.getFloat32Array( 3 );
				p.translationLimitation2 = dv.getFloat32Array( 3 );
				p.rotationLimitation1 = dv.getFloat32Array( 3 );
				p.rotationLimitation2 = dv.getFloat32Array( 3 );
				p.springPosition = dv.getFloat32Array( 3 );
				p.springRotation = dv.getFloat32Array( 3 );
				return p;

			};

			var metadata = pmd.metadata;
			metadata.constraintCount = dv.getUint32();

			pmd.constraints = [];

			for ( var i = 0; i < metadata.constraintCount; i++ ) {

				pmd.constraints.push( parseConstraint() );

			}

		};

		parseHeader();
		parseVertices();
		parseFaces();
		parseMaterials();
		parseBones();
		parseIks();
		parseMorphs();
		parseMorphFrames();
		parseBoneFrameNames();
		parseBoneFrames();
		parseEnglishHeader();
		parseEnglishBoneNames();
		parseEnglishMorphNames();
		parseEnglishBoneFrameNames();
		parseToonTextures();
		parseRigidBodies();
		parseConstraints();

		// console.log( pmd ); // for console debug

		return pmd;

	};

	THREE.MMDLoader.prototype.parsePmx = function ( buffer ) {

		var pmx = {};
		var dv = new THREE.MMDLoader.DataView( buffer );
		var helper = new THREE.MMDLoader.DataCreationHelper();

		pmx.metadata = {};
		pmx.metadata.format = 'pmx';
		pmx.metadata.coordinateSystem = 'left';

		var parseHeader = function () {

			var metadata = pmx.metadata;
			metadata.magic = dv.getChars( 4 );

			// Note: don't remove the last blank space.
			if ( metadata.magic !== 'PMX ' ) {

				throw 'PMX file magic is not PMX , but ' + metadata.magic;

			}

			metadata.version = dv.getFloat32();

			if ( metadata.version !== 2.0 && metadata.version !== 2.1 ) {

				throw 'PMX version ' + metadata.version + ' is not supported.';

			}

			metadata.headerSize = dv.getUint8();
			metadata.encoding = dv.getUint8();
			metadata.additionalUvNum = dv.getUint8();
			metadata.vertexIndexSize = dv.getUint8();
			metadata.textureIndexSize = dv.getUint8();
			metadata.materialIndexSize = dv.getUint8();
			metadata.boneIndexSize = dv.getUint8();
			metadata.morphIndexSize = dv.getUint8();
			metadata.rigidBodyIndexSize = dv.getUint8();
			metadata.modelName = dv.getTextBuffer();
			metadata.englishModelName = dv.getTextBuffer();
			metadata.comment = dv.getTextBuffer();
			metadata.englishComment = dv.getTextBuffer();

		};

		var parseVertices = function () {

			var parseVertex = function () {

				var p = {};
				p.position = dv.getFloat32Array( 3 );
				p.normal = dv.getFloat32Array( 3 );
				p.uv = dv.getFloat32Array( 2 );

				p.auvs = [];

				for ( var i = 0; i < pmx.metadata.additionalUvNum; i++ ) {

					p.auvs.push( dv.getFloat32Array( 4 ) );

				}

				p.type = dv.getUint8();

				var indexSize = metadata.boneIndexSize;

				if ( p.type === 0 ) {  // BDEF1

					p.skinIndices = dv.getIndexArray( indexSize, 1 );
					p.skinWeights = [ 1.0 ];

				} else if ( p.type === 1 ) {  // BDEF2

					p.skinIndices = dv.getIndexArray( indexSize, 2 );
					p.skinWeights = dv.getFloat32Array( 1 );
					p.skinWeights.push( 1.0 - p.skinWeights[ 0 ] );

				} else if ( p.type === 2 ) {  // BDEF4

					p.skinIndices = dv.getIndexArray( indexSize, 4 );
					p.skinWeights = dv.getFloat32Array( 4 );

				} else if ( p.type === 3 ) {  // SDEF

					p.skinIndices = dv.getIndexArray( indexSize, 2 );
					p.skinWeights = dv.getFloat32Array( 1 );
					p.skinWeights.push( 1.0 - p.skinWeights[ 0 ] );

					p.skinC = dv.getFloat32Array( 3 );
					p.skinR0 = dv.getFloat32Array( 3 );
					p.skinR1 = dv.getFloat32Array( 3 );

					// SDEF is not supported yet and is handled as BDEF2 so far.
					// TODO: SDEF support
					p.type = 1;

				} else {

					throw 'unsupport bone type ' + p.type + ' exception.';

				}

				p.edgeRatio = dv.getFloat32();
				return p;

			};

			var metadata = pmx.metadata;
			metadata.vertexCount = dv.getUint32();

			pmx.vertices = [];

			for ( var i = 0; i < metadata.vertexCount; i++ ) {

				pmx.vertices.push( parseVertex() );

			}

		};

		var parseFaces = function () {

			var parseFace = function () {

				var p = {};
				p.indices = dv.getIndexArray( metadata.vertexIndexSize, 3, true );
				return p;

			};

			var metadata = pmx.metadata;
			metadata.faceCount = dv.getUint32() / 3;

			pmx.faces = [];

			for ( var i = 0; i < metadata.faceCount; i++ ) {

				pmx.faces.push( parseFace() );

			}

		};

		var parseTextures = function () {

			var parseTexture = function () {

				return dv.getTextBuffer();

			};

			var metadata = pmx.metadata;
			metadata.textureCount = dv.getUint32();

			pmx.textures = [];

			for ( var i = 0; i < metadata.textureCount; i++ ) {

				pmx.textures.push( parseTexture() );

			}

		};

		var parseMaterials = function () {

			var parseMaterial = function () {

				var p = {};
				p.name = dv.getTextBuffer();
				p.englishName = dv.getTextBuffer();
				p.diffuse = dv.getFloat32Array( 4 );
				p.specular = dv.getFloat32Array( 3 );
				p.shininess = dv.getFloat32();
				p.ambient = dv.getFloat32Array( 3 );
				p.flag = dv.getUint8();
				p.edgeColor = dv.getFloat32Array( 4 );
				p.edgeSize = dv.getFloat32();
				p.textureIndex = dv.getIndex( pmx.metadata.textureIndexSize );
				p.envTextureIndex = dv.getIndex( pmx.metadata.textureIndexSize );
				p.envFlag = dv.getUint8();
				p.toonFlag = dv.getUint8();

				if ( p.toonFlag === 0 ) {

					p.toonIndex = dv.getIndex( pmx.metadata.textureIndexSize );

				} else if ( p.toonFlag === 1 ) {

					p.toonIndex = dv.getInt8();

				} else {

					throw 'unknown toon flag ' + p.toonFlag + ' exception.';

				}

				p.comment = dv.getTextBuffer();
				p.faceCount = dv.getUint32() / 3;
				return p;

			};

			var metadata = pmx.metadata;
			metadata.materialCount = dv.getUint32();

			pmx.materials = [];

			for ( var i = 0; i < metadata.materialCount; i++ ) {

				pmx.materials.push( parseMaterial() );

			}

		};

		var parseBones = function () {

			var parseBone = function () {

				var p = {};
				p.name = dv.getTextBuffer();
				p.englishName = dv.getTextBuffer();
				p.position = dv.getFloat32Array( 3 );
				p.parentIndex = dv.getIndex( pmx.metadata.boneIndexSize );
				p.transformationClass = dv.getUint32();
				p.flag = dv.getUint16();

				if ( p.flag & 0x1 ) {

					p.connectIndex = dv.getIndex( pmx.metadata.boneIndexSize );

				} else {

					p.offsetPosition = dv.getFloat32Array( 3 );

				}

				if ( p.flag & 0x100 || p.flag & 0x200 ) {

					// Note: I don't think Grant is an appropriate name
					//       but I found that some English translated MMD tools use this term
					//       so I've named it Grant so far.
					//       I'd rename to more appropriate name from Grant later.
					var grant = {};

					grant.isLocal = ( p.flag & 0x80 ) !== 0 ? true : false;
					grant.affectRotation = ( p.flag & 0x100 ) !== 0 ? true : false;
					grant.affectPosition = ( p.flag & 0x200 ) !== 0 ? true : false;
					grant.parentIndex = dv.getIndex( pmx.metadata.boneIndexSize );
					grant.ratio = dv.getFloat32();

					p.grant = grant;

				}

				if ( p.flag & 0x400 ) {

					p.fixAxis = dv.getFloat32Array( 3 );

				}

				if ( p.flag & 0x800 ) {

					p.localXVector = dv.getFloat32Array( 3 );
					p.localZVector = dv.getFloat32Array( 3 );

				}

				if ( p.flag & 0x2000 ) {

					p.key = dv.getUint32();

				}

				if ( p.flag & 0x20 ) {

					var ik = {};

					ik.effector = dv.getIndex( pmx.metadata.boneIndexSize );
					ik.target = null;
					ik.iteration = dv.getUint32();
					ik.maxAngle = dv.getFloat32();
					ik.linkCount = dv.getUint32();
					ik.links = [];

					for ( var i = 0; i < ik.linkCount; i++ ) {

						var link = {};
						link.index = dv.getIndex( pmx.metadata.boneIndexSize );
						link.angleLimitation = dv.getUint8();

						if ( link.angleLimitation === 1 ) {

							link.lowerLimitationAngle = dv.getFloat32Array( 3 );
							link.upperLimitationAngle = dv.getFloat32Array( 3 );

						}

						ik.links.push( link );

					}

					p.ik = ik;
				}

				return p;

			};

			var metadata = pmx.metadata;
			metadata.boneCount = dv.getUint32();

			pmx.bones = [];

			for ( var i = 0; i < metadata.boneCount; i++ ) {

				pmx.bones.push( parseBone() );

			}

		};

		var parseMorphs = function () {

			var parseMorph = function () {

				var p = {};
				p.name = dv.getTextBuffer();
				p.englishName = dv.getTextBuffer();
				p.panel = dv.getUint8();
				p.type = dv.getUint8();
				p.elementCount = dv.getUint32();
				p.elements = [];

				for ( var i = 0; i < p.elementCount; i++ ) {

					if ( p.type === 0 ) {  // group morph

						var m = {};
						m.index = dv.getIndex( pmx.metadata.morphIndexSize );
						m.ratio = dv.getFloat32();
						p.elements.push( m );

					} else if ( p.type === 1 ) {  // vertex morph

						var m = {};
						m.index = dv.getIndex( pmx.metadata.vertexIndexSize, true );
						m.position = dv.getFloat32Array( 3 );
						p.elements.push( m );

					} else if ( p.type === 2 ) {  // bone morph

						var m = {};
						m.index = dv.getIndex( pmx.metadata.boneIndexSize );
						m.position = dv.getFloat32Array( 3 );
						m.rotation = dv.getFloat32Array( 4 );
						p.elements.push( m );

					} else if ( p.type === 3 ) {  // uv morph

						var m = {};
						m.index = dv.getIndex( pmx.metadata.vertexIndexSize, true );
						m.uv = dv.getFloat32Array( 4 );
						p.elements.push( m );

					} else if ( p.type === 4 ) {  // additional uv1

						// TODO: implement

					} else if ( p.type === 5 ) {  // additional uv2

						// TODO: implement

					} else if ( p.type === 6 ) {  // additional uv3

						// TODO: implement

					} else if ( p.type === 7 ) {  // additional uv4

						// TODO: implement

					} else if ( p.type === 8 ) {  // material morph

						var m = {};
						m.index = dv.getIndex( pmx.metadata.materialIndexSize );
						m.type = dv.getUint8();
						m.diffuse = dv.getFloat32Array( 4 );
						m.specular = dv.getFloat32Array( 3 );
						m.shininess = dv.getFloat32();
						m.ambient = dv.getFloat32Array( 3 );
						m.edgeColor = dv.getFloat32Array( 4 );
						m.edgeSize = dv.getFloat32();
						m.textureColor = dv.getFloat32Array( 4 );
						m.sphereTextureColor = dv.getFloat32Array( 4 );
						m.toonColor = dv.getFloat32Array( 4 );
						p.elements.push( m );

					}

				}

				return p;

			};

			var metadata = pmx.metadata;
			metadata.morphCount = dv.getUint32();

			pmx.morphs = [];

			for ( var i = 0; i < metadata.morphCount; i++ ) {

				pmx.morphs.push( parseMorph() );

			}

		};

		var parseFrames = function () {

			var parseFrame = function () {

				var p = {};
				p.name = dv.getTextBuffer();
				p.englishName = dv.getTextBuffer();
				p.type = dv.getUint8();
				p.elementCount = dv.getUint32();
				p.elements = [];

				for ( var i = 0; i < p.elementCount; i++ ) {

					var e = {};
					e.target = dv.getUint8();
					e.index = ( e.target === 0 ) ? dv.getIndex( pmx.metadata.boneIndexSize ) : dv.getIndex( pmx.metadata.morphIndexSize );
					p.elements.push( e );

				}

				return p;

			};

			var metadata = pmx.metadata;
			metadata.frameCount = dv.getUint32();

			pmx.frames = [];

			for ( var i = 0; i < metadata.frameCount; i++ ) {

				pmx.frames.push( parseFrame() );

			}

		};

		var parseRigidBodies = function () {

			var parseRigidBody = function () {

				var p = {};
				p.name = dv.getTextBuffer();
				p.englishName = dv.getTextBuffer();
				p.boneIndex = dv.getIndex( pmx.metadata.boneIndexSize );
				p.groupIndex = dv.getUint8();
				p.groupTarget = dv.getUint16();
				p.shapeType = dv.getUint8();
				p.width = dv.getFloat32();
				p.height = dv.getFloat32();
				p.depth = dv.getFloat32();
				p.position = dv.getFloat32Array( 3 );
				p.rotation = dv.getFloat32Array( 3 );
				p.weight = dv.getFloat32();
				p.positionDamping = dv.getFloat32();
				p.rotationDamping = dv.getFloat32();
				p.restitution = dv.getFloat32();
				p.friction = dv.getFloat32();
				p.type = dv.getUint8();
				return p;

			};

			var metadata = pmx.metadata;
			metadata.rigidBodyCount = dv.getUint32();

			pmx.rigidBodies = [];

			for ( var i = 0; i < metadata.rigidBodyCount; i++ ) {

				pmx.rigidBodies.push( parseRigidBody() );

			}

		};

		var parseConstraints = function () {

			var parseConstraint = function () {

				var p = {};
				p.name = dv.getTextBuffer();
				p.englishName = dv.getTextBuffer();
				p.type = dv.getUint8();
				p.rigidBodyIndex1 = dv.getIndex( pmx.metadata.rigidBodyIndexSize );
				p.rigidBodyIndex2 = dv.getIndex( pmx.metadata.rigidBodyIndexSize );
				p.position = dv.getFloat32Array( 3 );
				p.rotation = dv.getFloat32Array( 3 );
				p.translationLimitation1 = dv.getFloat32Array( 3 );
				p.translationLimitation2 = dv.getFloat32Array( 3 );
				p.rotationLimitation1 = dv.getFloat32Array( 3 );
				p.rotationLimitation2 = dv.getFloat32Array( 3 );
				p.springPosition = dv.getFloat32Array( 3 );
				p.springRotation = dv.getFloat32Array( 3 );
				return p;

			};

			var metadata = pmx.metadata;
			metadata.constraintCount = dv.getUint32();

			pmx.constraints = [];

			for ( var i = 0; i < metadata.constraintCount; i++ ) {

				pmx.constraints.push( parseConstraint() );

			}

		};

		parseHeader();
		parseVertices();
		parseFaces();
		parseTextures();
		parseMaterials();
		parseBones();
		parseMorphs();
		parseFrames();
		parseRigidBodies();
		parseConstraints();

		// console.log( pmx ); // for console debug

		return pmx;

	};

	THREE.MMDLoader.prototype.parseVmd = function ( buffer ) {

		var vmd = {};
		var dv = new THREE.MMDLoader.DataView( buffer );
		var helper = new THREE.MMDLoader.DataCreationHelper();

		vmd.metadata = {};
		vmd.metadata.coordinateSystem = 'left';

		var parseHeader = function () {

			var metadata = vmd.metadata;
			metadata.magic = dv.getChars( 30 );

			if ( metadata.magic !== 'Vocaloid Motion Data 0002' ) {

				throw 'VMD file magic is not Vocaloid Motion Data 0002, but ' + metadata.magic;

			}

			metadata.name = dv.getSjisStringsAsUnicode( 20 );

		};

		var parseMotions = function () {

			var parseMotion = function () {

				var p = {};
				p.boneName = dv.getSjisStringsAsUnicode( 15 );
				p.frameNum = dv.getUint32();
				p.position = dv.getFloat32Array( 3 );
				p.rotation = dv.getFloat32Array( 4 );
				p.interpolation = dv.getUint8Array( 64 );
				return p;

			};

			var metadata = vmd.metadata;
			metadata.motionCount = dv.getUint32();

			vmd.motions = [];
			for ( var i = 0; i < metadata.motionCount; i++ ) {

				vmd.motions.push( parseMotion() );

			}

		};

		var parseMorphs = function () {

			var parseMorph = function () {

				var p = {};
				p.morphName = dv.getSjisStringsAsUnicode( 15 );
				p.frameNum = dv.getUint32();
				p.weight = dv.getFloat32();
				return p;

			};

			var metadata = vmd.metadata;
			metadata.morphCount = dv.getUint32();

			vmd.morphs = [];
			for ( var i = 0; i < metadata.morphCount; i++ ) {

				vmd.morphs.push( parseMorph() );

			}

		};

		var parseCameras = function () {

			var parseCamera = function () {

				var p = {};
				p.frameNum = dv.getUint32();
				p.distance = dv.getFloat32();
				p.position = dv.getFloat32Array( 3 );
				p.rotation = dv.getFloat32Array( 3 );
				p.interpolation = dv.getUint8Array( 24 );
				p.fov = dv.getUint32();
				p.perspective = dv.getUint8();
				return p;

			};

			var metadata = vmd.metadata;
			metadata.cameraCount = dv.getUint32();

			vmd.cameras = [];
			for ( var i = 0; i < metadata.cameraCount; i++ ) {

				vmd.cameras.push( parseCamera() );

			}

		};

		parseHeader();
		parseMotions();
		parseMorphs();
		parseCameras();

		// console.log( vmd ); // for console debug

		return vmd;

	};

	THREE.MMDLoader.prototype.parseVpd = function ( text ) {

		var helper = new THREE.MMDLoader.DataCreationHelper();

		var vpd = {};

		vpd.metadata = {};
		vpd.metadata.coordinateSystem = 'left';

		vpd.bones = [];

		var commentPatternG = /\/\/\w*(\r|\n|\r\n)/g;
		var newlinePattern = /\r|\n|\r\n/;

		var lines = text.replace( commentPatternG, '' ).split( newlinePattern );

		function throwError () {

			throw 'the file seems not vpd file.';

		};

		function checkMagic () {

			if ( lines[ 0 ] !== 'Vocaloid Pose Data file' ) {

				throwError();

			}

		};

		function parseHeader () {

			if ( lines.length < 4 ) {

				throwError();

			}

			vpd.metadata.parentFile = lines[ 2 ];
			vpd.metadata.boneCount = parseInt( lines[ 3 ] );

		};

		function parseBones () {

			var boneHeaderPattern = /^\s*(Bone[0-9]+)\s*\{\s*(.*)$/;
			var boneVectorPattern = /^\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*;/;
			var boneQuaternionPattern = /^\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*;/;
			var boneFooterPattern = /^\s*}/;

			var bones = vpd.bones;
			var n = null;
			var v = null;
			var q = null;

			var encoder = new CharsetEncoder();

			for ( var i = 4; i < lines.length; i++ ) {

				var line = lines[ i ];

				var result;

				result = line.match( boneHeaderPattern );

				if ( result !== null ) {

					if ( n !== null ) {

						throwError();

					}

					n = result[ 2 ];

				}

				result = line.match( boneVectorPattern );

				if ( result !== null ) {

					if ( v !== null ) {

						throwError();

					}

					v = [

						parseFloat( result[ 1 ] ),
						parseFloat( result[ 2 ] ),
						parseFloat( result[ 3 ] )

					];

				}

				result = line.match( boneQuaternionPattern );

				if ( result !== null ) {

					if ( q !== null ) {

						throwError();

					}

					q = [

						parseFloat( result[ 1 ] ),
						parseFloat( result[ 2 ] ),
						parseFloat( result[ 3 ] ),
						parseFloat( result[ 4 ] )

					];


				}

				result = line.match( boneFooterPattern );

				if ( result !== null ) {

					if ( n === null || v === null || q === null ) {

						throwError();

					}

					bones.push( {

						name: n,
						translation: v,
						quaternion: q

					} );

					n = null;
					v = null;
					q = null;

				}

			}

			if ( n !== null || v !== null || q !== null ) {

				throwError();

			}

		};

		checkMagic();
		parseHeader();
		parseBones();

		this.leftToRightVpd( vpd );

		// console.log( vpd );  // for console debug

		return vpd;

	};

	THREE.MMDLoader.prototype.createMesh = function ( model, texturePath, onProgress, onError ) {

		var scope = this;
		var geometry = new THREE.BufferGeometry();
		var material = new THREE.MultiMaterial();
		var helper = new THREE.MMDLoader.DataCreationHelper();

		var buffer = {};

		buffer.vertices = [];
		buffer.uvs = [];
		buffer.normals = [];
		buffer.skinIndices = [];
		buffer.skinWeights = [];
		buffer.indices = [];

		var initVartices = function () {

			for ( var i = 0; i < model.metadata.vertexCount; i++ ) {

				var v = model.vertices[ i ];

				for ( var j = 0, jl = v.position.length; j < jl; j ++ ) {

					buffer.vertices.push( v.position[ j ] );

				}

				for ( var j = 0, jl = v.normal.length; j < jl; j ++ ) {

					buffer.normals.push( v.normal[ j ] );

				}

				for ( var j = 0, jl = v.uv.length; j < jl; j ++ ) {

					buffer.uvs.push( v.uv[ j ] );

				}

				for ( var j = 0; j < 4; j ++ ) {

					buffer.skinIndices.push( v.skinIndices.length - 1 >= j ? v.skinIndices[ j ] : 0.0 );

				}

				for ( var j = 0; j < 4; j ++ ) {

					buffer.skinWeights.push( v.skinWeights.length - 1 >= j ? v.skinWeights[ j ] : 0.0 );

				}

			}

		};

		var initFaces = function () {

			for ( var i = 0; i < model.metadata.faceCount; i++ ) {

				var f = model.faces[ i ];

				for ( var j = 0, jl = f.indices.length; j < jl; j ++ ) {

					buffer.indices.push( f.indices[ j ] );

				}

			}

		};

		var initBones = function () {

			var bones = [];

			var rigidBodies = model.rigidBodies;
			var dictionary = {};

			for ( var i = 0, il = rigidBodies.length; i < il; i ++ ) {

				var body = rigidBodies[ i ];
				var value = dictionary[ body.boneIndex ];

				// keeps greater number if already value is set without any special reasons
				value = value === undefined ? body.type : Math.max( body.type, value );

				dictionary[ body.boneIndex ] = value;

			}

			for ( var i = 0; i < model.metadata.boneCount; i++ ) {

				var bone = {};
				var b = model.bones[ i ];

				bone.parent = b.parentIndex;
				bone.name = b.name;
				bone.pos = [ b.position[ 0 ], b.position[ 1 ], b.position[ 2 ] ];
				bone.rotq = [ 0, 0, 0, 1 ];
				bone.scl = [ 1, 1, 1 ];

				if ( bone.parent !== -1 ) {

					bone.pos[ 0 ] -= model.bones[ bone.parent ].position[ 0 ];
					bone.pos[ 1 ] -= model.bones[ bone.parent ].position[ 1 ];
					bone.pos[ 2 ] -= model.bones[ bone.parent ].position[ 2 ];

				}

				bone.rigidBodyType = dictionary[ i ] !== undefined ? dictionary[ i ] : -1;

				bones.push( bone );

			}

			geometry.bones = bones;

		};

		var initIKs = function () {

			var iks = [];

			// TODO: remove duplicated codes between PMD and PMX
			if ( model.metadata.format === 'pmd' ) {

				for ( var i = 0; i < model.metadata.ikCount; i++ ) {

					var ik = model.iks[i];
					var param = {};

					param.target = ik.target;
					param.effector = ik.effector;
					param.iteration = ik.iteration;
					param.maxAngle = ik.maxAngle * 4;
					param.links = [];

					for ( var j = 0; j < ik.links.length; j++ ) {

						var link = {};
						link.index = ik.links[ j ].index;

						if ( model.bones[ link.index ].name.indexOf( 'ひざ' ) >= 0 ) {

							link.limitation = new THREE.Vector3( 1.0, 0.0, 0.0 );

						}

						param.links.push( link );

					}

					iks.push( param );

				}

			} else {

				for ( var i = 0; i < model.metadata.boneCount; i++ ) {

					var b = model.bones[ i ];
					var ik = b.ik;

					if ( ik === undefined ) {

						continue;

					}

					var param = {};

					param.target = i;
					param.effector = ik.effector;
					param.iteration = ik.iteration;
					param.maxAngle = ik.maxAngle;
					param.links = [];

					for ( var j = 0; j < ik.links.length; j++ ) {

						var link = {};
						link.index = ik.links[ j ].index;
						link.enabled = true;

						if ( ik.links[ j ].angleLimitation === 1 ) {

							link.limitation = new THREE.Vector3( 1.0, 0.0, 0.0 );
							// TODO: use limitation angles
							// link.lowerLimitationAngle;
							// link.upperLimitationAngle;

						}

						param.links.push( link );

					}

					iks.push( param );

				}

			}

			geometry.iks = iks;

		};

		var initGrants = function () {

			if ( model.metadata.format === 'pmd' ) {

				return;

			}

			var grants = [];

			for ( var i = 0; i < model.metadata.boneCount; i++ ) {

				var b = model.bones[ i ];
				var grant = b.grant;

				if ( grant === undefined ) {

					continue;

				}

				var param = {};

				param.index = i;
				param.parentIndex = grant.parentIndex;
				param.ratio = grant.ratio;
				param.isLocal = grant.isLocal;
				param.affectRotation = grant.affectRotation;
				param.affectPosition = grant.affectPosition;
				param.transformationClass = b.transformationClass;

				grants.push( param );

			}

			grants.sort( function ( a, b ) {

				return a.transformationClass - b.transformationClass;

			} );

			geometry.grants = grants;

		};

		var initMorphs = function () {

			function updateVertex( attribute, index, v, ratio ) {

				attribute.array[ index * 3 + 0 ] += v.position[ 0 ] * ratio;
				attribute.array[ index * 3 + 1 ] += v.position[ 1 ] * ratio;
				attribute.array[ index * 3 + 2 ] += v.position[ 2 ] * ratio;

			};

			function updateVertices( attribute, m, ratio ) {

				for ( var i = 0; i < m.elementCount; i++ ) {

					var v = m.elements[ i ];

					var index;

					if ( model.metadata.format === 'pmd' ) {

						index = model.morphs[ 0 ].elements[ v.index ].index;

					} else {

						index = v.index;

					}

					updateVertex( attribute, index, v, ratio );

				}

			};

			var morphTargets = [];
			var attributes = [];

			for ( var i = 0; i < model.metadata.morphCount; i++ ) {

				var m = model.morphs[ i ];
				var params = { name: m.name };

				var attribute = new THREE.Float32BufferAttribute( model.metadata.vertexCount * 3, 3 );

				for ( var j = 0; j < model.metadata.vertexCount * 3; j++ ) {

					attribute.array[ j ] = buffer.vertices[ j ];

				}

				if ( model.metadata.format === 'pmd' ) {

					if ( i !== 0 ) {

						updateVertices( attribute, m, 1.0 );

					}

				} else {

					if ( m.type === 0 ) {    // group

						for ( var j = 0; j < m.elementCount; j++ ) {

							var m2 = model.morphs[ m.elements[ j ].index ];
							var ratio = m.elements[ j ].ratio;

							if ( m2.type === 1 ) {

								updateVertices( attribute, m2, ratio );

							} else {

								// TODO: implement

							}

						}

					} else if ( m.type === 1 ) {    // vertex

						updateVertices( attribute, m, 1.0 );

					} else if ( m.type === 2 ) {    // bone

						// TODO: implement

					} else if ( m.type === 3 ) {    // uv

						// TODO: implement

					} else if ( m.type === 4 ) {    // additional uv1

						// TODO: implement

					} else if ( m.type === 5 ) {    // additional uv2

						// TODO: implement

					} else if ( m.type === 6 ) {    // additional uv3

						// TODO: implement

					} else if ( m.type === 7 ) {    // additional uv4

						// TODO: implement

					} else if ( m.type === 8 ) {    // material

						// TODO: implement

					}

				}

				morphTargets.push( params );
				attributes.push( attribute );

			}

			geometry.morphTargets = morphTargets;
			geometry.morphAttributes.position = attributes;

		};

		var initMaterials = function () {

			var textures = [];
			var textureLoader = new THREE.TextureLoader( this.manager );
			var tgaLoader = new THREE.TGALoader( this.manager );
			var offset = 0;
			var materialParams = [];

			function loadTexture ( filePath, params ) {

				if ( params === undefined ) {

					params = {};

				}

				var fullPath;

				if ( params.defaultTexturePath === true ) {

					try {

						fullPath = scope.defaultToonTextures[ parseInt( filePath.match( 'toon([0-9]{2})\.bmp$' )[ 1 ] ) ];

					} catch ( e ) {

						console.warn( 'THREE.MMDLoader: ' + filePath + ' seems like not right default texture path. Using toon00.bmp instead.' )
						fullPath = scope.defaultToonTextures[ 0 ];

					}

				} else {

					fullPath = texturePath + filePath;

				}

				var loader = THREE.Loader.Handlers.get( fullPath );

				if ( loader === null ) {

					loader = ( filePath.indexOf( '.tga' ) >= 0 ) ? tgaLoader : textureLoader;

				}

				var texture = loader.load( fullPath, function ( t ) {

					t.flipY = false;
					t.wrapS = THREE.RepeatWrapping;
					t.wrapT = THREE.RepeatWrapping;

					if ( params.sphericalReflectionMapping === true ) {

						t.mapping = THREE.SphericalReflectionMapping;

					}

					for ( var i = 0; i < texture.readyCallbacks.length; i++ ) {

						texture.readyCallbacks[ i ]( texture );

					}

					delete texture.readyCallbacks;

				} );

				texture.readyCallbacks = [];

				var uuid = THREE.Math.generateUUID();

				textures[ uuid ] = texture;

				return uuid;

			};

			function getTexture( name, textures ) {

				if ( textures[ name ] === undefined ) {

					console.warn( 'THREE.MMDLoader: Undefined texture', name );

				}

				return textures[ name ];

			};

			for ( var i = 0; i < model.metadata.materialCount; i++ ) {

				var m = model.materials[ i ];
				var params = {};

				params.faceOffset = offset;
				params.faceNum = m.faceCount;

				offset += m.faceCount;

				params.name = m.name;

				/*
				 * Color
				 *
				 * MMD         MeshPhongMaterial
				 * diffuse  -  color
				 * specular -  specular
				 * ambient  -  emissive * a
				 *               (a = 1.0 without map texture or 0.2 with map texture)
				 *
				 * MeshPhongMaterial doesn't have ambient. Set it to emissive instead.
				 * It'll be too bright if material has map texture so using coef 0.2.
				 */
				params.color = new THREE.Color( m.diffuse[ 0 ], m.diffuse[ 1 ], m.diffuse[ 2 ] );
				params.opacity = m.diffuse[ 3 ];
				params.specular = new THREE.Color( m.specular[ 0 ], m.specular[ 1 ], m.specular[ 2 ] );
				params.shininess = m.shininess;

				if ( params.opacity === 1.0 ) {

					params.side = THREE.FrontSide;
					params.transparent = false;

				} else {

					params.side = THREE.DoubleSide;
					params.transparent = true;

				}

				if ( model.metadata.format === 'pmd' ) {

					if ( m.fileName ) {

						var fileName = m.fileName;
						var fileNames = [];

						var index = fileName.lastIndexOf( '*' );

						if ( index >= 0 ) {

							fileNames.push( fileName.slice( 0, index ) );
							fileNames.push( fileName.slice( index + 1 ) );

						} else {

							fileNames.push( fileName );

						}

						for ( var j = 0; j < fileNames.length; j++ ) {

							var n = fileNames[ j ];

							if ( n.indexOf( '.sph' ) >= 0 || n.indexOf( '.spa' ) >= 0 ) {

								params.envMap = loadTexture( n, { sphericalReflectionMapping: true } );

								if ( n.indexOf( '.sph' ) >= 0 ) {

									params.envMapType = THREE.MultiplyOperation;

								} else {

									params.envMapType = THREE.AddOperation;

								}

							} else {

								params.map = loadTexture( n );

							}

						}

					}

				} else {

					if ( m.textureIndex !== -1 ) {

						var n = model.textures[ m.textureIndex ];
						params.map = loadTexture( n );

					}

					// TODO: support m.envFlag === 3
					if ( m.envTextureIndex !== -1 && ( m.envFlag === 1 || m.envFlag == 2 ) ) {

						var n = model.textures[ m.envTextureIndex ];
						params.envMap = loadTexture( n, { sphericalReflectionMapping: true } );

						if ( m.envFlag === 1 ) {

							params.envMapType = THREE.MultiplyOperation;

						} else {

							params.envMapType = THREE.AddOperation;

						}

					}

				}

				var coef = ( params.map === undefined ) ? 1.0 : 0.2;
				params.emissive = new THREE.Color( m.ambient[ 0 ] * coef, m.ambient[ 1 ] * coef, m.ambient[ 2 ] * coef );

				materialParams.push( params );

			}

			var shader = THREE.ShaderLib[ 'mmd' ];

			for ( var i = 0; i < materialParams.length; i++ ) {

				var p = materialParams[ i ];
				var p2 = model.materials[ i ];
				var m = new THREE.ShaderMaterial( {
					uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
					vertexShader: shader.vertexShader,
					fragmentShader: shader.fragmentShader
				} );

				geometry.addGroup( p.faceOffset * 3, p.faceNum * 3, i );

				if ( p.name !== undefined ) m.name = p.name;

				m.skinning = geometry.bones.length > 0 ? true : false;
				m.morphTargets = geometry.morphTargets.length > 0 ? true : false;
				m.lights = true;
				m.side = ( model.metadata.format === 'pmx' && ( p2.flag & 0x1 ) === 1 ) ? THREE.DoubleSide : p.side;
				m.transparent = p.transparent;
				m.fog = true;

				m.blending = THREE.CustomBlending;
				m.blendSrc = THREE.SrcAlphaFactor;
				m.blendDst = THREE.OneMinusSrcAlphaFactor;
				m.blendSrcAlpha = THREE.SrcAlphaFactor;
				m.blendDstAlpha = THREE.DstAlphaFactor;

				if ( p.map !== undefined ) {

					m.faceOffset = p.faceOffset;
					m.faceNum = p.faceNum;

					// Check if this part of the texture image the material uses requires transparency
					function checkTextureTransparency ( m ) {

						m.map.readyCallbacks.push( function ( t ) {

							// Is there any efficient ways?
							function createImageData ( image ) {

								var c = document.createElement( 'canvas' );
								c.width = image.width;
								c.height = image.height;

								var ctx = c.getContext( '2d' );
								ctx.drawImage( image, 0, 0 );

								return ctx.getImageData( 0, 0, c.width, c.height );

							};

							function detectTextureTransparency( image, uvs, indices ) {

								var width = image.width;
								var height = image.height;
								var data = image.data;
								var threshold = 253;

								if ( data.length / ( width * height ) !== 4 ) {

									return false;

								}

								for ( var i = 0; i < indices.length; i += 3 ) {

									var centerUV = { x: 0.0, y: 0.0 };

									for ( var j = 0; j < 3; j++ ) {

										var index = indices[ i * 3 + j ];
										var uv = { x: uvs[ index * 2 + 0 ], y: uvs[ index * 2 + 1 ] };

										if ( getAlphaByUv( image, uv ) < threshold ) {

											return true;

										}

										centerUV.x += uv.x;
										centerUV.y += uv.y;

									}

									centerUV.x /= 3;
									centerUV.y /= 3;

									if ( getAlphaByUv( image, centerUV ) < threshold ) {

										return true;

									}

								}

								return false;

							};

							/*
							 * This method expects
							 *   t.flipY = false
							 *   t.wrapS = THREE.RepeatWrapping
							 *   t.wrapT = THREE.RepeatWrapping
							 * TODO: more precise
							 */
							function getAlphaByUv ( image, uv ) {

								var width = image.width;
								var height = image.height;

								var x = Math.round( uv.x * width ) % width;
								var y = Math.round( uv.y * height ) % height;

								if ( x < 0 ) {

									x += width;

								}

								if ( y < 0 ) {

									y += height;

								}

								var index = y * width + x;

								return image.data[ index * 4 + 3 ];

							};

							var imageData = t.image.data !== undefined ? t.image : createImageData( t.image );
							var indices = geometry.index.array.slice( m.faceOffset * 3, m.faceOffset * 3 + m.faceNum * 3 );

							if ( detectTextureTransparency( imageData, geometry.attributes.uv.array, indices ) ) m.transparent = true;

							delete m.faceOffset;
							delete m.faceNum;

						} );

					}

					m.map = getTexture( p.map, textures );
					m.uniforms.map.value = m.map;
					checkTextureTransparency( m );

				}

				if ( p.envMap !== undefined ) {

					m.envMap = getTexture( p.envMap, textures );
					m.uniforms.envMap.value = m.envMap;
					m.combine = p.envMapType;

					// TODO: WebGLRenderer should automatically update?
					m.envMap.readyCallbacks.push( function ( t ) {

						m.needsUpdate = true;

					} );

				}

				m.uniforms.opacity.value = p.opacity;
				m.uniforms.diffuse.value.copy( p.color );

				if ( p.emissive !== undefined ) {

					m.uniforms.emissive.value.copy( p.emissive );

				}

				m.uniforms.specular.value.copy( p.specular );
				m.uniforms.shininess.value = Math.max( p.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )

				if ( model.metadata.format === 'pmd' ) {

					function isDefaultToonTexture ( n ) {

						if ( n.length !== 10 ) {

							return false;

						}

						return n.match( /toon(10|0[0-9]).bmp/ ) === null ? false : true;

					};

					m.outlineParameters = {
						thickness: p2.edgeFlag === 1 ? 0.003 : 0.0,
						color: new THREE.Color( 0.0, 0.0, 0.0 ),
						alpha: 1.0
					};

					if ( m.outlineParameters.thickness === 0.0 ) m.outlineParameters.visible = false;

					m.uniforms.toonMap.value = textures[ p2.toonIndex ];
					m.uniforms.celShading.value = 1;

					if ( p2.toonIndex === -1 ) {

						m.uniforms.hasToonTexture.value = 0;

					} else {

						var n = model.toonTextures[ p2.toonIndex ].fileName;
						var uuid = loadTexture( n, { defaultTexturePath: isDefaultToonTexture( n ) } );
						m.uniforms.toonMap.value = textures[ uuid ];
						m.uniforms.hasToonTexture.value = 1;

					}

				} else {

					m.outlineParameters = {
						thickness: p2.edgeSize / 300,
						color: new THREE.Color( p2.edgeColor[ 0 ], p2.edgeColor[ 1 ], p2.edgeColor[ 2 ] ),
						alpha: p2.edgeColor[ 3 ]
					};

					if ( ( p2.flag & 0x10 ) === 0 || m.outlineParameters.thickness === 0.0 ) m.outlineParameters.visible = false;

					m.uniforms.celShading.value = 1;

					if ( p2.toonIndex === -1 ) {

						m.uniforms.hasToonTexture.value = 0;

					} else {

						if ( p2.toonFlag === 0 ) {

							var n = model.textures[ p2.toonIndex ];
							var uuid = loadTexture( n );
							m.uniforms.toonMap.value = textures[ uuid ];

						} else {

							var num = p2.toonIndex + 1;
							var fileName = 'toon' + ( num < 10 ? '0' + num : num ) + '.bmp';
							var uuid = loadTexture( fileName, { defaultTexturePath: true } );
							m.uniforms.toonMap.value = textures[ uuid ];

						}

						m.uniforms.hasToonTexture.value = 1;

					}

				}

				material.materials.push( m );

			}

			if ( model.metadata.format === 'pmx' ) {

				function checkAlphaMorph ( morph, elements ) {

					if ( morph.type !== 8 ) {

						return;

					}

					for ( var i = 0; i < elements.length; i++ ) {

						var e = elements[ i ];

						if ( e.index === -1 ) {

							continue;

						}

						var m = material.materials[ e.index ];

						if ( m.uniforms.opacity.value !== e.diffuse[ 3 ] ) {

							m.transparent = true;

						}

					}

				}

				for ( var i = 0; i < model.morphs.length; i++ ) {

					var morph = model.morphs[ i ];
					var elements = morph.elements;

					if ( morph.type === 0 ) {

						for ( var j = 0; j < elements.length; j++ ) {

							var morph2 = model.morphs[ elements[ j ].index ];
							var elements2 = morph2.elements;

							checkAlphaMorph( morph2, elements2 );

						}

					} else {

						checkAlphaMorph( morph, elements );

					}

				}

			}

		};

		var initPhysics = function () {

			var rigidBodies = [];
			var constraints = [];

			for ( var i = 0; i < model.metadata.rigidBodyCount; i++ ) {

				var b = model.rigidBodies[ i ];
				var keys = Object.keys( b );

				var p = {};

				for ( var j = 0; j < keys.length; j++ ) {

					var key = keys[ j ];
					p[ key ] = b[ key ];

				}

				/*
				 * RigidBody position parameter in PMX seems global position
				 * while the one in PMD seems offset from corresponding bone.
				 * So unify being offset.
				 */
				if ( model.metadata.format === 'pmx' ) {

					if ( p.boneIndex !== -1 ) {

						var bone = model.bones[ p.boneIndex ];
						p.position[ 0 ] -= bone.position[ 0 ];
						p.position[ 1 ] -= bone.position[ 1 ];
						p.position[ 2 ] -= bone.position[ 2 ];

					}

				}

				rigidBodies.push( p );

			}

			for ( var i = 0; i < model.metadata.constraintCount; i++ ) {

				var c = model.constraints[ i ];
				var keys = Object.keys( c );

				var p = {};

				for ( var j = 0; j < keys.length; j++ ) {

					var key = keys[ j ];
					p[ key ] = c[ key ];

				}

				var bodyA = rigidBodies[ p.rigidBodyIndex1 ];
				var bodyB = rigidBodies[ p.rigidBodyIndex2 ];

				/*
				 * Refer to http://www20.atpages.jp/katwat/wp/?p=4135
				 */
				if ( bodyA.type !== 0 && bodyB.type === 2 ) {

					if ( bodyA.boneIndex !== -1 && bodyB.boneIndex !== -1 &&
					     model.bones[ bodyB.boneIndex ].parentIndex === bodyA.boneIndex ) {

						bodyB.type = 1;

					}

				}

				constraints.push( p );

			}

			geometry.rigidBodies = rigidBodies;
			geometry.constraints = constraints;

		};

		var initGeometry = function () {

			geometry.setIndex( new ( buffer.indices.length > 65535 ? THREE.Uint32BufferAttribute : THREE.Uint16BufferAttribute )( buffer.indices, 1 ) );
			geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( buffer.vertices, 3 ) );
			geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( buffer.normals, 3 ) );
			geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( buffer.uvs, 2 ) );
			geometry.addAttribute( 'skinIndex', new THREE.Float32BufferAttribute( buffer.skinIndices, 4 ) );
			geometry.addAttribute( 'skinWeight', new THREE.Float32BufferAttribute( buffer.skinWeights, 4 ) );

			geometry.computeBoundingSphere();
			geometry.mmdFormat = model.metadata.format;

		};

		this.leftToRightModel( model );

		initVartices();
		initFaces();
		initBones();
		initIKs();
		initGrants();
		initMorphs();
		initMaterials();
		initPhysics();
		initGeometry();

		var mesh = new THREE.SkinnedMesh( geometry, material );

		// console.log( mesh ); // for console debug

		return mesh;

	};

	THREE.MMDLoader.prototype.createAnimation = function ( mesh, vmd, name ) {

		var helper = new THREE.MMDLoader.DataCreationHelper();

		var initMotionAnimations = function () {

			if ( vmd.metadata.motionCount === 0 ) {

				return;

			}

			var bones = mesh.geometry.bones;
			var orderedMotions = helper.createOrderedMotionArrays( bones, vmd.motions, 'boneName' );

			var tracks = [];

			var pushInterpolation = function ( array, interpolation, index ) {

				array.push( interpolation[ index + 0 ] / 127 );  // x1
				array.push( interpolation[ index + 8 ] / 127 );  // x2
				array.push( interpolation[ index + 4 ] / 127 );  // y1
				array.push( interpolation[ index + 12 ] / 127 ); // y2

			};

			for ( var i = 0; i < orderedMotions.length; i++ ) {

				var times = [];
				var positions = [];
				var rotations = [];
				var pInterpolations = [];
				var rInterpolations = [];

				var bone = bones[ i ];
				var array = orderedMotions[ i ];

				for ( var j = 0; j < array.length; j++ ) {

					var time = array[ j ].frameNum / 30;
					var pos = array[ j ].position;
					var rot = array[ j ].rotation;
					var interpolation = array[ j ].interpolation;

					times.push( time );

					for ( var k = 0; k < 3; k ++ ) {

						positions.push( bone.pos[ k ] + pos[ k ] );

					}

					for ( var k = 0; k < 4; k ++ ) {

						rotations.push( rot[ k ] );

					}

					for ( var k = 0; k < 3; k ++ ) {

						pushInterpolation( pInterpolations, interpolation, k );

					}

					pushInterpolation( rInterpolations, interpolation, 3 );

				}

				if ( times.length === 0 ) continue;

				var boneName = '.bones[' + bone.name + ']';

				tracks.push( new THREE.MMDLoader.VectorKeyframeTrackEx( boneName + '.position', times, positions, pInterpolations ) );
				tracks.push( new THREE.MMDLoader.QuaternionKeyframeTrackEx( boneName + '.quaternion', times, rotations, rInterpolations ) );

			}

			var clip = new THREE.AnimationClip( name === undefined ? THREE.Math.generateUUID() : name, -1, tracks );

			if ( clip !== null ) {

				if ( mesh.geometry.animations === undefined ) mesh.geometry.animations = [];
				mesh.geometry.animations.push( clip );

			}

		};

		var initMorphAnimations = function () {

			if ( vmd.metadata.morphCount === 0 ) {

				return;

			}

			var orderedMorphs = helper.createOrderedMotionArrays( mesh.geometry.morphTargets, vmd.morphs, 'morphName' );

			var tracks = [];

			for ( var i = 0; i < orderedMorphs.length; i++ ) {

				var times = [];
				var values = [];
				var array = orderedMorphs[ i ];

				for ( var j = 0; j < array.length; j++ ) {

					times.push( array[ j ].frameNum / 30 );
					values.push( array[ j ].weight );

				}

				if ( times.length === 0 ) continue;

				tracks.push( new THREE.NumberKeyframeTrack( '.morphTargetInfluences[' + i + ']', times, values ) );

			}

			var clip = new THREE.AnimationClip( name === undefined ? THREE.Math.generateUUID() : name + 'Morph', -1, tracks );

			if ( clip !== null ) {

				if ( mesh.geometry.animations === undefined ) mesh.geometry.animations = [];
				mesh.geometry.animations.push( clip );

			}

		};

		this.leftToRightVmd( vmd );

		initMotionAnimations();
		initMorphAnimations();

	};

	THREE.MMDLoader.prototype.leftToRightModel = function ( model ) {

		if ( model.metadata.coordinateSystem === 'right' ) {

			return;

		}

		model.metadata.coordinateSystem = 'right';

		var helper = new THREE.MMDLoader.DataCreationHelper();

		for ( var i = 0; i < model.metadata.vertexCount; i++ ) {

			helper.leftToRightVector3( model.vertices[ i ].position );
			helper.leftToRightVector3( model.vertices[ i ].normal );

		}

		for ( var i = 0; i < model.metadata.faceCount; i++ ) {

			helper.leftToRightIndexOrder( model.faces[ i ].indices );

		}

		for ( var i = 0; i < model.metadata.boneCount; i++ ) {

			helper.leftToRightVector3( model.bones[ i ].position );

		}

		// TODO: support other morph for PMX
		for ( var i = 0; i < model.metadata.morphCount; i++ ) {

			var m = model.morphs[ i ];

			if ( model.metadata.format === 'pmx' && m.type !== 1 ) {

				// TODO: implement
				continue;

			}

			for ( var j = 0; j < m.elements.length; j++ ) {

				helper.leftToRightVector3( m.elements[ j ].position );

			}

		}

		for ( var i = 0; i < model.metadata.rigidBodyCount; i++ ) {

			helper.leftToRightVector3( model.rigidBodies[ i ].position );
			helper.leftToRightEuler( model.rigidBodies[ i ].rotation );

		}

		for ( var i = 0; i < model.metadata.constraintCount; i++ ) {

			helper.leftToRightVector3( model.constraints[ i ].position );
			helper.leftToRightEuler( model.constraints[ i ].rotation );
			helper.leftToRightVector3Range( model.constraints[ i ].translationLimitation1, model.constraints[ i ].translationLimitation2 );
			helper.leftToRightEulerRange( model.constraints[ i ].rotationLimitation1, model.constraints[ i ].rotationLimitation2 );

		}

	};

	THREE.MMDLoader.prototype.leftToRightVmd = function ( vmd ) {

		if ( vmd.metadata.coordinateSystem === 'right' ) {

			return;

		}

		vmd.metadata.coordinateSystem = 'right';

		var helper = new THREE.MMDLoader.DataCreationHelper();

		for ( var i = 0; i < vmd.metadata.motionCount; i++ ) {

			helper.leftToRightVector3( vmd.motions[ i ].position );
			helper.leftToRightQuaternion( vmd.motions[ i ].rotation );

		}

		for ( var i = 0; i < vmd.metadata.cameraCount; i++ ) {

			helper.leftToRightVector3( vmd.cameras[ i ].position );
			helper.leftToRightEuler( vmd.cameras[ i ].rotation );

		}

	};

	THREE.MMDLoader.prototype.leftToRightVpd = function ( vpd ) {

		if ( vpd.metadata.coordinateSystem === 'right' ) {

			return;

		}

		vpd.metadata.coordinateSystem = 'right';

		var helper = new THREE.MMDLoader.DataCreationHelper();

		for ( var i = 0; i < vpd.bones.length; i++ ) {

			helper.leftToRightVector3( vpd.bones[ i ].translation );
			helper.leftToRightQuaternion( vpd.bones[ i ].quaternion );

		}

	};

	THREE.MMDLoader.DataCreationHelper = function () {

	};

	THREE.MMDLoader.DataCreationHelper.prototype = {

		constructor: THREE.MMDLoader.Helper,

		leftToRightVector3: function ( v ) {

			v[ 2 ] = -v[ 2 ];

		},

		leftToRightQuaternion: function ( q ) {

			q[ 0 ] = -q[ 0 ];
			q[ 1 ] = -q[ 1 ];

		},

		leftToRightEuler: function ( r ) {

			r[ 0 ] = -r[ 0 ];
			r[ 1 ] = -r[ 1 ];

		},

		leftToRightIndexOrder: function ( p ) {

			var tmp = p[ 2 ];
			p[ 2 ] = p[ 0 ];
			p[ 0 ] = tmp;

		},

		leftToRightVector3Range: function ( v1, v2 ) {

			var tmp = -v2[ 2 ];
			v2[ 2 ] = -v1[ 2 ];
			v1[ 2 ] = tmp;

		},

		leftToRightEulerRange: function ( r1, r2 ) {

			var tmp1 = -r2[ 0 ];
			var tmp2 = -r2[ 1 ];
			r2[ 0 ] = -r1[ 0 ];
			r2[ 1 ] = -r1[ 1 ];
			r1[ 0 ] = tmp1;
			r1[ 1 ] = tmp2;

		},

		/*
	         * Note: Sometimes to use Japanese Unicode characters runs into problems in Three.js.
		 *       In such a case, use this method to convert it to Unicode hex charcode strings,
	         *       like 'あいう' -> '0x30420x30440x3046'
	         */
		toCharcodeStrings: function ( s ) {

			var str = '';

			for ( var i = 0; i < s.length; i++ ) {

				str += '0x' + ( '0000' + s[ i ].charCodeAt().toString( 16 ) ).substr( -4 );

			}

			return str;

		},

		createDictionary: function ( array ) {

			var dict = {};

			for ( var i = 0; i < array.length; i++ ) {

				dict[ array[ i ].name ] = i;

			}

			return dict;

		},

		initializeMotionArrays: function ( array ) {

			var result = [];

			for ( var i = 0; i < array.length; i++ ) {

				result[ i ] = [];

			}

			return result;

		},

		sortMotionArray: function ( array ) {

			array.sort( function ( a, b ) {

				return a.frameNum - b.frameNum;

			} ) ;

		},

		sortMotionArrays: function ( arrays ) {

			for ( var i = 0; i < arrays.length; i++ ) {

				this.sortMotionArray( arrays[ i ] );

			}

		},

		createMotionArray: function ( array ) {

			var result = [];

			for ( var i = 0; i < array.length; i++ ) {

				result.push( array[ i ] );

			}

			return result;

		},

		createMotionArrays: function ( array, result, dict, key ) {

			for ( var i = 0; i < array.length; i++ ) {

				var a = array[ i ];
				var num = dict[ a[ key ] ];

				if ( num === undefined ) {

					continue;

				}

				result[ num ].push( a );

			}

		},

		createOrderedMotionArray: function ( array ) {

			var result = this.createMotionArray( array );
			this.sortMotionArray( result );
			return result;

		},

		createOrderedMotionArrays: function ( targetArray, motionArray, key ) {

			var dict = this.createDictionary( targetArray );
			var result = this.initializeMotionArrays( targetArray );
			this.createMotionArrays( motionArray, result, dict, key );
			this.sortMotionArrays( result );

			return result;

		}

	};

	/*
	 * extends existing KeyframeTrack for bone and camera animation.
	 *   - use Float64Array for times
	 *   - use Cubic Bezier curves interpolation
	 */
	THREE.MMDLoader.VectorKeyframeTrackEx = function ( name, times, values, interpolationParameterArray ) {

		this.interpolationParameters = new Float32Array( interpolationParameterArray );

		THREE.VectorKeyframeTrack.call( this, name, times, values );

	};

	THREE.MMDLoader.VectorKeyframeTrackEx.prototype = Object.create( THREE.VectorKeyframeTrack.prototype );
	THREE.MMDLoader.VectorKeyframeTrackEx.prototype.constructor = THREE.MMDLoader.VectorKeyframeTrackEx;
	THREE.MMDLoader.VectorKeyframeTrackEx.prototype.TimeBufferType = Float64Array;

	THREE.MMDLoader.VectorKeyframeTrackEx.prototype.InterpolantFactoryMethodCubicBezier = function( result ) {

		return new THREE.MMDLoader.CubicBezierInterpolation( this.times, this.values, this.getValueSize(), result, this.interpolationParameters );

	};

	THREE.MMDLoader.VectorKeyframeTrackEx.prototype.setInterpolation = function( interpolation ) {

		this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;

	};

	THREE.MMDLoader.QuaternionKeyframeTrackEx = function ( name, times, values, interpolationParameterArray ) {

		this.interpolationParameters = new Float32Array( interpolationParameterArray );

		THREE.QuaternionKeyframeTrack.call( this, name, times, values );

	};

	THREE.MMDLoader.QuaternionKeyframeTrackEx.prototype = Object.create( THREE.QuaternionKeyframeTrack.prototype );
	THREE.MMDLoader.QuaternionKeyframeTrackEx.prototype.constructor = THREE.MMDLoader.QuaternionKeyframeTrackEx;
	THREE.MMDLoader.QuaternionKeyframeTrackEx.prototype.TimeBufferType = Float64Array;

	THREE.MMDLoader.QuaternionKeyframeTrackEx.prototype.InterpolantFactoryMethodCubicBezier = function( result ) {

		return new THREE.MMDLoader.CubicBezierInterpolation( this.times, this.values, this.getValueSize(), result, this.interpolationParameters );

	};

	THREE.MMDLoader.QuaternionKeyframeTrackEx.prototype.setInterpolation = function( interpolation ) {

		this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;

	};

	THREE.MMDLoader.NumberKeyframeTrackEx = function ( name, times, values, interpolationParameterArray ) {

		this.interpolationParameters = new Float32Array( interpolationParameterArray );

		THREE.NumberKeyframeTrack.call( this, name, times, values );

	};

	THREE.MMDLoader.NumberKeyframeTrackEx.prototype = Object.create( THREE.NumberKeyframeTrack.prototype );
	THREE.MMDLoader.NumberKeyframeTrackEx.prototype.constructor = THREE.MMDLoader.NumberKeyframeTrackEx;
	THREE.MMDLoader.NumberKeyframeTrackEx.prototype.TimeBufferType = Float64Array;

	THREE.MMDLoader.NumberKeyframeTrackEx.prototype.InterpolantFactoryMethodCubicBezier = function( result ) {

		return new THREE.MMDLoader.CubicBezierInterpolation( this.times, this.values, this.getValueSize(), result, this.interpolationParameters );

	};

	THREE.MMDLoader.NumberKeyframeTrackEx.prototype.setInterpolation = function( interpolation ) {

		this.createInterpolant = this.InterpolantFactoryMethodCubicBezier;

	};

	THREE.MMDLoader.CubicBezierInterpolation = function ( parameterPositions, sampleValues, sampleSize, resultBuffer, params ) {

		THREE.Interpolant.call( this, parameterPositions, sampleValues, sampleSize, resultBuffer );

		this.params = params;

	}

	THREE.MMDLoader.CubicBezierInterpolation.prototype = Object.create( THREE.LinearInterpolant.prototype );
	THREE.MMDLoader.CubicBezierInterpolation.prototype.constructor = THREE.MMDLoader.CubicBezierInterpolation;

	THREE.MMDLoader.CubicBezierInterpolation.prototype.interpolate_ = function( i1, t0, t, t1 ) {

		var result = this.resultBuffer;
		var values = this.sampleValues;
		var stride = this.valueSize;

		var offset1 = i1 * stride;
		var offset0 = offset1 - stride;

		var weight1 = ( t - t0 ) / ( t1 - t0 );

		if ( stride === 4 ) {  // Quaternion

			var x1 = this.params[ i1 * 4 + 0 ];
			var x2 = this.params[ i1 * 4 + 1 ];
			var y1 = this.params[ i1 * 4 + 2 ];
			var y2 = this.params[ i1 * 4 + 3 ];

			var ratio = this._calculate( x1, x2, y1, y2, weight1 );

			THREE.Quaternion.slerpFlat( result, 0, values, offset0, values, offset1, ratio );

		} else if ( stride === 3 ) {  // Vector3

			for ( var i = 0; i !== stride; ++ i ) {

				var x1 = this.params[ i1 * 12 + i * 4 + 0 ];
				var x2 = this.params[ i1 * 12 + i * 4 + 1 ];
				var y1 = this.params[ i1 * 12 + i * 4 + 2 ];
				var y2 = this.params[ i1 * 12 + i * 4 + 3 ];

				var ratio = this._calculate( x1, x2, y1, y2, weight1 );

				result[ i ] = values[ offset0 + i ] * ( 1 - ratio ) + values[ offset1 + i ] * ratio;

			}

		} else {  // Number

			var x1 = this.params[ i1 * 4 + 0 ];
			var x2 = this.params[ i1 * 4 + 1 ];
			var y1 = this.params[ i1 * 4 + 2 ];
			var y2 = this.params[ i1 * 4 + 3 ];

			var ratio = this._calculate( x1, x2, y1, y2, weight1 );

			result[ 0 ] = values[ offset0 ] * ( 1 - ratio ) + values[ offset1 ] * ratio;

		}

		return result;

	};

	THREE.MMDLoader.CubicBezierInterpolation.prototype._calculate = function( x1, x2, y1, y2, x ) {

		/*
		 * Cubic Bezier curves
		 *   https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B.C3.A9zier_curves
		 *
		 * B(t) = ( 1 - t ) ^ 3 * P0
		 *      + 3 * ( 1 - t ) ^ 2 * t * P1
		 *      + 3 * ( 1 - t ) * t^2 * P2
		 *      + t ^ 3 * P3
		 *      ( 0 <= t <= 1 )
		 *
		 * MMD uses Cubic Bezier curves for bone and camera animation interpolation.
		 *   http://d.hatena.ne.jp/edvakf/20111016/1318716097
		 *
		 *    x = ( 1 - t ) ^ 3 * x0
		 *      + 3 * ( 1 - t ) ^ 2 * t * x1
		 *      + 3 * ( 1 - t ) * t^2 * x2
		 *      + t ^ 3 * x3
		 *    y = ( 1 - t ) ^ 3 * y0
		 *      + 3 * ( 1 - t ) ^ 2 * t * y1
		 *      + 3 * ( 1 - t ) * t^2 * y2
		 *      + t ^ 3 * y3
		 *      ( x0 = 0, y0 = 0 )
		 *      ( x3 = 1, y3 = 1 )
		 *      ( 0 <= t, x1, x2, y1, y2 <= 1 )
		 *
		 * Here solves this equation with Bisection method,
		 *   https://en.wikipedia.org/wiki/Bisection_method
		 * gets t, and then calculate y.
		 *
		 * f(t) = 3 * ( 1 - t ) ^ 2 * t * x1
		 *      + 3 * ( 1 - t ) * t^2 * x2
		 *      + t ^ 3 - x = 0
		 *
		 * (Another option: Newton's method
		 *    https://en.wikipedia.org/wiki/Newton%27s_method)
		 */

		var c = 0.5;
		var t = c;
		var s = 1.0 - t;
		var loop = 15;
		var eps = 1e-5;
		var math = Math;

		var sst3, stt3, ttt;

		for ( var i = 0; i < loop; i ++ ) {

			sst3 = 3.0 * s * s * t;
			stt3 = 3.0 * s * t * t;
			ttt = t * t * t;

			var ft = ( sst3 * x1 ) + ( stt3 * x2 ) + ( ttt ) - x;

			if ( math.abs( ft ) < eps ) break;

			c /= 2.0;

			t += ( ft < 0 ) ? c : -c;
			s = 1.0 - t;

		}

		return ( sst3 * y1 ) + ( stt3 * y2 ) + ttt;

	};

	THREE.MMDLoader.DataView = function ( buffer, littleEndian ) {

		this.dv = new DataView( buffer );
		this.offset = 0;
		this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;
		this.encoder = new CharsetEncoder();

	};

	THREE.MMDLoader.DataView.prototype = {

		constructor: THREE.MMDLoader.DataView,

		getInt8: function () {

			var value = this.dv.getInt8( this.offset );
			this.offset += 1;
			return value;

		},

		getInt8Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i++ ) {

				a.push( this.getInt8() );

			}

			return a;

		},

		getUint8: function () {

			var value = this.dv.getUint8( this.offset );
			this.offset += 1;
			return value;

		},

		getUint8Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i++ ) {

				a.push( this.getUint8() );

			}

			return a;

		},


		getInt16: function () {

			var value = this.dv.getInt16( this.offset, this.littleEndian );
			this.offset += 2;
			return value;

		},

		getInt16Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i++ ) {

				a.push( this.getInt16() );

			}

			return a;

		},

		getUint16: function () {

			var value = this.dv.getUint16( this.offset, this.littleEndian );
			this.offset += 2;
			return value;

		},

		getUint16Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i++ ) {

				a.push( this.getUint16() );

			}

			return a;

		},

		getInt32: function () {

			var value = this.dv.getInt32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		getInt32Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i++ ) {

				a.push( this.getInt32() );

			}

			return a;

		},

		getUint32: function () {

			var value = this.dv.getUint32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		getUint32Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i++ ) {

				a.push( this.getUint32() );

			}

			return a;

		},

		getFloat32: function () {

			var value = this.dv.getFloat32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		getFloat32Array: function( size ) {

			var a = [];

			for ( var i = 0; i < size; i++ ) {

				a.push( this.getFloat32() );

			}

			return a;

		},

		getFloat64: function () {

			var value = this.dv.getFloat64( this.offset, this.littleEndian );
			this.offset += 8;
			return value;

		},

		getFloat64Array: function( size ) {

			var a = [];

			for ( var i = 0; i < size; i++ ) {

				a.push( this.getFloat64() );

			}

			return a;

		},

		getIndex: function ( type, isUnsigned ) {

			switch ( type ) {

				case 1:
					return ( isUnsigned === true ) ? this.getUint8() : this.getInt8();

				case 2:
					return ( isUnsigned === true ) ? this.getUint16() : this.getInt16();

				case 4:
					return this.getInt32(); // No Uint32

				default:
					throw 'unknown number type ' + type + ' exception.';

			}

		},

		getIndexArray: function ( type, size, isUnsigned ) {

			var a = [];

			for ( var i = 0; i < size; i++ ) {

				a.push( this.getIndex( type, isUnsigned ) );

			}

			return a;

		},

		getChars: function ( size ) {

			var str = '';

			while ( size > 0 ) {

				var value = this.getUint8();
				size--;

				if ( value === 0 ) {

					break;

				}

				str += String.fromCharCode( value );

			}

			while ( size > 0 ) {

				this.getUint8();
				size--;

			}

			return str;

		},

		getSjisStringsAsUnicode: function ( size ) {

			var a = [];

			while ( size > 0 ) {

				var value = this.getUint8();
				size--;

				if ( value === 0 ) {

					break;

				}

				a.push( value );

			}

			while ( size > 0 ) {

				this.getUint8();
				size--;

			}

			return this.encoder.s2u( new Uint8Array( a ) );

		},

		getUnicodeStrings: function ( size ) {

			var str = '';

			while ( size > 0 ) {

				var value = this.getUint16();
				size -= 2;

				if ( value === 0 ) {

					break;

				}

				str += String.fromCharCode( value );

			}

			while ( size > 0 ) {

				this.getUint8();
				size--;

			}

			return str;

		},

		getTextBuffer: function () {

			var size = this.getUint32();
			return this.getUnicodeStrings( size );

		}

	};

	/*
	 * Shaders are copied from MeshPhongMaterial and then MMD spcific codes are inserted.
	 * Keep shaders updated on MeshPhongMaterial.
	 */
	THREE.ShaderLib[ 'mmd' ] = {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.ShaderLib[ 'phong' ].uniforms,

			// MMD specific for toon mapping
			{
				"celShading"      : { type: "i", value: 0 },
				"toonMap"         : { type: "t", value: null },
				"hasToonTexture"  : { type: "i", value: 0 }
			}

		] ),

		vertexShader: THREE.ShaderLib[ 'phong' ].vertexShader,

		// put toon mapping logic right before "void main() {...}"
		fragmentShader: THREE.ShaderLib[ 'phong' ].fragmentShader.replace( /void\s+main\s*\(\s*\)/, [

			"	uniform bool celShading;",
			"	uniform sampler2D toonMap;",
			"	uniform bool hasToonTexture;",

			"	vec3 toon ( vec3 lightDirection, vec3 norm ) {",
			"		if ( ! hasToonTexture ) {",
			"			return vec3( 1.0 );",
			"		}",
			"		vec2 coord = vec2( 0.0, 0.5 * ( 1.0 - dot( lightDirection, norm ) ) );",
			"		return texture2D( toonMap, coord ).rgb;",
			"	}",

			// redefine for MMD
			"#undef RE_Direct",
			"void RE_Direct_BlinnMMD( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {",
			"	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );",
			"	vec3 irradiance = dotNL * directLight.color;",

			"	#ifndef PHYSICALLY_CORRECT_LIGHTS",

			"		irradiance *= PI; // punctual light",

			"	#endif",

			// ---- MMD specific for toon mapping
			"	if ( celShading ) {",
			"		reflectedLight.directDiffuse += material.diffuseColor * directLight.color * toon( directLight.direction, geometry.normal );",
			"	} else {",
			"		reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );",
			"	}",
			// ---- MMD specific for toon mapping

			"	reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;",
			"}",
			// ---- MMD specific for toon mapping
			"#define RE_Direct	RE_Direct_BlinnMMD",
			// ---- MMD specific for toon mapping

			"void main()",

		].join( "\n" ) )

	};

	THREE.MMDAudioManager = function ( audio, listener, p ) {

		var params = ( p === null || p === undefined ) ? {} : p;

		this.audio = audio;
		this.listener = listener;

		this.elapsedTime = 0.0;
		this.currentTime = 0.0;
		this.delayTime = params.delayTime !== undefined ? params.delayTime : 0.0;

		this.audioDuration = this.audio.source.buffer.duration;
		this.duration = this.audioDuration + this.delayTime;

	};

	THREE.MMDAudioManager.prototype = {

		constructor: THREE.MMDAudioManager,

		control: function ( delta ) {

			this.elapsed += delta;
			this.currentTime += delta;

			if ( this.checkIfStopAudio() ) {

				this.audio.stop();

			}

			if ( this.checkIfStartAudio() ) {

				this.audio.play();

			}

		},

		checkIfStartAudio: function () {

			if ( this.audio.isPlaying ) {

				return false;

			}

			while ( this.currentTime >= this.duration ) {

				this.currentTime -= this.duration;

			}

			if ( this.currentTime < this.delayTime ) {

				return false;

			}

			this.audio.startTime = this.currentTime - this.delayTime;

			return true;

		},

		checkIfStopAudio: function () {

			if ( ! this.audio.isPlaying ) {

				return false;

			}

			if ( this.currentTime >= this.duration ) {

				return true;

			}

			return false;

		}

	};

	THREE.MMDGrantSolver = function ( mesh ) {

		this.mesh = mesh;

	};

	THREE.MMDGrantSolver.prototype = {

		constructor: THREE.MMDGrantSolver,

		update: function () {

			var q = new THREE.Quaternion();

			return function () {

				for ( var i = 0; i < this.mesh.geometry.grants.length; i ++ ) {

					var g = this.mesh.geometry.grants[ i ];
					var b = this.mesh.skeleton.bones[ g.index ];
					var pb = this.mesh.skeleton.bones[ g.parentIndex ];

					if ( g.isLocal ) {

						// TODO: implement
						if ( g.affectPosition ) {

						}

						// TODO: implement
						if ( g.affectRotation ) {

						}

					} else {

						// TODO: implement
						if ( g.affectPosition ) {

						}

						if ( g.affectRotation ) {

							q.set( 0, 0, 0, 1 );
							q.slerp( pb.quaternion, g.ratio );
							b.quaternion.multiply( q );

						}

					}

				}

			};

		}()

	};

	THREE.MMDHelper = function ( renderer ) {

		this.renderer = renderer;

		this.outlineEffect = null;

		this.effect = null;

		this.autoClear = true;

		this.meshes = [];

		this.doAnimation = true;
		this.doIk = true;
		this.doGrant = true;
		this.doPhysics = true;
		this.doOutlineDrawing = true;
		this.doCameraAnimation = true;

		this.audioManager = null;
		this.camera = null;

		this.init();

	};

	THREE.MMDHelper.prototype = {

		constructor: THREE.MMDHelper,

		init: function () {

			this.outlineEffect = new THREE.OutlineEffect( this.renderer );

			var size = this.renderer.getSize();
			this.setSize( size.width, size.height );

		},

		add: function ( mesh ) {

			if ( ! ( mesh instanceof THREE.SkinnedMesh ) ) {

				throw new Error( 'THREE.MMDHelper.add() accepts only THREE.SkinnedMesh instance.' );

			}

			if ( mesh.mixer === undefined ) mesh.mixer = null;
			if ( mesh.ikSolver === undefined ) mesh.ikSolver = null;
			if ( mesh.grantSolver === undefined ) mesh.grantSolver = null;
			if ( mesh.physics === undefined ) mesh.physics = null;
			if ( mesh.looped === undefined ) mesh.looped = false;

			this.meshes.push( mesh );

			// workaround until I make IK and Physics Animation plugin
			this.initBackupBones( mesh );

		},

		setSize: function ( width, height ) {

			this.outlineEffect.setSize( width, height );

		},

		/*
		 * Note: There may be a possibility that Outline wouldn't work well with Effect.
		 *       In such a case, try to set doOutlineDrawing = false or
		 *       manually comment out renderer.clear() in *Effect.render().
		 */
		setEffect: function ( effect ) {

			this.effect = effect;

		},

		setAudio: function ( audio, listener, params ) {

			this.audioManager = new THREE.MMDAudioManager( audio, listener, params );

		},

		setCamera: function ( camera ) {

			camera.mixer = null;
			this.camera = camera;

		},

		setPhysicses: function ( params ) {

			for ( var i = 0; i < this.meshes.length; i++ ) {

				this.setPhysics( this.meshes[ i ], params );

			}

		},

		setPhysics: function ( mesh, params ) {

			if ( params === undefined ) params = {};

			var warmup = params.warmup !== undefined ? params.warmup : 60;

			var physics = new THREE.MMDPhysics( mesh, params );

			if ( mesh.mixer !== null && mesh.mixer !== undefined && this.doAnimation === true && params.preventAnimationWarmup !== false ) {

				this.animateOneMesh( 0, mesh );
				physics.reset();

			}

			physics.warmup( warmup );

			this.updateIKParametersDependingOnPhysicsEnabled( mesh, true );

			mesh.physics = physics;

		},

		enablePhysics: function ( enabled ) {

			if ( enabled === true ) {

				this.doPhysics = true;

			} else {

				this.doPhysics = false;

			}

			for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

				this.updateIKParametersDependingOnPhysicsEnabled( this.meshes[ i ], enabled );

			}

		},

		updateIKParametersDependingOnPhysicsEnabled: function ( mesh, physicsEnabled ) {

			var iks = mesh.geometry.iks;
			var bones = mesh.geometry.bones;

			for ( var j = 0, jl = iks.length; j < jl; j ++ ) {

				var ik = iks[ j ];
				var links = ik.links;

				for ( var k = 0, kl = links.length; k < kl; k ++ ) {

					var link = links[ k ];

					if ( physicsEnabled === true ) {

						// disable IK of the bone the corresponding rigidBody type of which is 1 or 2
						// because its rotation will be overriden by physics
						link.enabled = bones[ link.index ].rigidBodyType > 0 ? false : true;

					} else {

						link.enabled = true;

					}

				}

			}

		},

		setAnimations: function () {

			for ( var i = 0; i < this.meshes.length; i++ ) {

				this.setAnimation( this.meshes[ i ] );

			}

		},

		setAnimation: function ( mesh ) {

			if ( mesh.geometry.animations !== undefined ) {

				mesh.mixer = new THREE.AnimationMixer( mesh );

				// TODO: find a workaround not to access (seems like) private properties
				//       the name of them begins with "_".
				mesh.mixer.addEventListener( 'loop', function ( e ) {

					if ( e.action._clip.tracks[ 0 ].name.indexOf( '.bones' ) !== 0 ) return;

					var mesh = e.target._root;
					mesh.looped = true;

				} );

				var foundAnimation = false;
				var foundMorphAnimation = false;

				for ( var i = 0; i < mesh.geometry.animations.length; i++ ) {

					var clip = mesh.geometry.animations[ i ];

					var action = mesh.mixer.clipAction( clip );

					if ( clip.tracks[ 0 ].name.indexOf( '.morphTargetInfluences' ) === 0 ) {

						if ( ! foundMorphAnimation ) {

							action.play();
							foundMorphAnimation = true;

						}

					} else {

						if ( ! foundAnimation ) {

							action.play();
							foundAnimation = true;

						}

					}

				}

				if ( foundAnimation ) {

					mesh.ikSolver = new THREE.CCDIKSolver( mesh );

					if ( mesh.geometry.grants !== undefined ) {

						mesh.grantSolver = new THREE.MMDGrantSolver( mesh );

					}

				}

			}

		},

		setCameraAnimation: function ( camera ) {

			if ( camera.animations !== undefined ) {

				camera.mixer = new THREE.AnimationMixer( camera );
				camera.mixer.clipAction( camera.animations[ 0 ] ).play();

			}

		},

		/*
		 * detect the longest duration among model, camera, and audio animations and then
		 * set it to them to sync.
		 * TODO: touching private properties ( ._actions and ._clip ) so consider better way
		 *       to access them for safe and modularity.
		 */
		unifyAnimationDuration: function ( params ) {

			params = params === undefined ? {} : params;

			var max = 0.0;

			var camera = this.camera;
			var audioManager = this.audioManager;

			// check the longest duration
			for ( var i = 0; i < this.meshes.length; i++ ) {

				var mesh = this.meshes[ i ];
				var mixer = mesh.mixer;

				if ( mixer === null ) {

					continue;

				}

				for ( var j = 0; j < mixer._actions.length; j++ ) {

					var action = mixer._actions[ j ];
					max = Math.max( max, action._clip.duration );

				}

			}

			if ( camera !== null && camera.mixer !== null ) {

				var mixer = camera.mixer;

				for ( var i = 0; i < mixer._actions.length; i++ ) {

					var action = mixer._actions[ i ];
					max = Math.max( max, action._clip.duration );

				}

			}

			if ( audioManager !== null ) {

				max = Math.max( max, audioManager.duration );

			}

			if ( params.afterglow !== undefined ) {

				max += params.afterglow;

			}

			// set the duration
			for ( var i = 0; i < this.meshes.length; i++ ) {

				var mesh = this.meshes[ i ];
				var mixer = mesh.mixer;

				if ( mixer === null ) {

					continue;

				}

				for ( var j = 0; j < mixer._actions.length; j++ ) {

					var action = mixer._actions[ j ];
					action._clip.duration = max;

				}

			}

			if ( camera !== null && camera.mixer !== null ) {

				var mixer = camera.mixer;

				for ( var i = 0; i < mixer._actions.length; i++ ) {

					var action = mixer._actions[ i ];
					action._clip.duration = max;

				}

			}

			if ( audioManager !== null ) {

				audioManager.duration = max;

			}

		},

		controlAudio: function ( delta ) {

			if ( this.audioManager === null ) {

				return;

			}

			this.audioManager.control( delta );

		},

		animate: function ( delta ) {

			this.controlAudio( delta );

			for ( var i = 0; i < this.meshes.length; i++ ) {

				this.animateOneMesh( delta, this.meshes[ i ] );

			}

			this.animateCamera( delta );

		},

		animateOneMesh: function ( delta, mesh ) {

			var mixer = mesh.mixer;
			var ikSolver = mesh.ikSolver;
			var grantSolver = mesh.grantSolver;
			var physics = mesh.physics;

			if ( mixer !== null && this.doAnimation === true ) {

				// restore/backupBones are workaround
				// until I make IK, Grant, and Physics Animation plugin
				this.restoreBones( mesh );

				mixer.update( delta );

				this.backupBones( mesh );

			}

			if ( ikSolver !== null && this.doIk === true ) {

				ikSolver.update();

			}

			if ( grantSolver !== null && this.doGrant === true ) {

				grantSolver.update();

			}

			if ( mesh.looped === true ) {

				if ( physics !== null ) physics.reset();

				mesh.looped = false;

			}

			if ( physics !== null && this.doPhysics === true ) {

				physics.update( delta );

			}

		},

		animateCamera: function ( delta ) {

			if ( this.camera === null ) {

				return;

			}

			var mixer = this.camera.mixer;

			if ( mixer !== null && this.camera.center !== undefined && this.doCameraAnimation === true ) {

				mixer.update( delta );

				// TODO: Let PerspectiveCamera automatically update?
				this.camera.updateProjectionMatrix();

				this.camera.up.set( 0, 1, 0 );
				this.camera.up.applyQuaternion( this.camera.quaternion );
				this.camera.lookAt( this.camera.center );

			}

		},

		render: function ( scene, camera ) {

			if ( this.effect === null ) {

				if ( this.doOutlineDrawing ) {

					this.outlineEffect.autoClear = this.autoClear;
					this.outlineEffect.render( scene, camera );

				} else {

					var currentAutoClear = this.renderer.autoClear;
					this.renderer.autoClear = this.autoClear;
					this.renderer.render( scene, camera );
					this.renderer.autoClear = currentAutoClear;

				}

			} else {

				var currentAutoClear = this.renderer.autoClear;
				this.renderer.autoClear = this.autoClear;

				if ( this.doOutlineDrawing ) {

					this.renderWithEffectAndOutline( scene, camera );

				} else {

					this.effect.render( scene, camera );

				}

				this.renderer.autoClear = currentAutoClear;

			}

		},

		/*
		 * Currently(r82 dev) there's no way to render with two Effects
		 * then attempt to get them to coordinately run by myself.
		 *
		 * What this method does
		 * 1. let OutlineEffect make outline materials (only once)
		 * 2. render normally with effect
		 * 3. set outline materials
		 * 4. render outline with effect
		 * 5. restore original materials
		 */
		renderWithEffectAndOutline: function ( scene, camera ) {

			var hasOutlineMaterial = false;

			function checkIfObjectHasOutlineMaterial ( object ) {

				if ( object.material === undefined ) return;

				if ( object.userData.outlineMaterial !== undefined ) hasOutlineMaterial = true;

			}

			function setOutlineMaterial ( object ) {

				if ( object.material === undefined ) return;

				if ( object.userData.outlineMaterial === undefined ) return;

				object.userData.originalMaterial = object.material;

				object.material = object.userData.outlineMaterial;

			}

			function restoreOriginalMaterial ( object ) {

				if ( object.material === undefined ) return;

				if ( object.userData.originalMaterial === undefined ) return;

				object.material = object.userData.originalMaterial;

			}

			return function renderWithEffectAndOutline( scene, camera ) {

				hasOutlineMaterial = false;

				var forceClear = false;

				scene.traverse( checkIfObjectHasOutlineMaterial );

				if ( ! hasOutlineMaterial ) {

					this.outlineEffect.render( scene, camera );

					forceClear = true;

					scene.traverse( checkIfObjectHasOutlineMaterial );

				}

				if ( hasOutlineMaterial ) {

					this.renderer.autoClear = this.autoClear || forceClear;

					this.effect.render( scene, camera );

					scene.traverse( setOutlineMaterial );

					var currentShadowMapEnabled = this.renderer.shadowMap.enabled;

					this.renderer.autoClear = false;
					this.renderer.shadowMap.enabled = false;

					this.effect.render( scene, camera );

					this.renderer.shadowMap.enabled = currentShadowMapEnabled;

					scene.traverse( restoreOriginalMaterial );

				} else {

					this.outlineEffect.autoClear = this.autoClear || forceClear;
					this.outlineEffect.render( scene, camera );

				}

			}

		}(),

		poseAsVpd: function ( mesh, vpd, params ) {

			if ( ! ( params && params.preventResetPose === true ) ) {

				mesh.pose();

			}

			var bones = mesh.skeleton.bones;
			var bones2 = vpd.bones;

			var table = {};

			for ( var i = 0; i < bones.length; i++ ) {

				var b = bones[ i ];
				table[ b.name ] = i;

			}

			var thV = new THREE.Vector3();
			var thQ = new THREE.Quaternion();

			for ( var i = 0; i < bones2.length; i++ ) {

				var b = bones2[ i ];
				var index = table[ b.name ];

				if ( index === undefined ) {

					continue;

				}

				var b2 = bones[ index ];
				var t = b.translation;
				var q = b.quaternion;

				thV.set( t[ 0 ], t[ 1 ], t[ 2 ] );
				thQ.set( q[ 0 ], q[ 1 ], q[ 2 ], q[ 3 ] );

				b2.position.add( thV );
				b2.quaternion.multiply( thQ );

				b2.updateMatrixWorld( true );

			}

			if ( params === undefined || params.preventIk !== true ) {

				var solver = new THREE.CCDIKSolver( mesh );
				solver.update();

			}

			if ( params === undefined || params.preventGrant !== true ) {

				if ( mesh.geometry.grants !== undefined ) {

					var solver = new THREE.MMDGrantSolver( mesh );
					solver.update();

				}

			}

		},

		/*
		 * Note: These following three functions are workaround for r74dev.
		 *       THREE.PropertyMixer.apply() seems to save values into buffer cache
		 *       when mixer.update() is called.
		 *       ikSolver.update() and physics.update() change bone position/quaternion
		 *       without mixer.update() then buffer cache will be inconsistent.
		 *       So trying to avoid buffer cache inconsistency by doing
		 *       backup bones position/quaternion right after mixer.update() call
		 *       and then restore them after rendering.
		 */
		initBackupBones: function ( mesh ) {

			mesh.skeleton.backupBones = [];

			for ( var i = 0; i < mesh.skeleton.bones.length; i++ ) {

				mesh.skeleton.backupBones.push( mesh.skeleton.bones[ i ].clone() );

			}

		},

		backupBones: function ( mesh ) {

			mesh.skeleton.backupBoneIsSaved = true;

			for ( var i = 0; i < mesh.skeleton.bones.length; i++ ) {

				var b = mesh.skeleton.backupBones[ i ];
				var b2 = mesh.skeleton.bones[ i ];
				b.position.copy( b2.position );
				b.quaternion.copy( b2.quaternion );

			}

		},

		restoreBones: function ( mesh ) {

			if ( mesh.skeleton.backupBoneIsSaved !== true ) {

				return;

			}

			mesh.skeleton.backupBoneIsSaved = false;

			for ( var i = 0; i < mesh.skeleton.bones.length; i++ ) {

				var b = mesh.skeleton.bones[ i ];
				var b2 = mesh.skeleton.backupBones[ i ];
				b.position.copy( b2.position );
				b.quaternion.copy( b2.quaternion );

			}

		}

	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * @author takahirox / http://github.com/takahirox/
	 *
	 * Reference: https://en.wikipedia.org/wiki/Cel_shading
	 *
	 * // How to set default outline parameters
	 * new THREE.OutlineEffect( renderer, {
	 * 	defaultThickNess: 0.01,
	 * 	defaultColor: new THREE.Color( 0x888888 ),
	 * 	defaultAlpha: 0.8,
	 * 	defaultKeepAlive: true // keeps outline material in cache even if material is removed from scene
	 * } );
	 *
	 * // How to set outline parameters for each material
	 * material.outlineParameters = {
	 * 	thickNess: 0.01,                     // this paremeter won't work for MultiMaterial
	 * 	color: new THREE.Color( 0x888888 ),  // this paremeter won't work for MultiMaterial
	 * 	alpha: 0.8,                          // this paremeter won't work for MultiMaterial
	 * 	visible: true,
	 * 	keepAlive: true  // this paremeter won't work for Material in materials of MultiMaterial
	 * };
	 *
	 * TODO
	 *  - support shader material without objectNormal in its vertexShader
	 */

	THREE.OutlineEffect = function ( renderer, parameters ) {

		var _this = this;

		parameters = parameters || {};

		this.autoClear = parameters.autoClear !== undefined ? parameters.autoClear : true;

		var defaultThickness = parameters.defaultThickness !== undefined ? parameters.defaultThickness : 0.003;
		var defaultColor = parameters.defaultColor !== undefined ? parameters.defaultColor : new THREE.Color( 0x000000 );
		var defaultAlpha = parameters.defaultAlpha !== undefined ? parameters.defaultAlpha : 1.0;
		var defaultKeepAlive = parameters.defaultKeepAlive !== undefined ? parameters.defaultKeepAlive : false;

		// object.material.uuid -> outlineMaterial
		// (no mapping from children of MultiMaterial)
		// save at the outline material creation and release
		// if it's unused removeThresholdCount frames
		// unless keepAlive is true.
		var cache = {};

		var removeThresholdCount = 60;

		// outlineMaterial.uuid (or object.uuid for invisibleMaterial) -> originalMaterial
		// including children of MultiMaterial.
		// save before render and release after render.
		var originalMaterials = {};

		// object.uuid -> originalOnBeforeRender
		// save before render and release after render.
		var originalOnBeforeRenders = {};

		//this.cache = cache;  // for debug

		var invisibleMaterial = new THREE.ShaderMaterial( { visible: false } );

		// copied from WebGLPrograms and removed some materials
		var shaderIDs = {
			MeshBasicMaterial: 'basic',
			MeshLambertMaterial: 'lambert',
			MeshPhongMaterial: 'phong',
			MeshStandardMaterial: 'physical',
			MeshPhysicalMaterial: 'physical'
		};

		var uniformsChunk = {
			outlineThickness: { type: "f", value: defaultThickness },
			outlineColor: { type: "c", value: defaultColor },
			outlineAlpha: { type: "f", value: defaultAlpha }
		};

		var vertexShaderChunk = [

			"uniform float outlineThickness;",

			"vec4 calculateOutline( vec4 pos, vec3 objectNormal, vec4 skinned ) {",

			"	float thickness = outlineThickness;",
			"	float ratio = 1.0;", // TODO: support outline thickness ratio for each vertex
			"	vec4 pos2 = projectionMatrix * modelViewMatrix * vec4( skinned.xyz + objectNormal, 1.0 );",
			// NOTE: subtract pos2 from pos because BackSide objectNormal is negative
			"	vec4 norm = normalize( pos - pos2 );",
			"	return pos + norm * thickness * pos.w * ratio;",

			"}",

		].join( "\n" );

		var vertexShaderChunk2 = [

			"#if ! defined( LAMBERT ) && ! defined( PHONG ) && ! defined( PHYSICAL )",

			"	#ifndef USE_ENVMAP",
			"		vec3 objectNormal = normalize( normal );",

			"		#ifdef FLIP_SIDED",
			"			objectNormal = -objectNormal;",
			"		#endif",

			"	#endif",

			"#endif",

			"#ifdef USE_SKINNING",
			"	gl_Position = calculateOutline( gl_Position, objectNormal, skinned );",
			"#else",
			"	gl_Position = calculateOutline( gl_Position, objectNormal, vec4( transformed, 1.0 ) );",
			"#endif",

		].join( "\n" );

		var fragmentShader = [

			"#include <common>",
			"#include <fog_pars_fragment>",

			"uniform vec3 outlineColor;",
			"uniform float outlineAlpha;",

			"void main() {",

			"	gl_FragColor = vec4( outlineColor, outlineAlpha );",

			"	#include <fog_fragment>",

			"}",

		].join( "\n" );

		function createMaterial( originalMaterial ) {

			var shaderID = shaderIDs[ originalMaterial.type ];
			var originalUniforms, originalVertexShader;
			var outlineParameters = originalMaterial.outlineParameters;

			if ( shaderID !== undefined ) {

				var shader = THREE.ShaderLib[ shaderID ];
				originalUniforms = shader.uniforms;
				originalVertexShader = shader.vertexShader;

			} else if ( originalMaterial.isShaderMaterial === true ) {

				originalUniforms = originalMaterial.uniforms;
				originalVertexShader = originalMaterial.vertexShader;

			} else {

				return invisibleMaterial;

			}

			var uniforms = Object.assign( {}, originalUniforms, uniformsChunk );

			var vertexShader = originalVertexShader
						// put vertexShaderChunk right before "void main() {...}"
						.replace( /void\s+main\s*\(\s*\)/, vertexShaderChunk + '\nvoid main()' )
						// put vertexShaderChunk2 the end of "void main() {...}"
						// Note: here assums originalVertexShader ends with "}" of "void main() {...}"
						.replace( /\}\s*$/, vertexShaderChunk2 + '\n}' )
						// remove any light related lines
						// Note: here is very sensitive to originalVertexShader
						// TODO: consider safer way
						.replace( /#include\s+<[\w_]*light[\w_]*>/g, '' );

			var material = new THREE.ShaderMaterial( {
				uniforms: uniforms,
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				side: THREE.BackSide,
				//wireframe: true,
				skinning: false,
				morphTargets: false,
				morphNormals: false,
				fog: false
			} );

			return material;

		}

		function createMultiMaterial( originalMaterial ) {

			var materials = [];

			for ( var i = 0, il = originalMaterial.materials.length; i < il; i ++ ) {

				materials.push( createMaterial( originalMaterial.materials[ i ] ) );

			}

			return new THREE.MultiMaterial( materials );

		}

		function setOutlineMaterial( object ) {

			if ( object.material === undefined ) return;

			var data = cache[ object.material.uuid ];

			if ( data === undefined ) {

				data = {
					material: object.material.isMultiMaterial === true ? createMultiMaterial( object.material ) : createMaterial( object.material ),
					used: true,
					keepAlive: defaultKeepAlive,
					count: 0
				};

				cache[ object.material.uuid ] = data;

			}

			var outlineMaterial = data.material;
			data.used = true;

			var uuid= outlineMaterial !== invisibleMaterial ? outlineMaterial.uuid : object.uuid;
			originalMaterials[ uuid ] = object.material;

			if ( object.material.isMultiMaterial === true ) {

				for ( var i = 0, il = object.material.materials.length; i < il; i ++ ) {

					// originalMaterial of leaf material of MultiMaterial is used only for
					// updating outlineMaterial. so need not to save for invisibleMaterial.
					if ( outlineMaterial.materials[ i ] !== invisibleMaterial ) {

						originalMaterials[ outlineMaterial.materials[ i ].uuid ] = object.material.materials[ i ];

					}

				}

				updateOutlineMultiMaterial( outlineMaterial, object.material );

			} else {

				updateOutlineMaterial( outlineMaterial, object.material );

			}

			object.material = outlineMaterial;

			originalOnBeforeRenders[ object.uuid ] = object.onBeforeRender;
			object.onBeforeRender = onBeforeRender;

		}

		function restoreOriginalMaterial( object ) {

			if ( object.material === undefined ) return;

			var originalMaterial = originalMaterials[ object.material.uuid ]

			if ( originalMaterial === undefined ) {

				originalMaterial = originalMaterials[ object.uuid ]

				if ( originalMaterial === undefined ) return;

			}

			object.material = originalMaterial;
			object.onBeforeRender = originalOnBeforeRenders[ object.uuid ];

		}

		function onBeforeRender( renderer, scene, camera, geometry, material, group ) {

			// check some things before updating just in case

			if ( material === invisibleMaterial ) return;

			if ( material.isMultiMaterial === true ) return;

			var originalMaterial = originalMaterials[ material.uuid ];

			if ( originalMaterial === undefined ) return;

			updateUniforms( material, originalMaterial );

		}

		function updateUniforms( material, originalMaterial ) {

			var outlineParameters = originalMaterial.outlineParameters;

			material.uniforms.outlineAlpha.value = originalMaterial.opacity;

			if ( outlineParameters !== undefined ) {

				if ( outlineParameters.thickness !== undefined ) material.uniforms.outlineThickness.value = outlineParameters.thickness;
				if ( outlineParameters.color !== undefined ) material.uniforms.outlineColor.value.copy( outlineParameters.color );
				if ( outlineParameters.alpha !== undefined ) material.uniforms.outlineAlpha.value = outlineParameters.alpha;

			}

		}

		function updateOutlineMaterial( material, originalMaterial ) {

			if ( material === invisibleMaterial ) return;

			var outlineParameters = originalMaterial.outlineParameters;

			material.skinning = originalMaterial.skinning;
			material.morphTargets = originalMaterial.morphTargets;
			material.morphNormals = originalMaterial.morphNormals;
			material.fog = originalMaterial.fog;

			if ( outlineParameters !== undefined ) {

				if ( originalMaterial.visible === false ) {

					material.visible = false;

				} else {

					material.visible = ( outlineParameters.visible !== undefined ) ? outlineParameters.visible : true;

				}

				material.transparent = ( outlineParameters.alpha !== undefined && outlineParameters.alpha < 1.0 ) ? true : originalMaterial.transparent;

				// cache[ originalMaterial.uuid ] is undefined if originalMaterial is in materials of MultiMaterial
				if ( outlineParameters.keepAlive !== undefined && cache[ originalMaterial.uuid ] !== undefined ) cache[ originalMaterial.uuid ].keepAlive = outlineParameters.keepAlive;

			} else {

				material.transparent = originalMaterial.transparent;
				material.visible = originalMaterial.visible;

			}

			if ( originalMaterial.wireframe === true || originalMaterial.depthTest === false ) material.visible = false;

		}

		function updateOutlineMultiMaterial( material, originalMaterial ) {

			if ( material === invisibleMaterial ) return;

			var outlineParameters = originalMaterial.outlineParameters;

			if ( outlineParameters !== undefined ) {

				if ( originalMaterial.visible === false ) {

					material.visible = false;

				} else {

					material.visible = ( outlineParameters.visible !== undefined ) ? outlineParameters.visible : true;

				}

				if ( outlineParameters.keepAlive !== undefined ) cache[ originalMaterial.uuid ].keepAlive = outlineParameters.keepAlive;

			} else {

				material.visible = originalMaterial.visible;

			}

			for ( var i = 0, il = material.materials.length; i < il; i ++ ) {

				updateOutlineMaterial( material.materials[ i ], originalMaterial.materials[ i ] );

			}

		}

		function cleanupCache() {

			var keys;

			// clear originialMaterials
			keys = Object.keys( originalMaterials );

			for ( var i = 0, il = keys.length; i < il; i ++ ) {

				originalMaterials[ keys[ i ] ] = undefined;

			}

			// clear originalOnBeforeRenders
			keys = Object.keys( originalOnBeforeRenders );

			for ( var i = 0, il = keys.length; i < il; i ++ ) {

				originalOnBeforeRenders[ keys[ i ] ] = undefined;

			}

			// remove unused outlineMaterial from cache
			keys = Object.keys( cache );

			for ( var i = 0, il = keys.length; i < il; i ++ ) {

				var key = keys[ i ];

				if ( cache[ key ].used === false ) {

					cache[ key ].count++;

					if ( cache[ key ].keepAlive === false && cache[ key ].count > removeThresholdCount ) {

						delete cache[ key ];

					}

				} else {

					cache[ key ].used = false;
					cache[ key ].count = 0;

				}

			}

		}

		this.setSize = function ( width, height ) {

			renderer.setSize( width, height );

		};

		this.render = function ( scene, camera, renderTarget, forceClear ) {

			var currentAutoClear = renderer.autoClear;
			renderer.autoClear = this.autoClear;

			// 1. render normally
			renderer.render( scene, camera, renderTarget, forceClear );

			// 2. render outline
			var currentSceneAutoUpdate = scene.autoUpdate;
			var currentSceneBackground = scene.background;
			var currentShadowMapEnabled = renderer.shadowMap.enabled;

			scene.autoUpdate = false;
			scene.background = null;
			renderer.autoClear = false;
			renderer.shadowMap.enabled = false;

			scene.traverse( setOutlineMaterial );

			renderer.render( scene, camera, renderTarget );

			scene.traverse( restoreOriginalMaterial );

			cleanupCache();

			scene.autoUpdate = currentSceneAutoUpdate;
			scene.background = currentSceneBackground;
			renderer.autoClear = currentAutoClear;
			renderer.shadowMap.enabled = currentShadowMapEnabled;

		};

	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * @author takahiro / https://github.com/takahirox
	 *
	 * CCD Algorithm
	 *  https://sites.google.com/site/auraliusproject/ccd-algorithm
	 *
	 * mesh.geometry needs to have iks array.
	 *
	 * // ik parameter example
	 * //
	 * // target, effector, index in links are bone index in skeleton.
	 * // the bones relation should be
	 * // <-- parent                                  child -->
	 * // links[ n ], links[ n - 1 ], ..., links[ 0 ], effector
	 * ik = {
	 *	target: 1,
	 *	effector: 2,
	 *	links: [ { index: 5, limitation: new THREE.Vector3( 1, 0, 0 ) }, { index: 4, enabled: false }, { index : 3 } ],
	 *	iteration: 10,
	 *	minAngle: 0.0,
	 *	maxAngle: 1.0,
	 * };
	 */

	THREE.CCDIKSolver = function ( mesh ) {

		this.mesh = mesh;

		this._valid();

	};

	THREE.CCDIKSolver.prototype = {

		constructor: THREE.CCDIKSolver,

		_valid: function () {

			var iks = this.mesh.geometry.iks;
			var bones = this.mesh.skeleton.bones;

			for ( var i = 0, il = iks.length; i < il; i ++ ) {

				var ik = iks[ i ];

				var effector = bones[ ik.effector ];

				var links = ik.links;

				var link0, link1;

				link0 = effector;

				for ( var j = 0, jl = links.length; j < jl; j ++ ) {

					link1 = bones[ links[ j ].index ];

					if ( link0.parent !== link1 ) {

						console.warn( 'THREE.CCDIKSolver: bone ' + link0.name + ' is not the child of bone ' + link1.name );

					}

					link0 = link1;

				}

			}

		},

		update: function () {

			var q = new THREE.Quaternion();

			var targetPos = new THREE.Vector3();
			var targetVec = new THREE.Vector3();
			var effectorPos = new THREE.Vector3();
			var effectorVec = new THREE.Vector3();
			var linkPos = new THREE.Vector3();
			var invLinkQ = new THREE.Quaternion();
			var axis = new THREE.Vector3();

			var bones = this.mesh.skeleton.bones;
			var iks = this.mesh.geometry.iks;

			var boneParams = this.mesh.geometry.bones;

			// for reference overhead reduction in loop
			var math = Math;

			this.mesh.updateMatrixWorld( true );

			for ( var i = 0, il = iks.length; i < il; i++ ) {

				var ik = iks[ i ];
				var effector = bones[ ik.effector ];
				var target = bones[ ik.target ];

				// don't use getWorldPosition() here for the performance
				// because it calls updateMatrixWorld( true ) inside.
				targetPos.setFromMatrixPosition( target.matrixWorld );

				var links = ik.links;
				var iteration = ik.iteration !== undefined ? ik.iteration : 1;

				for ( var j = 0; j < iteration; j++ ) {

					var rotated = false;

					for ( var k = 0, kl = links.length; k < kl; k++ ) {

						var link = bones[ links[ k ].index ];

						// skip this link and following links.
						// this skip is used for MMD performance optimization.
						if ( links[ k ].enabled === false ) break;

						var limitation = links[ k ].limitation;

						// don't use getWorldPosition/Quaternion() here for the performance
						// because they call updateMatrixWorld( true ) inside.
						linkPos.setFromMatrixPosition( link.matrixWorld );
						invLinkQ.setFromRotationMatrix( link.matrixWorld ).inverse();
						effectorPos.setFromMatrixPosition( effector.matrixWorld );

						// work in link world
						effectorVec.subVectors( effectorPos, linkPos );
						effectorVec.applyQuaternion( invLinkQ );
						effectorVec.normalize();

						targetVec.subVectors( targetPos, linkPos );
						targetVec.applyQuaternion( invLinkQ );
						targetVec.normalize();

						var angle = targetVec.dot( effectorVec );

						if ( angle > 1.0 ) {

							angle = 1.0;

						} else if ( angle < -1.0 ) {

							angle = -1.0;

						}

						angle = math.acos( angle );

						// skip if changing angle is too small to prevent vibration of bone
						// Refer to http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mmd.three.js
						if ( angle < 1e-5 ) continue;

						if ( ik.minAngle !== undefined && angle < ik.minAngle ) {

							angle = ik.minAngle;

						}

						if ( ik.maxAngle !== undefined && angle > ik.maxAngle ) {

							angle = ik.maxAngle;

						}

						axis.crossVectors( effectorVec, targetVec );
						axis.normalize();

						q.setFromAxisAngle( axis, angle );
						link.quaternion.multiply( q );

						// TODO: re-consider the limitation specification
						if ( limitation !== undefined ) {

							var c = link.quaternion.w;

							if ( c > 1.0 ) {

								c = 1.0;

							}

							var c2 = math.sqrt( 1 - c * c );
							link.quaternion.set( limitation.x * c2,
							                     limitation.y * c2,
							                     limitation.z * c2,
							                     c );

						}

						link.updateMatrixWorld( true );
						rotated = true;

					}

					if ( ! rotated ) break;

				}

			}

			// just in case
			this.mesh.updateMatrixWorld( true );

		}

	};


	THREE.CCDIKHelper = function ( mesh ) {

		if ( mesh.geometry.iks === undefined || mesh.skeleton === undefined ) {

			throw 'THREE.CCDIKHelper requires iks in mesh.geometry and skeleton in mesh.';

		}

		THREE.Object3D.call( this );

		this.root = mesh;

		this.matrix = mesh.matrixWorld;
		this.matrixAutoUpdate = false;

		this.sphereGeometry = new THREE.SphereBufferGeometry( 0.25, 16, 8 );

		this.targetSphereMaterial = new THREE.MeshBasicMaterial( {
			color: new THREE.Color( 0xff8888 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this.effectorSphereMaterial = new THREE.MeshBasicMaterial( {
			color: new THREE.Color( 0x88ff88 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this.linkSphereMaterial = new THREE.MeshBasicMaterial( {
			color: new THREE.Color( 0x8888ff ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this.lineMaterial = new THREE.LineBasicMaterial( {
			color: new THREE.Color( 0xff0000 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this._init();
		this.update();

	};

	THREE.CCDIKHelper.prototype = Object.create( THREE.Object3D.prototype );
	THREE.CCDIKHelper.prototype.constructor = THREE.CCDIKHelper;

	THREE.CCDIKHelper.prototype._init = function () {

		var self = this;
		var mesh = this.root;
		var iks = mesh.geometry.iks;

		function createLineGeometry( ik ) {

			var geometry = new THREE.BufferGeometry();
			var vertices = new Float32Array( ( 2 + ik.links.length ) * 3 );
			geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

			return geometry;

		}

		function createTargetMesh() {

			return new THREE.Mesh( self.sphereGeometry, self.targetSphereMaterial );

		}

		function createEffectorMesh() {

			return new THREE.Mesh( self.sphereGeometry, self.effectorSphereMaterial );

		}

		function createLinkMesh() {

			return new THREE.Mesh( self.sphereGeometry, self.linkSphereMaterial );

		}

		function createLine( ik ) {

			return new THREE.Line( createLineGeometry( ik ), self.lineMaterial );

		}

		for ( var i = 0, il = iks.length; i < il; i ++ ) {

			var ik = iks[ i ];

			this.add( createTargetMesh() );
			this.add( createEffectorMesh() );

			for ( var j = 0, jl = ik.links.length; j < jl; j ++ ) {

				this.add( createLinkMesh() );

			}

			this.add( createLine( ik ) );

		}

	};

	THREE.CCDIKHelper.prototype.update = function () {

		var offset = 0;

		var mesh = this.root;
		var iks = mesh.geometry.iks;
		var bones = mesh.skeleton.bones;

		var matrixWorldInv = new THREE.Matrix4().getInverse( mesh.matrixWorld );
		var vector = new THREE.Vector3();

		function getPosition( bone ) {

			vector.setFromMatrixPosition( bone.matrixWorld );
			vector.applyMatrix4( matrixWorldInv );

			return vector;

		}

		function setPositionOfBoneToAttributeArray( array, index, bone ) {

			var v = getPosition( bone );

			array[ index * 3 + 0 ] = v.x;
			array[ index * 3 + 1 ] = v.y;
			array[ index * 3 + 2 ] = v.z;

		}

		for ( var i = 0, il = iks.length; i < il; i ++ ) {

			var ik = iks[ i ];

			var targetBone = bones[ ik.target ];
			var effectorBone = bones[ ik.effector ];

			var targetMesh = this.children[ offset ++ ];
			var effectorMesh = this.children[ offset ++ ];

			targetMesh.position.copy( getPosition( targetBone ) );
			effectorMesh.position.copy( getPosition( effectorBone ) );

			for ( var j = 0, jl = ik.links.length; j < jl; j ++ ) {

				var link = ik.links[ j ];
				var linkBone = bones[ link.index ];

				var linkMesh = this.children[ offset ++ ];

				linkMesh.position.copy( getPosition( linkBone ) );

			}

			var line = this.children[ offset ++ ];
			var array = line.geometry.attributes.position.array;

			setPositionOfBoneToAttributeArray( array, 0, targetBone );
			setPositionOfBoneToAttributeArray( array, 1, effectorBone );

			for ( var j = 0, jl = ik.links.length; j < jl; j ++ ) {

				var link = ik.links[ j ];
				var linkBone = bones[ link.index ];
				setPositionOfBoneToAttributeArray( array, j + 2, linkBone );

			}

			line.geometry.attributes.position.needsUpdate = true;

		}

	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * @author takahiro / https://github.com/takahirox
	 *
	 * Dependencies
	 *  - Ammo.js https://github.com/kripken/ammo.js
	 *
	 * MMD specific Physics class.
	 *
	 * See THREE.MMDLoader for the passed parameter list of RigidBody/Constraint.
	 *
	 * Requirement:
	 *  - don't change object's scale from (1,1,1) after setting physics to object
	 *
	 * TODO
	 *  - optimize for the performance
	 *  - use Physijs http://chandlerprall.github.io/Physijs/
	 *    and improve the performance by making use of Web worker.
	 *  - if possible, make this class being non-MMD specific.
	 *  - object scale change support
	 */

	THREE.MMDPhysics = function ( mesh, params ) {

		if ( params === undefined ) params = {};

		this.mesh = mesh;
		this.helper = new THREE.MMDPhysics.ResourceHelper();

		/*
		 * I don't know why but 1/60 unitStep easily breaks models
		 * so I set it 1/65 so far.
		 * Don't set too small unitStep because
		 * the smaller unitStep can make the performance worse.
		 */
		this.unitStep = ( params.unitStep !== undefined ) ? params.unitStep : 1 / 65;
		this.maxStepNum = ( params.maxStepNum !== undefined ) ? params.maxStepNum : 3;

		this.world = null;
		this.bodies = [];
		this.constraints = [];

		this.init( mesh );

	};

	THREE.MMDPhysics.prototype = {

		constructor: THREE.MMDPhysics,

		init: function ( mesh ) {

			var parent = mesh.parent;

			if ( parent !== null ) {

				parent.remove( mesh );

			}

			var currentPosition = mesh.position.clone();
			var currentRotation = mesh.rotation.clone();
			var currentScale = mesh.scale.clone();

			mesh.position.set( 0, 0, 0 );
			mesh.rotation.set( 0, 0, 0 );
			mesh.scale.set( 1, 1, 1 );

			mesh.updateMatrixWorld( true );

			this.initWorld();
			this.initRigidBodies();
			this.initConstraints();

			if ( parent !== null ) {

				parent.add( mesh );

			}

			mesh.position.copy( currentPosition );
			mesh.rotation.copy( currentRotation );
			mesh.scale.copy( currentScale );

			mesh.updateMatrixWorld( true );

			this.reset();

		},

		initWorld: function () {

			var config = new Ammo.btDefaultCollisionConfiguration();
			var dispatcher = new Ammo.btCollisionDispatcher( config );
			var cache = new Ammo.btDbvtBroadphase();
			var solver = new Ammo.btSequentialImpulseConstraintSolver();
			var world = new Ammo.btDiscreteDynamicsWorld( dispatcher, cache, solver, config );
			world.setGravity( new Ammo.btVector3( 0, -9.8 * 10, 0 ) );
			this.world = world;

		},

		initRigidBodies: function () {

			var bodies = this.mesh.geometry.rigidBodies;

			for ( var i = 0; i < bodies.length; i++ ) {

				var b = new THREE.MMDPhysics.RigidBody( this.mesh, this.world, bodies[ i ], this.helper );
				this.bodies.push( b );

			}

		},

		initConstraints: function () {

			var constraints = this.mesh.geometry.constraints;

			for ( var i = 0; i < constraints.length; i++ ) {

				var params = constraints[ i ];
				var bodyA = this.bodies[ params.rigidBodyIndex1 ];
				var bodyB = this.bodies[ params.rigidBodyIndex2 ];
				var c = new THREE.MMDPhysics.Constraint( this.mesh, this.world, bodyA, bodyB, params, this.helper );
				this.constraints.push( c );

			}


		},

		update: function ( delta ) {

			var unitStep = this.unitStep;
			var stepTime = delta;
			var maxStepNum = ( ( delta / unitStep ) | 0 ) + 1;

			if ( stepTime < unitStep ) {

				stepTime = unitStep;
				maxStepNum = 1;

			}

			if ( maxStepNum > this.maxStepNum ) {

				maxStepNum = this.maxStepNum;

			}

			this.updateRigidBodies();
			this.world.stepSimulation( stepTime, maxStepNum, unitStep );
			this.updateBones();

		},

		updateRigidBodies: function () {

			for ( var i = 0; i < this.bodies.length; i++ ) {

				this.bodies[ i ].updateFromBone();

			}

		},

		updateBones: function () {

			for ( var i = 0; i < this.bodies.length; i++ ) {

				this.bodies[ i ].updateBone();

			}

		},

		reset: function () {

			for ( var i = 0; i < this.bodies.length; i++ ) {

				this.bodies[ i ].reset();

			}

		},

		warmup: function ( cycles ) {

			for ( var i = 0; i < cycles; i++ ) {

				this.update( 1 / 60 );

			}

		}

	};

	/**
	 * This helper class responsibilies are
	 *
	 * 1. manage Ammo.js and Three.js object resources and
	 *    improve the performance and the memory consumption by
	 *    reusing objects.
	 *
	 * 2. provide simple Ammo object operations.
	 */
	THREE.MMDPhysics.ResourceHelper = function () {

		// for Three.js
		this.threeVector3s = [];
		this.threeMatrix4s = [];
		this.threeQuaternions = [];
		this.threeEulers = [];

		// for Ammo.js
		this.transforms = [];
		this.quaternions = [];
		this.vector3s = [];

	};

	THREE.MMDPhysics.ResourceHelper.prototype = {

		allocThreeVector3: function () {

			return ( this.threeVector3s.length > 0 ) ? this.threeVector3s.pop() : new THREE.Vector3();

		},

		freeThreeVector3: function ( v ) {

			this.threeVector3s.push( v );

		},

		allocThreeMatrix4: function () {

			return ( this.threeMatrix4s.length > 0 ) ? this.threeMatrix4s.pop() : new THREE.Matrix4();

		},

		freeThreeMatrix4: function ( m ) {

			this.threeMatrix4s.push( m );

		},

		allocThreeQuaternion: function () {

			return ( this.threeQuaternions.length > 0 ) ? this.threeQuaternions.pop() : new THREE.Quaternion();

		},

		freeThreeQuaternion: function ( q ) {

			this.threeQuaternions.push( q );

		},

		allocThreeEuler: function () {

			return ( this.threeEulers.length > 0 ) ? this.threeEulers.pop() : new THREE.Euler();

		},

		freeThreeEuler: function ( e ) {

			this.threeEulers.push( e );

		},

		allocTransform: function () {

			return ( this.transforms.length > 0 ) ? this.transforms.pop() : new Ammo.btTransform();

		},

		freeTransform: function ( t ) {

			this.transforms.push( t );

		},

		allocQuaternion: function () {

			return ( this.quaternions.length > 0 ) ? this.quaternions.pop() : new Ammo.btQuaternion();

		},

		freeQuaternion: function ( q ) {

			this.quaternions.push( q );

		},

		allocVector3: function () {

			return ( this.vector3s.length > 0 ) ? this.vector3s.pop() : new Ammo.btVector3();

		},

		freeVector3: function ( v ) {

			this.vector3s.push( v );

		},

		setIdentity: function ( t ) {

			t.setIdentity();

		},

		getBasis: function ( t ) {

			var q = this.allocQuaternion();
			t.getBasis().getRotation( q );
			return q;

		},

		getBasisAsMatrix3: function ( t ) {

			var q = this.getBasis( t );
			var m = this.quaternionToMatrix3( q );
			this.freeQuaternion( q );
			return m;

		},

		getOrigin: function( t ) {

			return t.getOrigin();

		},

		setOrigin: function( t, v ) {

			t.getOrigin().setValue( v.x(), v.y(), v.z() );

		},

		copyOrigin: function( t1, t2 ) {

			var o = t2.getOrigin();
			this.setOrigin( t1, o );

		},

		setBasis: function( t, q ) {

			t.setRotation( q );

		},

		setBasisFromMatrix3: function( t, m ) {

			var q = this.matrix3ToQuaternion( m );
			this.setBasis( t, q );
			this.freeQuaternion( q );

		},

		setOriginFromArray3: function ( t, a ) {

			t.getOrigin().setValue( a[ 0 ], a[ 1 ], a[ 2 ] );

		},

		setBasisFromArray3: function ( t, a ) {

			var thQ = this.allocThreeQuaternion();
			var thE = this.allocThreeEuler();
			thE.set( a[ 0 ], a[ 1 ], a[ 2 ] );
			this.setBasisFromArray4( t, thQ.setFromEuler( thE ).toArray() );

			this.freeThreeEuler( thE );
			this.freeThreeQuaternion( thQ );

		},

		setBasisFromArray4: function ( t, a ) {

			var q = this.array4ToQuaternion( a );
			this.setBasis( t, q );
			this.freeQuaternion( q );

		},

		array4ToQuaternion: function( a ) {

			var q = this.allocQuaternion();
			q.setX( a[ 0 ] );
			q.setY( a[ 1 ] );
			q.setZ( a[ 2 ] );
			q.setW( a[ 3 ] );
			return q;

		},

		multiplyTransforms: function ( t1, t2 ) {

			var t = this.allocTransform();
			this.setIdentity( t );

			var m1 = this.getBasisAsMatrix3( t1 );
			var m2 = this.getBasisAsMatrix3( t2 );

			var o1 = this.getOrigin( t1 );
			var o2 = this.getOrigin( t2 );

			var v1 = this.multiplyMatrix3ByVector3( m1, o2 );
			var v2 = this.addVector3( v1, o1 );
			this.setOrigin( t, v2 );

			var m3 = this.multiplyMatrices3( m1, m2 );
			this.setBasisFromMatrix3( t, m3 );

			this.freeVector3( v1 );
			this.freeVector3( v2 );

			return t;

		},

		inverseTransform: function ( t ) {

			var t2 = this.allocTransform();

			var m1 = this.getBasisAsMatrix3( t );
			var o = this.getOrigin( t );

			var m2 = this.transposeMatrix3( m1 );
			var v1 = this.negativeVector3( o );
			var v2 = this.multiplyMatrix3ByVector3( m2, v1 );

			this.setOrigin( t2, v2 );
			this.setBasisFromMatrix3( t2, m2 );

			this.freeVector3( v1 );
			this.freeVector3( v2 );

			return t2;

		},

		multiplyMatrices3: function ( m1, m2 ) {

			var m3 = [];

			var v10 = this.rowOfMatrix3( m1, 0 );
			var v11 = this.rowOfMatrix3( m1, 1 );
			var v12 = this.rowOfMatrix3( m1, 2 );

			var v20 = this.columnOfMatrix3( m2, 0 );
			var v21 = this.columnOfMatrix3( m2, 1 );
			var v22 = this.columnOfMatrix3( m2, 2 );

			m3[ 0 ] = this.dotVectors3( v10, v20 );
			m3[ 1 ] = this.dotVectors3( v10, v21 );
			m3[ 2 ] = this.dotVectors3( v10, v22 );
			m3[ 3 ] = this.dotVectors3( v11, v20 );
			m3[ 4 ] = this.dotVectors3( v11, v21 );
			m3[ 5 ] = this.dotVectors3( v11, v22 );
			m3[ 6 ] = this.dotVectors3( v12, v20 );
			m3[ 7 ] = this.dotVectors3( v12, v21 );
			m3[ 8 ] = this.dotVectors3( v12, v22 );

			this.freeVector3( v10 );
			this.freeVector3( v11 );
			this.freeVector3( v12 );
			this.freeVector3( v20 );
			this.freeVector3( v21 );
			this.freeVector3( v22 );

			return m3;

		},

		addVector3: function( v1, v2 ) {

			var v = this.allocVector3();
			v.setValue( v1.x() + v2.x(), v1.y() + v2.y(), v1.z() + v2.z() );
			return v;

		},

		dotVectors3: function( v1, v2 ) {

			return v1.x() * v2.x() + v1.y() * v2.y() + v1.z() * v2.z();

		},

		rowOfMatrix3: function( m, i ) {

			var v = this.allocVector3();
			v.setValue( m[ i * 3 + 0 ], m[ i * 3 + 1 ], m[ i * 3 + 2 ] );
			return v;

		},

		columnOfMatrix3: function( m, i ) {

			var v = this.allocVector3();
			v.setValue( m[ i + 0 ], m[ i + 3 ], m[ i + 6 ] );
			return v;

		},

		negativeVector3: function( v ) {

			var v2 = this.allocVector3();
			v2.setValue( -v.x(), -v.y(), -v.z() );
			return v2;

		},

		multiplyMatrix3ByVector3: function ( m, v ) {

			var v4 = this.allocVector3();

			var v0 = this.rowOfMatrix3( m, 0 );
			var v1 = this.rowOfMatrix3( m, 1 );
			var v2 = this.rowOfMatrix3( m, 2 );
			var x = this.dotVectors3( v0, v );
			var y = this.dotVectors3( v1, v );
			var z = this.dotVectors3( v2, v );

			v4.setValue( x, y, z );

			this.freeVector3( v0 );
			this.freeVector3( v1 );
			this.freeVector3( v2 );

			return v4;

		},

		transposeMatrix3: function( m ) {

			var m2 = [];
			m2[ 0 ] = m[ 0 ];
			m2[ 1 ] = m[ 3 ];
			m2[ 2 ] = m[ 6 ];
			m2[ 3 ] = m[ 1 ];
			m2[ 4 ] = m[ 4 ];
			m2[ 5 ] = m[ 7 ];
			m2[ 6 ] = m[ 2 ];
			m2[ 7 ] = m[ 5 ];
			m2[ 8 ] = m[ 8 ];
			return m2;

		},

		quaternionToMatrix3: function ( q ) {

			var m = [];

			var x = q.x();
			var y = q.y();
			var z = q.z();
			var w = q.w();

			var xx = x * x;
			var yy = y * y;
			var zz = z * z;

			var xy = x * y;
			var yz = y * z;
			var zx = z * x;

			var xw = x * w;
			var yw = y * w;
			var zw = z * w;

			m[ 0 ] = 1 - 2 * ( yy + zz );
			m[ 1 ] = 2 * ( xy - zw );
			m[ 2 ] = 2 * ( zx + yw );
			m[ 3 ] = 2 * ( xy + zw );
			m[ 4 ] = 1 - 2 * ( zz + xx );
			m[ 5 ] = 2 * ( yz - xw );
			m[ 6 ] = 2 * ( zx - yw );
			m[ 7 ] = 2 * ( yz + xw );
			m[ 8 ] = 1 - 2 * ( xx + yy );

			return m;

		},

		matrix3ToQuaternion: function( m ) {

			var t = m[ 0 ] + m[ 4 ] + m[ 8 ];
			var s, x, y, z, w;

			if( t > 0 ) {

				s = Math.sqrt( t + 1.0 ) * 2;
				w = 0.25 * s;
				x = ( m[ 7 ] - m[ 5 ] ) / s;
				y = ( m[ 2 ] - m[ 6 ] ) / s; 
				z = ( m[ 3 ] - m[ 1 ] ) / s; 

			} else if( ( m[ 0 ] > m[ 4 ] ) && ( m[ 0 ] > m[ 8 ] ) ) {

				s = Math.sqrt( 1.0 + m[ 0 ] - m[ 4 ] - m[ 8 ] ) * 2;
				w = ( m[ 7 ] - m[ 5 ] ) / s;
				x = 0.25 * s;
				y = ( m[ 1 ] + m[ 3 ] ) / s;
				z = ( m[ 2 ] + m[ 6 ] ) / s;

			} else if( m[ 4 ] > m[ 8 ] ) {

				s = Math.sqrt( 1.0 + m[ 4 ] - m[ 0 ] - m[ 8 ] ) * 2;
				w = ( m[ 2 ] - m[ 6 ] ) / s;
				x = ( m[ 1 ] + m[ 3 ] ) / s;
				y = 0.25 * s;
				z = ( m[ 5 ] + m[ 7 ] ) / s;

			} else {

				s = Math.sqrt( 1.0 + m[ 8 ] - m[ 0 ] - m[ 4 ] ) * 2;
				w = ( m[ 3 ] - m[ 1 ] ) / s;
				x = ( m[ 2 ] + m[ 6 ] ) / s;
				y = ( m[ 5 ] + m[ 7 ] ) / s;
				z = 0.25 * s;

			}

			var q = this.allocQuaternion();
			q.setX( x );
			q.setY( y );
			q.setZ( z );
			q.setW( w );
			return q;

		},

	};

	THREE.MMDPhysics.RigidBody = function ( mesh, world, params, helper ) {

		this.mesh  = mesh;
		this.world = world;
		this.params = params;
		this.helper = helper;

		this.body = null;
		this.bone = null;
		this.boneOffsetForm = null;
		this.boneOffsetFormInverse = null;

		this.init();

	};

	THREE.MMDPhysics.RigidBody.prototype = {

		constructor: THREE.MMDPhysics.RigidBody,

		init: function () {

			function generateShape( p ) {

				switch( p.shapeType ) {

					case 0:
						return new Ammo.btSphereShape( p.width );

					case 1:
						return new Ammo.btBoxShape( new Ammo.btVector3( p.width, p.height, p.depth ) );

					case 2:
						return new Ammo.btCapsuleShape( p.width, p.height );

					default:
						throw 'unknown shape type ' + p.shapeType;

				}

			};

			var helper = this.helper;
			var params = this.params;
			var bones = this.mesh.skeleton.bones;
			var bone = ( params.boneIndex === -1 ) ? new THREE.Bone() : bones[ params.boneIndex ];

			var shape = generateShape( params );
			var weight = ( params.type === 0 ) ? 0 : params.weight;
			var localInertia = helper.allocVector3();
			localInertia.setValue( 0, 0, 0 );

			if( weight !== 0 ) {

				shape.calculateLocalInertia( weight, localInertia );

			}

			var boneOffsetForm = helper.allocTransform();
			helper.setIdentity( boneOffsetForm );
			helper.setOriginFromArray3( boneOffsetForm, params.position );
			helper.setBasisFromArray3( boneOffsetForm, params.rotation );

			var boneForm = helper.allocTransform();
			helper.setIdentity( boneForm );
			helper.setOriginFromArray3( boneForm, bone.getWorldPosition().toArray() );

			var form = helper.multiplyTransforms( boneForm, boneOffsetForm );
			var state = new Ammo.btDefaultMotionState( form );

			var info = new Ammo.btRigidBodyConstructionInfo( weight, state, shape, localInertia );
			info.set_m_friction( params.friction );
			info.set_m_restitution( params.restitution );

			var body = new Ammo.btRigidBody( info );

			if ( params.type === 0 ) {

				body.setCollisionFlags( body.getCollisionFlags() | 2 );

				/*
				 * It'd be better to comment out this line though in general I should call this method
				 * because I'm not sure why but physics will be more like MMD's
				 * if I comment out.
				 */
				body.setActivationState( 4 );

			}

			body.setDamping( params.positionDamping, params.rotationDamping );
			body.setSleepingThresholds( 0, 0 );

			this.world.addRigidBody( body, 1 << params.groupIndex, params.groupTarget );

			this.body = body;
			this.bone = bone;
			this.boneOffsetForm = boneOffsetForm;
			this.boneOffsetFormInverse = helper.inverseTransform( boneOffsetForm );

			helper.freeVector3( localInertia );
			helper.freeTransform( form );
			helper.freeTransform( boneForm );

		},

		reset: function () {

			this.setTransformFromBone();

		},

		updateFromBone: function () {

			if ( this.params.boneIndex === -1 ) {

				return;

			}

			if ( this.params.type === 0 ) {

				this.setTransformFromBone();

			}

		},

		updateBone: function () {

			if ( this.params.type === 0 || this.params.boneIndex === -1 ) {

				return;

			}

			this.updateBoneRotation();

			if ( this.params.type === 1 ) {

				this.updateBonePosition();

			}

			this.bone.updateMatrixWorld( true );

			if ( this.params.type === 2 ) {

				this.setPositionFromBone();

			}

		},

		getBoneTransform: function () {

			var helper = this.helper;
			var p = this.bone.getWorldPosition();
			var q = this.bone.getWorldQuaternion();

			var tr = helper.allocTransform();
			helper.setOriginFromArray3( tr, p.toArray() );
			helper.setBasisFromArray4( tr, q.toArray() );

			var form = helper.multiplyTransforms( tr, this.boneOffsetForm );

			helper.freeTransform( tr );

			return form;

		},

		getWorldTransformForBone: function () {

			var helper = this.helper;

			var tr = helper.allocTransform();
			this.body.getMotionState().getWorldTransform( tr );
			var tr2 = helper.multiplyTransforms( tr, this.boneOffsetFormInverse );

			helper.freeTransform( tr );

			return tr2;

		},

		setTransformFromBone: function () {

			var helper = this.helper;
			var form = this.getBoneTransform();

			// TODO: check the most appropriate way to set
			//this.body.setWorldTransform( form );
			this.body.setCenterOfMassTransform( form );
			this.body.getMotionState().setWorldTransform( form );

			helper.freeTransform( form );

		},

		setPositionFromBone: function () {

			var helper = this.helper;
			var form = this.getBoneTransform();

			var tr = helper.allocTransform();
			this.body.getMotionState().getWorldTransform( tr );
			helper.copyOrigin( tr, form );

			// TODO: check the most appropriate way to set
			//this.body.setWorldTransform( tr );
			this.body.setCenterOfMassTransform( tr );
			this.body.getMotionState().setWorldTransform( tr );

			helper.freeTransform( tr );
			helper.freeTransform( form );

		},

		updateBoneRotation: function () {

			this.bone.updateMatrixWorld( true );

			var helper = this.helper;

			var tr = this.getWorldTransformForBone();
			var q = helper.getBasis( tr );

			var thQ = helper.allocThreeQuaternion();
			var thQ2 = helper.allocThreeQuaternion();
			var thQ3 = helper.allocThreeQuaternion();

			thQ.set( q.x(), q.y(), q.z(), q.w() );
			thQ2.setFromRotationMatrix( this.bone.matrixWorld );
			thQ2.conjugate()
			thQ2.multiply( thQ );

			//this.bone.quaternion.multiply( thQ2 );

			thQ3.setFromRotationMatrix( this.bone.matrix );
			this.bone.quaternion.copy( thQ2.multiply( thQ3 ) );

			helper.freeThreeQuaternion( thQ );
			helper.freeThreeQuaternion( thQ2 );
			helper.freeThreeQuaternion( thQ3 );

			helper.freeQuaternion( q );
			helper.freeTransform( tr );

		},

		updateBonePosition: function () {

			var helper = this.helper;

			var tr = this.getWorldTransformForBone();

			var thV = helper.allocThreeVector3();

			var o = helper.getOrigin( tr );
			thV.set( o.x(), o.y(), o.z() );

			var v = this.bone.worldToLocal( thV );
			this.bone.position.add( v );

			helper.freeThreeVector3( thV );

			helper.freeTransform( tr );

		}

	};

	THREE.MMDPhysics.Constraint = function ( mesh, world, bodyA, bodyB, params, helper ) {

		this.mesh  = mesh;
		this.world = world;
		this.bodyA = bodyA;
		this.bodyB = bodyB;
		this.params = params;
		this.helper = helper;

		this.constraint = null;

		this.init();

	};

	THREE.MMDPhysics.Constraint.prototype = {

		constructor: THREE.MMDPhysics.Constraint,

		init: function () {

			var helper = this.helper;
			var params = this.params;
			var bodyA = this.bodyA;
			var bodyB = this.bodyB;

			var form = helper.allocTransform();
			helper.setIdentity( form );
			helper.setOriginFromArray3( form, params.position );
			helper.setBasisFromArray3( form, params.rotation );

			var formA = helper.allocTransform();
			var formB = helper.allocTransform();

			bodyA.body.getMotionState().getWorldTransform( formA );
			bodyB.body.getMotionState().getWorldTransform( formB );

			var formInverseA = helper.inverseTransform( formA );
			var formInverseB = helper.inverseTransform( formB );

			var formA2 = helper.multiplyTransforms( formInverseA, form );
			var formB2 = helper.multiplyTransforms( formInverseB, form );

			var constraint = new Ammo.btGeneric6DofSpringConstraint( bodyA.body, bodyB.body, formA2, formB2, true );

			var lll = helper.allocVector3();
			var lul = helper.allocVector3();
			var all = helper.allocVector3();
			var aul = helper.allocVector3();

			lll.setValue( params.translationLimitation1[ 0 ],
			              params.translationLimitation1[ 1 ],
			              params.translationLimitation1[ 2 ] );
			lul.setValue( params.translationLimitation2[ 0 ],
			              params.translationLimitation2[ 1 ],
			              params.translationLimitation2[ 2 ] );
			all.setValue( params.rotationLimitation1[ 0 ],
			              params.rotationLimitation1[ 1 ],
			              params.rotationLimitation1[ 2 ] );
			aul.setValue( params.rotationLimitation2[ 0 ],
			              params.rotationLimitation2[ 1 ],
			              params.rotationLimitation2[ 2 ] );

			constraint.setLinearLowerLimit( lll );
			constraint.setLinearUpperLimit( lul );
			constraint.setAngularLowerLimit( all );
			constraint.setAngularUpperLimit( aul );

			for ( var i = 0; i < 3; i++ ) {

				if( params.springPosition[ i ] !== 0 ) {

					constraint.enableSpring( i, true );
					constraint.setStiffness( i, params.springPosition[ i ] );

				}

			}

			for ( var i = 0; i < 3; i++ ) {

				if( params.springRotation[ i ] !== 0 ) {

					constraint.enableSpring( i + 3, true );
					constraint.setStiffness( i + 3, params.springRotation[ i ] );

				}

			}

			/*
			 * Currently(10/31/2016) official ammo.js doesn't support
			 * btGeneric6DofSpringConstraint.setParam method.
			 * You need custom ammo.js (add the method into idl) if you wanna use.
			 * By setting this parameter, physics will be more like MMD's
			 */
			if ( constraint.setParam !== undefined ) {

				for ( var i = 0; i < 6; i ++ ) {

					// this parameter is from http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mmd.three.js
					constraint.setParam( 2, 0.475, i );

				}

			}

			this.world.addConstraint( constraint, true );
			this.constraint = constraint;

			helper.freeTransform( form );
			helper.freeTransform( formA );
			helper.freeTransform( formB );
			helper.freeTransform( formInverseA );
			helper.freeTransform( formInverseB );
			helper.freeTransform( formA2 );
			helper.freeTransform( formB2 );
			helper.freeVector3( lll );
			helper.freeVector3( lul );
			helper.freeVector3( all );
			helper.freeVector3( aul );

		}

	};


	THREE.MMDPhysicsHelper = function ( mesh ) {

		if ( mesh.physics === undefined || mesh.geometry.rigidBodies === undefined ) {

			throw 'THREE.MMDPhysicsHelper requires physics in mesh and rigidBodies in mesh.geometry.';

		}

		THREE.Object3D.call( this );

		this.root = mesh;

		this.matrix = mesh.matrixWorld;
		this.matrixAutoUpdate = false;

		this.materials = [];

		this.materials.push(
			new THREE.MeshBasicMaterial( {
				color: new THREE.Color( 0xff8888 ),
				wireframe: true,
				depthTest: false,
				depthWrite: false,
				opacity: 0.25,
				transparent: true
			} )
		);

		this.materials.push(
			new THREE.MeshBasicMaterial( {
				color: new THREE.Color( 0x88ff88 ),
				wireframe: true,
				depthTest: false,
				depthWrite: false,
				opacity: 0.25,
				transparent: true
			} )
		);

		this.materials.push(
			new THREE.MeshBasicMaterial( {
				color: new THREE.Color( 0x8888ff ),
				wireframe: true,
				depthTest: false,
				depthWrite: false,
				opacity: 0.25,
				transparent: true
			} )
		);

		this._init();
		this.update();

	};

	THREE.MMDPhysicsHelper.prototype = Object.create( THREE.Object3D.prototype );
	THREE.MMDPhysicsHelper.prototype.constructor = THREE.MMDPhysicsHelper;

	THREE.MMDPhysicsHelper.prototype._init = function () {

		var mesh = this.root;
		var rigidBodies = mesh.geometry.rigidBodies;

		function createGeometry( param ) {

			switch ( param.shapeType ) {

				case 0:
					return new THREE.SphereBufferGeometry( param.width, 16, 8 );

				case 1:
					return new THREE.BoxBufferGeometry( param.width * 2, param.height * 2, param.depth * 2, 8, 8, 8);

				case 2:
					return new createCapsuleGeometry( param.width, param.height, 16, 8 );

				default:
					return null;

			}

		}

		// copy from http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mytest37.js?ver=20160815
		function createCapsuleGeometry( radius, cylinderHeight, segmentsRadius, segmentsHeight ) {

			var geometry = new THREE.CylinderBufferGeometry( radius, radius, cylinderHeight, segmentsRadius, segmentsHeight, true );
			var upperSphere = new THREE.Mesh( new THREE.SphereBufferGeometry( radius, segmentsRadius, segmentsHeight, 0, Math.PI * 2, 0, Math.PI / 2 ) );
			var lowerSphere = new THREE.Mesh( new THREE.SphereBufferGeometry( radius, segmentsRadius, segmentsHeight, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2 ) );

			upperSphere.position.set( 0, cylinderHeight / 2, 0 );
			lowerSphere.position.set( 0, -cylinderHeight / 2, 0 );

			upperSphere.updateMatrix();
			lowerSphere.updateMatrix();

			geometry.merge( upperSphere.geometry, upperSphere.matrix );
			geometry.merge( lowerSphere.geometry, lowerSphere.matrix );

			return geometry;

		}

		for ( var i = 0, il = rigidBodies.length; i < il; i ++ ) {

			var param = rigidBodies[ i ];
			this.add( new THREE.Mesh( createGeometry( param ), this.materials[ param.type ] ) );

		}

	};

	THREE.MMDPhysicsHelper.prototype.update = function () {

		var mesh = this.root;
		var rigidBodies = mesh.geometry.rigidBodies;
		var bodies = mesh.physics.bodies;

		var matrixWorldInv = new THREE.Matrix4().getInverse( mesh.matrixWorld );
		var vector = new THREE.Vector3();
		var quaternion = new THREE.Quaternion();
		var quaternion2 = new THREE.Quaternion();

		function getPosition( origin ) {

			vector.set( origin.x(), origin.y(), origin.z() );
			vector.applyMatrix4( matrixWorldInv );

			return vector;

		}

		function getQuaternion( rotation ) {

			quaternion.set( rotation.x(), rotation.y(), rotation.z(), rotation.w() );
			quaternion2.setFromRotationMatrix( matrixWorldInv );
			quaternion2.multiply( quaternion );

			return quaternion2;

		}

		for ( var i = 0, il = rigidBodies.length; i < il; i ++ ) {

			var body = bodies[ i ].body;
			var mesh = this.children[ i ];

			var tr = body.getCenterOfMassTransform();

			mesh.position.copy( getPosition( tr.getOrigin() ) );
			mesh.quaternion.copy( getQuaternion( tr.getRotation() ) );

		}

	};


/***/ }
/******/ ]);