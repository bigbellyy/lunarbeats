const titleSongController = {
    init: () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();

        const source = audioCtx.createMediaElementSource(Game.titleSongAudio);
        const listen = audioCtx.createGain();

        source.connect(listen);
        listen.connect(analyser);
        listen.connect(audioCtx.destination);

        const frequencyData = new Uint8Array(analyser.frequencyBinCount);

        titleSongController.audioCtx = audioCtx;
        titleSongController.analyser = analyser;
        titleSongController.source = source;
        titleSongController.listen = listen;
        titleSongController.frequencyData = frequencyData;

        analyser.smoothingTimeConstant = titleSongController.smoothingTimeConstant;
    },
    getTitleSongValue: () => {
        const controller = titleSongController;

        const analyser = controller.analyser;
        const frequencyData = controller.frequencyData;

        analyser.getByteFrequencyData(frequencyData);

        let n = 0;

        for (let i = 0; i < frequencyData.length; ++i) {
            const v = frequencyData[i];
            n += v;
        }

        n /= frequencyData.length;

        return n;
    },
    play: () => {
        const titleSong = Game.titleSongAudio;
        titleSong.play();
    },
    pause: () => {
        const titleSong = Game.titleSongAudio;
        titleSong.pause();
    },
    remove: () => {
        const controller = titleSongController;

        const listen = controller.listen;
        const audioCtx = controller.audioCtx;
        const analyser = controller.analyser;
        const frequencyData = controller.frequencyData;
        const source = controller.source;

        source.disconnect();
        listen.disconnect();
        analyser.disconnect();
        audioCtx.close();
        frequencyData = undefined;

        source = undefined;
        listen = undefined;
        audioCtx = undefined;
        analyser = undefined;
        source = undefined;
    },
    fadeOut: () => {
        const audio = Game.titleSongAudio;

        const vol = { volume: audio.volume };

        $(vol).animate({
            volume: 0
        }, {
            duration: 1000,
            step: function () {
                audio.volume = vol.volume;
            }
        });
        setTimeout(() => {
            audio.pause();
        }, 1000);
    },
    audioCtx: undefined,
    smoothingTimeConstant: .85, //.8
    frequencyData: undefined,
    analyser: undefined,
    source: undefined,
    listen: undefined,
    stopUpdating: false,
    titleSongData: undefined
}