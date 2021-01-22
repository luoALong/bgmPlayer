import * as is from './is.js';
import Emitter from 'tiny-emitter';

export default class BgmPlayer extends Emitter {
  controller = null;
  _src = '';
  _loop = false;
  _auto = false;
  options = {
    src: {
      type: String,
      default: ''
    },
    loop: {
      type: Boolean,
      default: false
    },
    auto: {
      type: Boolean,
      default: true
    },
  }

  player = null;
  listener = null;
  _isPlaying = false;
  totalTime = 0;
  currentTime = 0;

  get src() {
    return this._src;
  }

  set src(value) {
    this._src = value;

    if (!this.player) return;
    const _set = () => {
      this.player.src = this._src;
    };

    if (this.isPlaying) {
      this.pause();
      setTimeout(_set);
    } else {
      _set();
    }
  }

  get loop() {
    return this._loop;
  }

  set loop(value) {
    this._loop = value;

    if (!this.player) return;
    this.player.loop = this._loop;
  }

  get auto() {
    return this._auto;
  }

  set auto(value) {
    this._auto = value;

    if (!this.player) return;
    this.player.autoplay = this._auto;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  set isPlaying(value) {
    if (this._isPlaying === value) return;
    this._isPlaying = value;
    this.emit('toggle', this._isPlaying);
  }

  constructor(controller, options) {
    super();

    if (!controller) {
      throw new Error('First argument is required.');
    }
    if (is.string(controller)) {
      controller = document.querySelector(controller);
    }
    if (!is.element(controller)) {
      throw new Error('First argument should be a HTMLElement or a CSS selector string.');
    }

    this.controller = controller;
    this._resolveOptions(options);

    this._initPlayer();
    this._attachEvent();
    this._attachPlayer();
    if (this.auto) {
      this._autoPlay();
    }
  }

  _resolveOptions(options = {}) {
    for (const key in this.options) {
      if (!this.options.hasOwnProperty(key)) continue;
      const { type: Type, default: defaultValue } = this.options[key];
      const value = options[key] ?? this._getAttributeValue(key) ?? defaultValue;
      this[key] = Type(value);
  
      // console.log(key, options[key], this._getAttributeValue(key), this[key])
    }
  }

  _initPlayer() {
    const player = document.createElement('audio');
    player.src = this.src;
    player.loop = this.loop;
    player.autoplay = this.auto;
    player.preload = 'auto';

    this.player = player;
  }

  _attachEvent() {
    this.player.addEventListener('play', () => {
      // console.log('play')
      this.isPlaying = true;
      this.emit('play');
    });
    this.player.addEventListener('pause', () => {
      // console.log('pause')
      this.isPlaying = false;
      this.emit('pause');
    });
    this.player.addEventListener('ended', () => {
      // console.log('ended')
      this.isPlaying = false;
      this.emit('ended');
    });
    this.player.addEventListener('playing', () => {
      // console.log('playing')
      this.isPlaying = true;
    });
    this.player.addEventListener('timeupdate', () => {
      // console.log('timeupdate', this.player.currentTime)
      this.currentTime = this.player.currentTime;
    });
    this.player.addEventListener('durationchange', () => {
      // console.log('durationchange', this.player.duration)
      this.totalTime = this.player.duration;
    });
  }

  _attachPlayer() {
    const callback = this.toggle.bind(this);
    this.controller.addEventListener('click', callback);
    this.listener = {
      destory: () => {
        this.controller.removeEventListener('click', callback);
      }
    }
  }

  _detachPlayer() {
    if (!this.listener) return;
    this.listener.destory();
    this.listener = null;
  }

  _autoPlay() {
    // try to play directly
    try {
      const res = this.play();
      if (is.promise(res)) res.catch(() => {});
    } catch {};

    const _play = () => {
      this.play();
      window.removeEventListener('click', _play);
    }
    window.addEventListener('click', _play);
  }

  _getAttributeValue(field) {
    const attribute = `data-bgm-${field}`;

    if (this.controller.hasAttribute(attribute)) {
      const Type = this.options[field]?.type;
      const value = this.controller.getAttribute(attribute);

      return Type === Boolean
        ? value !== 'false'
        : value;
    } else {
      return undefined;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (Math.abs(this.totalTime - this.currentTime) <= 0.1) {
        this.restart();
      } else {
        this.play();
      }
    }
  }

  play() {
    return this.player.play();
  }

  pause() {
    return this.player.pause();
  }

  restart() {
    this.seek(0);
    this.play();
  }

  seek(time) {
    this.currentTime = this.player.currentTime = time;
  }

  setSrc(value) {
    this.src = this.options.src.type(value);
  }

  setLoop(value) {
    this.loop = this.options.loop.type(value);
  }

  setAuto(value) {
    this.auto = this.options.auto.type(value);
  }

  destory() {
    this._detachPlayer();
    this.player = null;
  }
}