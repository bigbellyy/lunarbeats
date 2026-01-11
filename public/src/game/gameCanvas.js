class GameCanvas {
    width = 1;
    height = 1;
    scale = 1;
    laneSpaceFactor = 26.5;
    laneSpace = window.innerWidth / this.laneSpaceFactor * this.scale; //How far the space between the lanes are (w/26.5 makes 75 if 1920)
    laneWidth = 2 * this.scale;
    timePosition = 0;
    notes = [];
    lanesArray = []; //Physical data of lanes
    scoreCacheData = {}; //Keeps track of where each grade is located
    scoreData = []; //Keeps track of score text objects
    scoreGradeData = ["F", "D", "C", "B", "A"];

    //Note properties
    noteWidth = this.laneSpace
    noteHeight = 12.5 * this.scale;

    //Game properties
    playing = false;
    composing = false;
    perspectiveMode = true;

    //Input data
    inputData = [];

    //Composing properties
    songBPM = 60;
    songOffset = 0;
    BPMDetail = 1;
    beatsArray = [];
    snapToBeatLines = true;
    overrideUpdate = false;

    //Youtube property
    isUsingYouTube = true;
    youtubeOffset = .1;

    //Update gradient markers
    gradientDeltas = {};

    //Cache
    scoreText = [];

    //Object properties
    createdTime = Date.now();
    transtionInitial = Date.now();

    //Performance properties
    currentTick = 0;

    constructor(lanes, left, top, laneColor, width, height, duration, isUsingYouTube, alter) { //height and width are scaled
        const w = window.innerWidth * width || this.width;
        const h = window.innerHeight * height || this.height;

        //Create canvas
        const canvas = Canvas.new(left, top, w, h);
        canvas.style.opacity = "0";
        canvas.style.transform = String("perspective(" + window.innerHeight / 2 + "px)" + "rotateX(55deg)");
        canvas.setAttribute("id", "gameCanvas");
        animate.fadeIn(canvas, duration);

        const cacheCanvas = Canvas.new(left, top, w, h);
        cacheCanvas.remove();
        const cacheCtx = cacheCanvas.getContext("2d");

        const textCanvas = Canvas.new(left, top, w, h);
        textCanvas.style.zIndex = "10";
        textCanvas.setAttribute("id", "textCanvas");
        textCanvas.style.opacity = "0";
        animate.fadeIn(textCanvas, duration);

        this.cacheCanvas = cacheCanvas;
        this.cacheCtx = cacheCtx;
        this.textCanvas = textCanvas;

        this.isUsingYouTube = isUsingYouTube;
        this.canvas = canvas;
        this.lanes = lanes;
        this.left = left;
        this.top = top;
        this.laneColor = laneColor;
        this.widthScalar = width;
        this.heightScalar = height;
        this.width = window.innerWidth * this.widthScalar;
        this.height = window.innerHeight * this.heightScalar;
        this.ctx = canvas.getContext("2d");
        this.alter = alter

        //Set settings
        this.laneSpaceFactor = -localStorage.getItem("laneSpace") + this.laneSpaceFactor || this.laneSpaceFactor;

        //Set up input data array
        for (let i = 0; i < lanes.length; ++i) {
            const obj = {
                key: lanes.substring(i, i + 1),
                value: 0, //How "activated" this lane will be
                tweenValue: 0,
                lock: false,
                color: "rgba(255,255,255,1)"
            }
            this.inputData.push(obj);
        }

        window.onresize = this.updateDimensions.bind(this);

        //Begin rendering
        this.render();
        this.updateDimensions();
    }
    render() {
        if (this.canvas) {
            window.requestAnimationFrame(() => this.render());
        }
        else {
            this.textCanvas.remove();
            this.cacheCanvas.remove();

            this.textCanvas = undefined;
            this.cacheCanvas = undefined;
        }

        if (this.canvas.width != this.width || this.canvas.height != this.height) {
            this.canvas.height = this.height;
            this.canvas.width = this.width;

            // this.cacheCanvas.height = this.height;
            // this.cacheCanvas.width = this.width;

            // this.canvas.style.width = this.width / this.scale + "px";
            // this.canvas.style.height = this.height / this.scale + "px";
            this.canvas.style.width = "100vw";
            this.canvas.style.height = "100vh";
        }

        this.targetLine = this.height / 1.25;

        //Accomodate different windows
        this.originalHeight = 929 * this.scale;
        this.heightOffset = (this.height - (this.originalHeight)) / this.scale;

        //Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        //If used for menu screen
        if (this.alter) {
            this.renderLanes();
            this.renderNotesAlternative();
        }
        else {
            //Render elements
            this.renderLanes();
            this.renderNotes();
            this.renderInput();
        }
        if (this.composing === true) {
            this.renderBeatLines();
            if (this.playing) {
                this.updateTimePositionSliderValue();
            }
            if (!this.overrideUpdate) {
                this.updateTimePosition();
            }
        }
        else {
            this.renderScores();
        }

        //Update settings
        Game.scrollingSpeed = clamp(Math.floor((1000 * localStorage.getItem("scrollingSpeed"))) || Game.scrollingSpeed, 50, 1000);

        //Update gradients (performance)
        // this.updateDimensions();

        //Update timeposition
        if (this.playing === true) {
            //Update settings (moved down)
            if (this.isUsingYouTube) {
                Game.gameAudio.setVolume(localStorage.getItem("musicVolume") * 100 || 100);
            }
            else {
                Game.gameAudio.volume = (localStorage.getItem("musicVolume") * 1 || 1);
            }

            this.updateTimePosition();
            //Play audio
            if (this.isUsingYouTube && (Game.gameAudio.getPlayerState() === 2 || Game.gameAudio.getPlayerState() === -1 || Game.gameAudio.getPlayerState() === 5)) {
                Game.gameAudio.playVideo();
            }
            else if (Game.gameAudio.paused) {
                Game.gameAudio.play();
            }
        }
        else {
            //Pause audio and sync up with timePosition
            if (this.isUsingYouTube) {
                Game.gameAudio.pauseVideo();
            }
            else {
                Game.gameAudio.pause();
            }
            // Game.gameAudio.currentTime = this.timePosition;

            //Transition when game begins
            const initialTime = this.transtionInitial;

            if (this.timePosition < 0 && this.composing === false) {
                const deltaTime = initialTime - Date.now();
                this.timePosition -= deltaTime / 1000;
                this.transtionInitial = Date.now();

                if (this.timePosition >= 0) {
                    this.playing = true;
                }
            }
        }

        if (this.currentTick >= 1000) {
            this.currentTick = 0;
        }
        ++this.currentTick;
    }

    updateDimensions() {
        this.width = window.innerWidth * this.widthScalar * this.scale;
        this.height = window.innerHeight * this.heightScalar * this.scale;

        this.laneSpace = window.innerWidth / this.laneSpaceFactor * this.scale;
        this.noteWidth = this.laneSpace;

        // const textOffset = this.laneWidth;

        const ctx = this.cacheCtx;

        ctx.clearRect(0, 0, this.width, this.height);

        const updateLaneGradient = () => {
            const laneGradientColor = Game.baseSongData[Game.selectedSong].laneGradient;
            const laneGradient = ctx.createLinearGradient(0, 0, 0, this.height / 1.2);

            laneGradient.addColorStop(0, laneGradientColor.color1);
            laneGradient.addColorStop(.7, laneGradientColor.color2);
            laneGradient.addColorStop(.75, laneGradientColor.color2);
            laneGradient.addColorStop(1, laneGradientColor.color3);
            Canvas.drawRect(ctx, 0, 0, this.laneWidth, this.height / 1.2, laneGradient);
        }

        const updateBottomLine = () => {
            const laneCount = this.laneCount;
            const x = this.width / 2 - laneCount / 2 * this.laneSpace - this.laneSpace;
            const w = this.laneSpace * this.lanes.length + this.laneSpace * 2;
            const gradient = ctx.createLinearGradient(x, 0, w + x, 0);
            const laneGradient = Game.baseSongData[Game.selectedSong].laneGradient;

            let color2 = parseColor(laneGradient.color2)
            color2 = Color.new(color2[0], color2[1], color2[2], 1)

            gradient.addColorStop(.1, laneGradient.color1);
            gradient.addColorStop(.5, color2);
            gradient.addColorStop(.9, laneGradient.color3);

            this.bottomLine = gradient;
        }

        const updateTextCanvas = () => {
            const textCanvas = this.textCanvas;
            const textCtx = textCanvas.getContext("2d");

            textCanvas.width = this.width * (2 / this.scale);
            textCanvas.height = this.height * (2 / this.scale);

            textCanvas.style.width = "100vw";
            textCanvas.style.height = "100vh";

            textCanvas.style.transform = this.perspectiveMode ? `perspective(${window.innerHeight / 2}px) rotateX(${55}deg)` : "none";

            const laneSpace = this.laneSpace * (2 / this.scale);

            for (let i = 0; i < this.laneCount; ++i) {
                const x = (textCanvas.width / 2 - this.lanes.length / 2 * laneSpace + (i * laneSpace));
                const color = Game.currentSongData ? Game.currentSongData.laneGradient.color2 : "rgb(255,255,255)";

                const fontSize = Math.floor(laneSpace / 6);
                Canvas.drawText(textCtx, x + laneSpace / 2 - fontSize / 5, textCanvas.height / 1.18, this.lanes[i], color, String(fontSize) + "px" + " Serif");
            }
        }

        const updateLongNoteGradient = () => {
            let color = Game.currentSongData ? Game.currentSongData.noteColor : "rgb(255,255,255)";
            color = color ? color : "rgb(255,255,255)";

            this.longNoteGradient = ctx.createLinearGradient(0, 0, 0, this.height);

            this.longNoteGradient.addColorStop(0, "rgba(255,255,255,0)");
            this.longNoteGradient.addColorStop(1, color);
        }

        const updateScoreText = () => {
            const fontSize = Math.floor(this.laneSpace / 3);

            const colorData = [
                "rgb(50,50,50)",
                "rgb(255,225,225)",
                "rgb(255,255,225)",
                "rgb(225,255,225)",
                "rgb(225,255,255)"
            ]

            const grades = this.scoreGradeData;
            const offsetX = 10;
            const offsetY = 100;


            for (let i = 0; i < grades.length; ++i) {
                const letter = grades[i];

                const x = fontSize * i + offsetX;
                const y = offsetY;

                const color = colorData[i];

                Canvas.drawText(ctx, x, y, letter, color, String(fontSize) + "px" + " Serif");

                this.scoreCacheData[letter] = {
                    x: x,
                    y: y,
                    fontSize: fontSize
                }
            }
        }

        // const perspectiveDistance = this.composing ? 464.5 : window.innerHeight / 2;
        // const rotation = this.composing ? Math.tanh(perspectiveDistance / window.innerHeight) * (180 / Math.PI) + 29 : 55;

        this.canvas.style.transform = this.perspectiveMode ? `perspective(${window.innerHeight / 2}px) rotateX(${55}deg)` : "none";

        updateLaneGradient();
        updateBottomLine();
        updateTextCanvas();
        updateLongNoteGradient();
        updateScoreText();

        //update fonts
        // const fontSize = this.laneSpace / 6;
        // ctx.font = String(fontSize) + "px" + " Serif";
    }

    renderScores() {
        const scoreData = this.scoreData;

        for (let i = 0; i < scoreData.length; ++i) {
            const scoreObj = scoreData[i];

            const letter = scoreObj.letter;

            const cacheLocationX = this.scoreCacheData[letter].x;
            const cacheLocationY = this.scoreCacheData[letter].y;
            const fontSize = this.scoreCacheData[letter].fontSize;

            const destinationX = scoreObj.x + fontSize / .85;
            const destinationY = scoreObj.y;

            this.ctx.globalAlpha = scoreObj.opacity;
            this.ctx.drawImage(this.cacheCanvas, cacheLocationX, cacheLocationY - fontSize, fontSize, fontSize, destinationX, destinationY, fontSize, fontSize);

            scoreObj.opacity -= 0.02 * fpsMultiplier;
            scoreObj.y += scoreObj.vY;
            scoreObj.vY += .03 * fpsMultiplier;

            scoreObj.opacity = Math.max(scoreObj.opacity, 0);

            this.ctx.globalAlpha = 1;

            if (scoreObj.opacity <= 0) {
                scoreData.splice(i, 1);
                i--;
            }
        }
    }

    addScore(lane, letter) {
        letter = this.scoreGradeData[letter];

        const scoreObj = {
            x: this.lanesArray[lane],
            y: this.height / 1.4,
            vY: 0,
            letter: letter,
            opacity: 1
        }

        this.scoreData.push(scoreObj);
    }

    renderLanes() {
        const lanes = this.lanes;
        const laneCount = lanes.length
        this.laneCount = laneCount;
        const ctx = this.ctx;
        for (let i = 0; i <= laneCount; ++i) {
            const x = (this.width / 2 - laneCount / 2 * this.laneSpace + (i * this.laneSpace));
            const y = 0;

            const height = this.height / 1.2;

            this.lanesArray[i] = x;

            if (this.alter) {
                return;
            }

            // Canvas.drawRect(ctx, x, y, this.laneWidth, this.height / 1.2, this.laneGradient);

            ctx.drawImage(this.cacheCanvas, 0, 0, this.laneWidth, height, x, y, this.laneWidth, Math.floor(height));
            // ctx.drawImage(this.cacheCanvas,x,y);

            //Draw lane text
            // if (i != laneCount) { //Workaround for undefined thing
            //     const textOffset = this.laneWidth;  
            //     const fontSize = Math.floor(this.laneSpace / 6);

            //     // Canvas.drawText(ctx, x + this.laneSpace / 2 - fontSize / 5, this.height / 1.18, lanes[i], laneGradient.color2, String(fontSize) + "px" + " Serif");
            //     console.log(x + this.laneSpace / 2 - fontSize / 5 + textOffset)

            //     ctx.drawImage(this.cacheCanvas, 
            //     x + this.laneSpace / 2 - fontSize / 5 + textOffset,
            //     100 - fontSize,
            //     fontSize,
            //     fontSize,
            //     x + this.laneSpace / 2 - fontSize / 5,
            //     this.height / 1.22,
            //     fontSize,
            //     fontSize,)
            // }


        }
        //Debounce
        this.laneDataCreated = true;

        //Bottom line
        // if (this.composing) {
        const x = this.width / 2 - laneCount / 2 * this.laneSpace - this.laneSpace;
        const w = this.laneSpace * this.lanes.length + this.laneSpace * 2;
        Canvas.drawRect(ctx, x, this.targetLine, w, this.laneWidth / 1.5, this.bottomLine); //was this.height/1.25
        // }

    }
    createNote(lane, timePosition, timePositionEnd, pianoNote) { //Time position end for the hold down notes
        //Create note on nearest beat
        const beatsArray = this.beatsArray;

        let closest = beatsArray[0];
        let closestIndex = 0;

        for (let i = 0; i < beatsArray.length; ++i) {
            const newTimePosition = beatsArray[i];

            const distance = Math.abs(timePosition - newTimePosition);

            if (distance < closest) {
                closestIndex = i;
                closest = distance;
            }
        }

        let closestEnd = beatsArray[0];
        let closestIndexEnd = 0;

        for (let i = 0; i < beatsArray.length; ++i) {
            if (!timePositionEnd) {
                break;
            }
            const newTimePosition = beatsArray[i];

            const distance = Math.abs(timePositionEnd - newTimePosition);

            if (distance < closestEnd) {
                closestIndexEnd = i;
                closestEnd = distance;
            }
        }
        //Remove duplicates
        for (let i = 0; i < this.notes.length; ++i) {
            const note = this.notes[i];

            if (note.timePosition === beatsArray[closestIndex] && note.lane === lane) {
                return;
            }

            if (document.querySelector("#snapToOtherNotesInput").checked) {
                for (let j = 0; j < this.notes.length; ++j) {
                    const noteB = this.notes[j];

                    if (note != noteB && note.timePosition === noteB.timePosition && note.lane == noteB.lane) {
                        // this.selectNote(note);
                        return;
                    }
                }
            }
        }

        if (!this.snapToBeatLines) {
            timePosition = timePosition;
            timePositionEnd = timePositionEnd;
        }
        else {
            timePosition = beatsArray[closestIndex];
            timePositionEnd = timePositionEnd === false || closestIndex === closestIndexEnd ? false : beatsArray[closestIndexEnd];
        }


        const note = {
            lane: lane,
            timePosition: timePosition,
            timePositionEnd: timePositionEnd,
            pianoNote: pianoNote || false
        }
        this.notes.push(note);
    }

    selectNote(note) { }

    renderNotes() {
        const notes = this.notes;
        const scale = this.scale;

        for (let i = 0; i < notes.length; ++i) {
            const note = notes[i];

            //Calculate Y position
            let noteY = (this.timePosition + note.timePosition) * scale;
            noteY = (noteY - this.targetLine) * Game.scrollingSpeed + this.targetLine;
            noteY += (this.heightOffset * Game.scrollingSpeed) * 0.8 * this.scale;

            noteY = Math.floor(noteY);

            if ((noteY < 0 || noteY > this.height) && (note.timePositionEnd === undefined || note.timePositionEnd == false)) {
                continue;
            }

            let height = note.timePositionEnd ? Math.abs(note.timePositionEnd - note.timePosition) * this.scale : this.noteHeight;

            //Lower transparency of notes near edges
            let opacity = 0;

            let scaleOpacity = this.scale >= 2 ? 0 : 100;

            const targetLineFactor = 1.2;
            if (noteY > 0 && noteY < this.targetLine) {
                opacity = clamp(noteY / (500 - scaleOpacity), 0, 1);
            }
            else if (noteY > this.targetLine) {
                opacity = 0;
            }

            //Long note opacity
            if (note.timePositionEnd) {
                const newY = noteY + (height * Game.scrollingSpeed);
                if (newY > 0 && noteY < this.targetLine / targetLineFactor) {
                    opacity = 1;
                }
            }

            if (opacity <= 0) {
                continue;
            }

            if (note.tagged) {
                opacity = Math.min(.25, opacity);
            }

            // noteY = noteY + (this.targetLine - noteY) * this.timePosition/((note.timePosition - this.targetLine));
            const noteX = (this.width / 2 - this.laneCount / 2 * this.laneSpace + (note.lane * this.laneSpace) + this.laneWidth / 2);
            const width = this.noteWidth;
            let color = Game.currentSongData.noteColor || "rgb(255,255,255)";

            color = parseColor(color);

            color = Color.new(color[0], color[1], color[2], opacity);

            if (height !== this.noteHeight) { //Long notes
                let longHeight = clamp(this.targetLine - (noteY), 0, height * Game.scrollingSpeed);

                const colorStopOne = note.tagged && Game.gameCombo == 0 ? "rgba(50,50,50,.25)" : this.longNoteGradient;

                const widthTween = Math.floor(note.widthTween) || 0;
                const longWidth = clamp(width / 2 + widthTween, width / 2, width) || width / 2;

                // Canvas.drawRect(this.ctx, noteX + (longWidth/2) - widthTween, noteY, longWidth, longHeight, colorStopOne);

                this.ctx.fillStyle = colorStopOne;
                this.ctx.fillRect(noteX + (longWidth / 2) - widthTween, noteY, longWidth, longHeight)

                height = this.noteHeight;

                Canvas.drawRect(this.ctx, noteX, noteY + longHeight, width, height, color);
            }

            Canvas.drawRect(this.ctx, noteX, noteY, width, height, color);
        }
    }
    renderInput() {
        const inputData = this.inputData;
        const ctx = this.ctx;
        const lanesArray = this.lanesArray;

        const songData = Game.baseSongData[Game.selectedSong];

        for (let i = 0; i < inputData.length; ++i) {
            // const lightEffectValue = Game.lightEffectValue !== undefined && Game.lightEffectValue !== NaN ? Game.lightEffectValue : 0;

            const obj = inputData[i];
            const value = obj.value * this.scale;
            const speed = .25 * fpsMultiplier;
            const tweenValue = Math.floor(obj.tweenValue + (value - obj.tweenValue) * speed);

            const offsetWidth = 1; //math.floor errors
            const x = lanesArray[i];
            const y = this.height / 1.2 - tweenValue;
            const width = this.laneSpace + offsetWidth;
            const height = tweenValue;

            let gradient = undefined;

            const color = obj.color || songData.noteColor || songData.laneGradient.color2;

            if (!Game.lowDetailMode) {
                gradient = ctx.createLinearGradient(0, y, 0, height + y);

                gradient.addColorStop(0, "rgba(255,255,255,0)");
                gradient.addColorStop(1, color);
            }
            else {
                gradient = color;
            }

            Canvas.drawRect(ctx, x, y, width, height, gradient);

            if (obj.lock === false) {
                // obj.value = obj.value + (0 - obj.value) * .025;
                obj.value -= 1 * fpsMultiplier;
            }
            // else {
            //     obj.value += getRandomNumber(-1, 1) * lightEffectValue/10;
            //     obj.value = clamp(obj.value, Game.inputReach - 50, Game.inputReach + 50)
            // }
            obj.value = clamp(obj.value, 0, 10000)
            obj.tweenValue = tweenValue;
        }
    }
    renderBeatLines() {
        const songLength = this.isUsingYouTube ? Game.gameAudio.getDuration() : Game.gameAudio.duration;
        const beatCount = (songLength / 60) * (this.songBPM * this.BPMDetail);
        const factor = 60 / (this.songBPM * this.BPMDetail);

        this.beatsArray = [];
        const beatsArray = this.beatsArray;


        for (let i = 0; i < beatCount; ++i) {
            const timePos = (this.targetLine / this.scale) - ((i) * factor) + (this.songOffset) / 60 - this.heightOffset * .8;
            let y = (this.timePosition + timePos) * this.scale;
            y = (y - this.targetLine) * Game.scrollingSpeed + this.targetLine;
            y += (this.heightOffset * Game.scrollingSpeed) * 0.8 * this.scale;

            beatsArray[i] = timePos;

            if (y < 0 || y > this.targetLine) {
                continue;
            }

            const x = this.width / 2 - this.lanes.length / 2 * this.laneSpace;
            const width = this.laneSpace * this.lanes.length;
            const height = 3;
            const color = i % this.BPMDetail === 0 ? "rgb(255,255,255)" : "rgba(255,255,255,.25)";
            Canvas.drawRect(this.ctx, x, y, width, height, color);
        }


    }
    updateTimePosition() {
        const audio = Game.gameAudio;

        let currentTime;
        if (this.isUsingYouTube) {
            const a = audio.getCurrentTime() + this.youtubeOffset;
            currentTime = this.timePosition + (a - this.timePosition) * (.1 * fpsMultiplier);
        }
        else {
            currentTime = audio.currentTime;
        }
        currentTime += Game.timeOffset / 100;
        // console.log(audio.getPlayerState() + " " + (currentTime) + " " + (this.timePosition))

        //Fixish jumping timeposition bug
        if (currentTime - this.timePosition < 0 && Math.abs(currentTime - this.timePosition) < 1 && this.isUsingYouTube) {
            // currentTime -= (currentTime - this.timePosition);
            // return;
        }
        this.timePosition = currentTime;
    }
    removeNote(index) {
        this.notes.splice(index, 1);
    }
    //Compose methods
    noteHit(timePosition, lane) { //Returns note index at timeposition
        const notes = this.notes;

        for (let i = 0; i < notes.length; ++i) {
            const note = notes[i];
            const tP = note.timePosition;
            const tPEnd = note.timePositionEnd;
            const laneNew = note.lane;

            if (tPEnd !== false) {
                if (timePosition < tPEnd && timePosition > tP && lane === laneNew) {
                    return i;
                }
            }

            if (Math.abs(timePosition - tP) < this.noteHeight / Game.scrollingSpeed && lane === laneNew) {
                return i;
            }
        }
        return false;
    }
    updateTimePositionSliderValue() {
        const audio = Game.gameAudio;
        let currentTime;
        if (this.isUsingYouTube) {
            currentTime = audio.getCurrentTime();
        }
        else {
            currentTime = audio.currentTime;
        }
        if (this.currentTick % 25 == 0) {
            document.getElementById("timePositionLabel").textContent = "TIME POSITION : " + Math.round(currentTime * 100) / 100;
        }
        $("#timePositionSlider").slider("value", currentTime);
    }

    setScale(scale) {
        this.scale = scale;

        this.laneSpace = this.laneSpace = window.innerWidth / this.laneSpaceFactor * this.scale;
        this.laneWidth = 2 * scale;
        this.noteWidth = this.laneSpace;
        this.noteHeight = 12.5 * this.scale;
    }
}