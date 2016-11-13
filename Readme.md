# A-Frame MMD component (WIP)

![screenshot](./screenshot.png "screenshot")
![screenshot2](./screenshot2.png "screenshot2")


## Properties

### mmd

| Properties     | Description | type   | Default Value |
| -------------- | ----------- | ------ | ------------- |
| audio          |             | string | ''            |
| volume         |             | number | 1.0           |
| audioDelayTime |             | number | 0.0           |
| afterglow      |             | number | 0.0           |

### mmd-model

| Properties | Description | type    | Default Value |
| ---------- | ----------- | ------- | ------------- |
| model      |             | string  | ''            |
| vpd        |             | string  | ''            |
| vmd        |             | string  | ''            |
| physics    |             | boolean | false         |
| blink      |             | boolean | false         |


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
