/*
  https://github.com/keithwhor/audiosynth
*/

let Synth; let AudioSynth; let
  AudioSynthInstrument;
!(function () {
  const URL = window.URL || window.webkitURL;
  const { Blob } = window;

  if (!URL || !Blob) {
    throw new Error('This browser does not support AudioSynth');
  }

  let _encapsulated = false;
  let AudioSynthInstance = null;
  const pack = function (c, arg) { return [new Uint8Array([arg, arg >> 8]), new Uint8Array([arg, arg >> 8, arg >> 16, arg >> 24])][c]; };
  const setPrivateVar = function (n, v, w, e) { Object.defineProperty(this, n, { value: v, writable: !!w, enumerable: !!e }); };
  const setPublicVar = function (n, v, w) { setPrivateVar.call(this, n, v, w, true); };
  AudioSynthInstrument = function AudioSynthInstrument() { this.__init__.apply(this, arguments); };
  let setPriv = setPrivateVar.bind(AudioSynthInstrument.prototype);
  let setPub = setPublicVar.bind(AudioSynthInstrument.prototype);
  setPriv('__init__', function (a, b, c) {
    if (!_encapsulated) { throw new Error('AudioSynthInstrument can only be instantiated from the createInstrument method of the AudioSynth object.'); }
    setPrivateVar.call(this, '_parent', a);
    setPublicVar.call(this, 'name', b);
    setPrivateVar.call(this, '_soundID', c);
  });
  setPub('play', function (note, octave, duration, volume) {
    return this._parent.play(this._soundID, note, octave, duration, volume);
  });
  setPub('generate', function (note, octave, duration) {
    return this._parent.generate(this._soundID, note, octave, duration);
  });
  AudioSynth = function AudioSynth() { if (AudioSynthInstance instanceof AudioSynth) { return AudioSynthInstance; } this.__init__(); return this; };
  setPriv = setPrivateVar.bind(AudioSynth.prototype);
  setPub = setPublicVar.bind(AudioSynth.prototype);
  setPriv('_debug', false, true);
  setPriv('_bitsPerSample', 16);
  setPriv('_channels', 1);
  setPriv('_sampleRate', 44100, true);
  setPub('setSampleRate', function (v) {
    this._sampleRate = Math.max(Math.min(v | 0, 44100), 4000);
    this._clearCache();
    return this._sampleRate;
  });
  setPub('getSampleRate', function () { return this._sampleRate; });
  setPriv('_volume', 32768, true);
  setPub('setVolume', function (v) {
    v = parseFloat(v); if (isNaN(v)) { v = 0; }
    v = Math.round(v * 32768);
    this._volume = Math.max(Math.min(v | 0, 32768), 0);
    this._clearCache();
    return this._volume;
  });
  setPub('getVolume', function () { return Math.round(this._volume / 32768 * 10000) / 10000; });
  setPriv('_notes', {
    C: 261.63, 'C#': 277.18, D: 293.66, 'D#': 311.13, E: 329.63, F: 346.23, 'F#': 369.99, G: 392.00, 'G#': 415.30, A: 440.00, 'A#': 466.16, B: 493.88,
  });
  setPriv('_fileCache', [], true);
  setPriv('_temp', {}, true);
  setPriv('_sounds', [], true);
  setPriv('_mod', [function (i, s, f, x) { return Math.sin((2 * Math.PI) * (i / s) * f + x); }]);
  setPriv('_resizeCache', function () {
    const f = this._fileCache;
    const l = this._sounds.length;
    while (f.length < l) {
      const octaveList = [];
      for (let i = 0; i < 8; i++) {
        const noteList = {};
        for (const k in this._notes) {
          noteList[k] = {};
        }
        octaveList.push(noteList);
      }
      f.push(octaveList);
    }
  });
  setPriv('_clearCache', function () {
    this._fileCache = [];
    this._resizeCache();
  });
  setPub('generate', function (sound, note, octave, duration) {
    let thisSound = this._sounds[sound];
    if (!thisSound) {
      for (var i = 0; i < this._sounds.length; i++) {
        if (this._sounds[i].name == sound) {
          thisSound = this._sounds[i];
          sound = i;
          break;
        }
      }
    }
    if (!thisSound) { throw new Error(`Invalid sound or sound ID: ${sound}`); }
    const t = (new Date()).valueOf();
    this._temp = {};
    octave |= 0;
    octave = Math.min(8, Math.max(1, octave));
    const time = !duration ? 2 : parseFloat(duration);
    if (typeof (this._notes[note]) === 'undefined') { throw new Error(`${note} is not a valid note.`); }
    if (typeof (this._fileCache[sound][octave - 1][note][time]) !== 'undefined') {
      if (this._debug) { console.log((new Date()).valueOf() - t, 'ms to retrieve (cached)'); }
      return this._fileCache[sound][octave - 1][note][time];
    }
    const frequency = this._notes[note] * 2 ** (octave - 4);
    const sampleRate = this._sampleRate;
    const volume = this._volume;
    const channels = this._channels;
    const bitsPerSample = this._bitsPerSample;
    const attack = thisSound.attack(sampleRate, frequency, volume);
    const dampen = thisSound.dampen(sampleRate, frequency, volume);
    const waveFunc = thisSound.wave;
    const waveBind = { modulate: this._mod, vars: this._temp };
    let val = 0;
    const curVol = 0;

    const data = new Uint8Array(new ArrayBuffer(Math.ceil(sampleRate * time * 2)));
    const attackLen = (sampleRate * attack) | 0;
    const decayLen = (sampleRate * time) | 0;

    for (var i = 0 | 0; i !== attackLen; i++) {
      val = volume * (i / (sampleRate * attack)) * waveFunc.call(waveBind, i, sampleRate, frequency, volume);

      data[i << 1] = val;
      data[(i << 1) + 1] = val >> 8;
    }

    for (; i !== decayLen; i++) {
      val = volume * (1 - ((i - (sampleRate * attack)) / (sampleRate * (time - attack)))) ** dampen * waveFunc.call(waveBind, i, sampleRate, frequency, volume);

      data[i << 1] = val;
      data[(i << 1) + 1] = val >> 8;
    }

    const out = [
      'RIFF',
      pack(1, 4 + (8 + 24/* chunk 1 length */) + (8 + 8/* chunk 2 length */)), // Length
      'WAVE',
      // chunk 1
      'fmt ', // Sub-chunk identifier
      pack(1, 16), // Chunk length
      pack(0, 1), // Audio format (1 is linear quantization)
      pack(0, channels),
      pack(1, sampleRate),
      pack(1, sampleRate * channels * bitsPerSample / 8), // Byte rate
      pack(0, channels * bitsPerSample / 8),
      pack(0, bitsPerSample),
      // chunk 2
      'data', // Sub-chunk identifier
      pack(1, data.length * channels * bitsPerSample / 8), // Chunk length
      data,
    ];
    const blob = new Blob(out, { type: 'audio/wav' });
    const dataURI = URL.createObjectURL(blob);
    this._fileCache[sound][octave - 1][note][time] = dataURI;
    if (this._debug) { console.log((new Date()).valueOf() - t, 'ms to generate'); }
    return dataURI;
  });
  setPub('play', function (sound, note, octave, duration, volume) {
    const src = this.generate(sound, note, octave, duration);
    const audio = new Audio(src);
    if (volume != null) {
      if (volume <= 0) return true;
      audio.volume = volume > 1 ? 1 : volume;
    }
    audio.play();
    return true;
  });
  setPub('debug', function () { this._debug = true; });
  setPub('createInstrument', function (sound) {
    let n = 0;
    let found = false;
    if (typeof (sound) === 'string') {
      for (let i = 0; i < this._sounds.length; i++) {
        if (this._sounds[i].name == sound) {
          found = true;
          n = i;
          break;
        }
      }
    } else if (this._sounds[sound]) {
      n = sound;
      sound = this._sounds[n].name;
      found = true;
    }
    if (!found) { throw new Error(`Invalid sound or sound ID: ${sound}`); }
    _encapsulated = true;
    const ins = new AudioSynthInstrument(this, sound, n);
    _encapsulated = false;
    return ins;
  });
  setPub('listSounds', function () {
    const r = [];
    for (let i = 0; i < this._sounds.length; i++) {
      r.push(this._sounds[i].name);
    }
    return r;
  });
  setPriv('__init__', function () {
    this._resizeCache();
  });
  setPub('loadSoundProfile', function (...args) {
    args.forEach((o) => {
      if (!(o instanceof Object)) {
        throw new Error('Invalid sound profile.');
      }
      this._sounds.push(o);
    });
    this._resizeCache();
    return true;
  });
  setPub('loadModulationFunction', function (...args) {
    args.forEach((f) => {
      if (typeof f !== 'function') {
        throw new Error('Invalid modulation function.');
      }
      this._mod.push(f);
    });
    return true;
  });
  AudioSynthInstance = new AudioSynth();
  Synth = AudioSynthInstance;
}());

Synth.loadModulationFunction(
  (i, sampleRate, frequency, x) => 1 * Math.sin(2 * Math.PI * ((i / sampleRate) * frequency) + x),
  (i, sampleRate, frequency, x) => 1 * Math.sin(4 * Math.PI * ((i / sampleRate) * frequency) + x),
  (i, sampleRate, frequency, x) => 1 * Math.sin(8 * Math.PI * ((i / sampleRate) * frequency) + x),
  (i, sampleRate, frequency, x) => 1 * Math.sin(0.5 * Math.PI * ((i / sampleRate) * frequency) + x),
  (i, sampleRate, frequency, x) => 1 * Math.sin(0.25 * Math.PI * ((i / sampleRate) * frequency) + x),
  (i, sampleRate, frequency, x) => 0.5 * Math.sin(2 * Math.PI * ((i / sampleRate) * frequency) + x),
  (i, sampleRate, frequency, x) => 0.5 * Math.sin(4 * Math.PI * ((i / sampleRate) * frequency) + x),
  (i, sampleRate, frequency, x) => 0.5 * Math.sin(8 * Math.PI * ((i / sampleRate) * frequency) + x),
  (i, sampleRate, frequency, x) => 0.5 * Math.sin(0.5 * Math.PI * ((i / sampleRate) * frequency) + x),
  (i, sampleRate, frequency, x) => 0.5 * Math.sin(0.25 * Math.PI * ((i / sampleRate) * frequency) + x),
);

Synth.loadSoundProfile(
  {
    name: 'piano',
    attack() { return 0.002; },
    dampen(sampleRate, frequency, volume) {
      return (0.5 * Math.log((frequency * volume) / sampleRate)) ** 2;
    },
    wave(i, sampleRate, frequency, volume) {
      const base = this.modulate[0];
      return this.modulate[1](
        i,
        sampleRate,
        frequency,
        base(i, sampleRate, frequency, 0) ** 2
                + (0.75 * base(i, sampleRate, frequency, 0.25))
                + (0.1 * base(i, sampleRate, frequency, 0.5)),
      );
    },
  },
  {
    name: 'organ',
    attack() { return 0.3; },
    dampen(sampleRate, frequency) { return 1 + (frequency * 0.01); },
    wave(i, sampleRate, frequency) {
      const base = this.modulate[0];
      return this.modulate[1](
        i,
        sampleRate,
        frequency,
        base(i, sampleRate, frequency, 0)
                + 0.5 * base(i, sampleRate, frequency, 0.25)
                + 0.25 * base(i, sampleRate, frequency, 0.5),
      );
    },
  },
  {
    name: 'acoustic',
    attack() { return 0.002; },
    dampen() { return 1; },
    wave(i, sampleRate, frequency) {
      const { vars } = this;
      vars.valueTable = !vars.valueTable ? [] : vars.valueTable;
      if (typeof (vars.playVal) === 'undefined') { vars.playVal = 0; }
      if (typeof (vars.periodCount) === 'undefined') { vars.periodCount = 0; }

      const { valueTable } = vars;
      const { playVal } = vars;
      const { periodCount } = vars;

      const period = sampleRate / frequency;
      const p_hundredth = Math.floor((period - Math.floor(period)) * 100);

      let resetPlay = false;

      if (valueTable.length <= Math.ceil(period)) {
        valueTable.push(Math.round(Math.random()) * 2 - 1);

        return valueTable[valueTable.length - 1];
      }

      valueTable[playVal] = (valueTable[playVal >= (valueTable.length - 1) ? 0 : playVal + 1] + valueTable[playVal]) * 0.5;

      if (playVal >= Math.floor(period)) {
        if (playVal < Math.ceil(period)) {
          if ((periodCount % 100) >= p_hundredth) {
            // Reset
            resetPlay = true;
            valueTable[playVal + 1] = (valueTable[0] + valueTable[playVal + 1]) * 0.5;
            vars.periodCount++;
          }
        } else {
          resetPlay = true;
        }
      }

      const _return = valueTable[playVal];
      if (resetPlay) { vars.playVal = 0; } else { vars.playVal++; }

      return _return;
    },
  },
  {
    name: 'edm',
    attack() { return 0.002; },
    dampen() { return 1; },
    wave(i, sampleRate, frequency) {
      const base = this.modulate[0];
      const mod = this.modulate.slice(1);
      return mod[0](
        i,
        sampleRate,
        frequency,
        mod[9](
          i,
          sampleRate,
          frequency,
          mod[2](
            i,
            sampleRate,
            frequency,
            base(i, sampleRate, frequency, 0) ** 3
                        + base(i, sampleRate, frequency, 0.5) ** 5
                        + base(i, sampleRate, frequency, 1) ** 7,
          ),
        )
                + mod[8](
                  i,
                  sampleRate,
                  frequency,
                  base(i, sampleRate, frequency, 1.75),
                ),
      );
    },
  },
);

export { Synth, AudioSynth, AudioSynthInstrument };
