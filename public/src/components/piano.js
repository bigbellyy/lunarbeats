class Piano {
    whiteKeys = [
        "C",
        "D",
        "E",
        "F",
        "G",
        "A",
        "B"
    ];
    blackKeys = [
        "Db",
        "Eb",
        "",
        "Gb",
        "Ab",
        "Bb",
        ""
    ];
    piano = undefined;
    showing = false;
    constructor(left, top, pianoWidth, pianoHeight, octaveCount) {
        octaveCount = octaveCount || 1;

        const whiteKeysData = this.whiteKeys;
        const blackKeysData = this.blackKeys;

        const whiteKeysLength = whiteKeysData.length * octaveCount;
        const blackKeysLength = blackKeysData.length * octaveCount;

        const piano = createPiano();
        this.piano = piano;
        piano.style.opacity = "0";
        createKeys();

        const onKeyClick = (event) => {
            const div = event.target;
            if (this.onKeyClick) {
                this.onKeyClick(div);
            }
        }

        function createKeys() {
            createWhiteKeys();
            createBlackKeys();
        }

        function createWhiteKeys() {
            for (let i = 0; i < whiteKeysLength; ++i) {
                const left = `${i / whiteKeysLength * 100}%`;
                const width = `${1 / whiteKeysLength * 100}%`;
                const div = DivHelper.new(left, 0, width, pianoHeight);
                div.setAttribute("class", "whitePianoKey");
                div.setAttribute("id", whiteKeysData[i % whiteKeysData.length] + String(Math.floor(i / whiteKeysData.length) + 1))
                piano.append(div);

                div.onclick = function (event) {
                    onKeyClick(event);
                };
            }
        }
        function createBlackKeys() {
            for (let i = 0; i < blackKeysLength; ++i) {
                if (blackKeysData[i % blackKeysData.length] == "") {
                    continue;
                }
                const width = `${1 / whiteKeysLength * 50}%`;
                const left = `${i / whiteKeysLength * 100 + parseFloat(width) * 1.5}%`;
                const height = parseFloat(pianoHeight) / 1.5 + "vh";

                const div = DivHelper.new(left, 0, width, height);

                div.setAttribute("class", "blackPianoKey");
                div.setAttribute("id", blackKeysData[i % blackKeysData.length] + String(Math.floor(i / blackKeysData.length) + 1))
                piano.append(div);

                div.onclick = function (event) {
                    onKeyClick(event);
                };
            }
        }
        function createPiano() {
            const div = DivHelper.new(left, top, pianoWidth, pianoHeight);
            div.setAttribute("id", "piano");
            return div;
        }
    }

    onKeyClick(div) { }

    show(duration) {
        if (this.showing) {
            return;
        }
        duration = duration || 0;
        const piano = this.piano;
        piano.style.display = "inline";
        piano.style.opacity = "1";
        this.showing = true;
        // anime({
        //     targets: piano,
        //     opacity: 1,
        //     easing: globalEasing,
        //     duration: duration,
        //     complete: () => {
        //         this.showing = true;
        //     }
        // })
    }

    hide(duration) {
        if (!this.showing) {
            return;
        }
        duration = duration || 0;
        const piano = this.piano;
        piano.style.display = "none";
        piano.style.opacity = "1";
        this.showing = false;
        this.onKeyClick = undefined;
        // anime({
        //     targets : piano,
        //     opacity : 0,
        //     easing : globalEasing,
        //     duration : duration,
        //     complete : () => {
        //         piano.style.display = "none";
        //         this.showing = false;
        //         this.onKeyClick = undefined;
        //     }
        // })
    }
}