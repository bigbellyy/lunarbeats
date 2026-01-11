class AudioBars {
    canvas;
    left;
    top;
    width;
    height;
    cssWidth;
    cssHeight;
    detail = 10; //14
    middleBased = true;
    topBased = false;
    scale = 400; //ampitude idk why i named it scale (should be 500 ORIGINALLY)
    polygonMode = true;
    polygonGradientDistance = .15;
    hideBottomPart = true;
    constructor(left, top, width, height, cssWidth, cssHeight) {
        const canvas = Canvas.new(left, top, width, height);
        canvas.style.left = left;
        canvas.style.top = top;
        canvas.object = this;

        canvas.style.width = cssWidth ? cssWidth : undefined;
        canvas.style.height = cssHeight ? cssHeight : undefined;


        if (Game.lowDetailMode) {
            canvas.style.filter = "none";
        }

        const ctx = canvas.getContext("2d");
        this.ctx = ctx;

        this.canvas = canvas;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.cssWidth = cssWidth;
        this.cssHeight = cssHeight;

        if (this.polygonMode) {
            const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(.5 - this.polygonGradientDistance, "rgba(255,255,255,1)");
            gradient.addColorStop(.5, "rgba(255,255,255,0)");
            gradient.addColorStop(.5 + this.polygonGradientDistance, "rgba(255,255,255,1)");
            ctx.fillStyle = gradient;
        }
    }
    update(frequencyData) {
        const canvas = this.canvas;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        const data = frequencyData;

        this.detail = Game.lowDetailMode ? 25 : 10;

        const width = Math.floor(this.width / (data.length / this.detail));

        for (let i = 0; i < data.length / this.detail; ++i) {
            let v = Math.pow(frequencyData[i] / 1, 2) / this.scale;

            const volume = Game.titleSongAudio.volume;
            v += Math.pow(v * (1 - volume), 1.2);

            const x = Math.floor(width * (i));
            let y = this.middleBased ? this.height / 2 - v / 2 : 0;
            if (!this.middleBased) {
                y = this.topBased ? 0 : this.height - v;
            }

            if (this.polygonMode) {
                let v2 = Math.pow(frequencyData[i + 1] / 1, 2) / this.scale;
                v2 += Math.pow(v2 * (1 - volume), 1.2)
                let y1 = y;
                let x1 = x;
                let y2 = this.middleBased ? this.height / 2 - v2 / 2 : 0;
                if (!this.middleBased) {
                    y2 = this.topBased ? 0 : this.height - v2;
                }
                let x2 = Math.floor(width * (i + 1));

                const offsetLineA = this.middleBased ? v2 : v2;
                const offsetLineB = this.middleBased ? v : v;

                const yA = this.hideBottomPart ? this.height / 2 : y2 + offsetLineA;
                const yB = this.hideBottomPart ? this.height / 2 : y1 + offsetLineB;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x2, yA); //the/2 makes the bototm part invisible but looks so fucking nice
                ctx.lineTo(x1, yB);
                ctx.lineTo(x1, y1);
                ctx.closePath();
                ctx.fill();
                continue;
            }

            const gradient = ctx.createLinearGradient(x, y, x, y + v);

            if (this.middleBased) {
                gradient.addColorStop(0, "rgba(255,255,255,1)");
                gradient.addColorStop(.5, "rgba(255,255,255,0)");
                gradient.addColorStop(1, "rgba(255,255,255,.1)");
            }
            else if (this.topBased) {
                gradient.addColorStop(0, "rgba(255,255,255,1)");
                gradient.addColorStop(.5, "rgba(255,255,255,.5)");
            }
            else {
                gradient.addColorStop(0, "rgba(255,255,255,.5)");
                gradient.addColorStop(.5, "rgba(255,255,255,1)");
            }

            //Draw bars
            Canvas.drawRect(ctx, x, y, width, v, gradient);
        }
    }
}