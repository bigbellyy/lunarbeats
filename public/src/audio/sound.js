class Sound {
    static ctxArray = [];
    constructor(instrument, options) {
        const audioCtx = new AudioContext();
        Sound.ctxArray.push(audioCtx);

        Soundfont.instrument(audioCtx, instrument, options).then(function (instrumentObject) {
            this.instrument = instrumentObject;
        }.bind(this))

        this.audioCtx = audioCtx;
    }
    play(note) {
        const instrument = this.instrument;
        instrument.play(note);
    }
    remove() {
        const index = findInArray(this.audioCtx, Sound.ctxArray);
        Sound.ctxArray.splice(index, 1);
        this.instrument = undefined;
        this.audioCtx.close();
    }
}