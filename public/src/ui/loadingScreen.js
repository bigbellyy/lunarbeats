const LoadingScreen = {
    show: (duration) => {
        const elements = LoadingScreen.elements;
        if (elements.canvas === undefined) {
            LoadingScreen.create(duration);
        }
        else {
            document.body.append(elements.div);
            document.body.append(elements.canvas);

            elements.div.style.zIndex = String(LoadingScreen.zIndex)
            elements.canvas.style.zIndex = String(LoadingScreen.zIndex + 1);

            animate.fadeIn(elements.div, duration);
            animate.fadeIn(elements.canvas, duration);
        }

        LoadingScreen.visible = true;
        LoadingScreen.update();

        //Fun thing
        elements.canvas.onmousedown = function () {
            LoadingScreen.noteToSpawn = Math.floor(getRandomNumber(0, 6));
        }
        LoadingScreen.notes = [];
        const spawnInterval = setInterval(() => {
            if (LoadingScreen.visible === false || LoadingScreen.stopNotes === true) {
                clearInterval(spawnInterval);
            }
            LoadingScreen.noteToSpawn = Math.floor(getRandomNumber(0, 6));
        }, 500)
    },
    hide: (duration) => {
        duration = duration || 1000;

        const elements = LoadingScreen.elements;

        const div = elements.div;
        const canvas = elements.canvas;

        animate.fadeOut(div, duration);
        animate.fadeOut(canvas, duration);

        setTimeout(() => {
            LoadingScreen.visible = false;
            LoadingScreen.stopNotes = false;
            div.remove();
            canvas.remove();
        }, duration);
    },
    update: () => {
        if (LoadingScreen.visible === true) {
            window.requestAnimationFrame(LoadingScreen.update);
        }

        const elements = LoadingScreen.elements;
        const canvas = elements.canvas;
        const div = elements.div;
        const ctx = canvas.getContext("2d");

        //Refresh canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //Lane properties
        const lineCount = 7;
        const lineWidth = 2;
        const lineHeight = canvas.height;
        const laneSpace = canvas.width / lineCount;

        //Note properties
        const noteHeight = 10;
        const noteWidth = laneSpace;

        renderLines();
        renderNotes();

        function renderLines() {
            for (let i = 0; i < lineCount; ++i) {
                const x = i * laneSpace + laneSpace / 2;
                const y = 0;


                const gradient = ctx.createLinearGradient(x, y, x, y + lineHeight);

                gradient.addColorStop(0, "rgba(255,255,255,0)");
                gradient.addColorStop(.5, "rgba(255,255,255,1)")
                gradient.addColorStop(1, "rgba(255,255,255,0)");

                Canvas.drawRect(ctx, x, y, lineWidth, lineHeight, gradient)
            }
        }

        function renderNotes() {
            const notes = LoadingScreen.notes;
            for (let i = 0; i < notes.length; ++i) {
                const obj = notes[i];

                const lane = obj.lane;
                const x = lane * laneSpace + lineWidth / 2 + laneSpace / 2;
                const y = obj.y;
                const width = noteWidth;
                const height = noteHeight;

                const opacity = -(Math.abs(lineHeight / 2 - y) / (lineHeight / 2)) + 1;

                const color = Color.new(255, 255, 255, opacity)

                Canvas.drawRect(ctx, x, y, width, height, color);

                obj.y += 3 * fpsMultiplier;
            }

            if (LoadingScreen.noteToSpawn !== false) {
                createNote(LoadingScreen.noteToSpawn);
                LoadingScreen.noteToSpawn = false;
            }
        }

        function createNote(lane) {
            const obj = {
                y: 0,
                lane: lane
            }
            LoadingScreen.notes.push(obj);
        }
    },
    create: (duration) => {
        //Create elements
        const screenWidth = Math.max(screen.width, screen.height)
        const screenHeight = Math.min(screen.width, screen.height)

        const div = DivHelper.new("0px", "0px", "100vw", "100vh");
        const canvas = Canvas.new("37.5vw", "27.5vh", screenWidth / 4, screenHeight / 4);

        div.setAttribute("class", "loadingScreen");
        canvas.setAttribute("class", "loadingScreen");

        div.setAttribute("id", "loadingScreenDiv");
        canvas.setAttribute("id", "loadingScreenCanvas");

        LoadingScreen.elements.div = div;
        LoadingScreen.elements.canvas = canvas;

        //Animate
        div.style.opacity = "0";
        canvas.style.opacity = "0";

        div.style.zIndex = String(LoadingScreen.zIndex)
        canvas.style.zIndex = String(LoadingScreen.zIndex + 1);

        animate.fadeIn(div, duration);
        animate.fadeIn(canvas, duration);
    },
    elements: {},
    visible: false,
    notes: [],
    noteToSpawn: 0,
    zIndex: 2
}