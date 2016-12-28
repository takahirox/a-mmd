# A-Frame MMD component

a-mmd is an A-Frame MMD component which enables MMD models to dance.

![screenshot](./screenshot.png "screenshot")
![screenshot2](./screenshot2.png "screenshot2")

# A-Frame version

a-mmd requires the latest A-Frame which is under development.

Clone A-Frame repository then build by yourself

https://github.com/aframevr/aframe

or use libs/aframe.js in this repository.

## Properties

### mmd

| Properties     | type    | Default Value | Description | 
| -------------- | ------- | ------------- | ----------- | 
| audio          | string  | ''            | Audio file path. | 
| volume         | number  | 1.0           | Audio volume. |
| audioDelayTime | number  | 0.0           | How long audio delays to start to play since model starts to dance. | 
| afterglow      | number  | 0.0           | How long model keeps the last motion since dance/audio ends. | 
| outline        | boolean | true          | If draw outline. Note that true affects all models in the same scene. | 

### mmd-model

| Properties | type    | Default Value | Description |
| ---------- | ------- | ------------- | ----------- |
| model      | string  | ''            | MMD model file path. |
| vpd        | string  | ''            | MMD pose file path. |
| vmd        | string  | ''            | MMD dance file path. |
| physics    | boolean | false         | If turn on physics. |
| blink      | boolean | false         | If model blinks one's eyes. |


## Browser

### How to use

```
<head>
  <script src="./libs/ammo.js"></script>
  <script src="./libs/aframe.min.js"></script>
  <script src="./build/a-mmd.min.js"></script>
</head>

<body>
  <a-scene antialias="true">
    <a-entity position="0 10 20">
      <a-camera></a-camera>
    </a-entity>

    <a-entity mmd="audio:./audios/audio.mp3;">
      <a-entity mmd-model="model:./models/model.pmd;
                           vmd:./vmds/dance.vmd;"></a-entity>
    </a-entity>

    <a-light type="ambient" color="#888"></a-light>
    <a-light color="#AAA" distance="100" intensity="0.4" type="point"></a-light>
  </a-scene>
</body>
```

## NPM

### How to install

```
$ npm install a-mmd
```

### How to build

```
$ npm install
$ npm run all
```

### How to load

```
require('./libs/ammo.js');
require('aframe');
require('a-mmd');
```

## Copyright

You are allowed to use Crypton's Vocaloid(Hatsune Miku, Kagamine Rin, and so on)
stuffs (MMD models, songs, and so on) only if you follow the guideline set by
Crypton Future Media, INC. for the usage of its characters.

For detail, see http://piapro.net/en_for_creators.html


## MMD assets license

The license of MMD assets used in index.html

https://github.com/mrdoob/three.js/tree/dev/examples/models/mmd#readme
