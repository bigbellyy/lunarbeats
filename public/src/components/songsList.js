class SongsList {
    songs = [];
    containerDiv = DivHelper.new("0vw", "0vh", "40vw", "100vh");
    divWidth = "35vw";
    divHeight = "10vh";
    selectedSong = undefined;
    hoveredSong = 0;
    scrollingHeight = 0;
    constructor() {
        this.containerDiv.setAttribute("id", "songsContainer");
        this.containerDiv.style.opacity = "0";

        animate.fadeIn(this.containerDiv, 1000);
        this.update();
    }

    update() {
        if (document.body.contains(this.containerDiv)) {
            window.requestAnimationFrame(this.update.bind(this));
        }
        const songs = this.songs;

        for (let i = 0; i < songs.length; ++i) {
            const songObject = songs[i];
            const songDiv = songObject.songDiv;
            const songData = songObject.songData;

            const distance = Math.abs(i - this.hoveredSong) + 2;

            const translateY = songObject.scrollingHeight + (this.scrollingHeight - songObject.scrollingHeight) * .1 - .1;
            let translateX = songObject.translateX + (distance - songObject.translateX) * .1;

            if (i == this.selectedSong) {
                translateX = songObject.translateX + (0 - songObject.translateX) * .1;
            }
            songDiv.style.transform = `translateY(${translateY}vh) translateX(${-translateX}vw)`;
            songDiv.style.opacity = String(1 - translateX / 10)

            songObject.translateX = translateX;
            songObject.scrollingHeight = translateY;
        }
        if (this.hoveredSong && songs[this.hoveredSong]) {
            this.scrollingHeight = this.scrollingHeight + ((-songs[this.hoveredSong].index * 10 + 50) - this.scrollingHeight) * .1;
            this.scrollingHeight = clamp(this.scrollingHeight, -songs.length * 10 + 100, 0);
        }
    }

    addSong(songData) {
        const songs = this.songs;

        const top = (songs.length * parseInt(this.divHeight) + 1) + "vh";

        const div = DivHelper.new("0vw", top, this.divWidth, this.divHeight);
        div.setAttribute("class", "songDiv");
        this.containerDiv.append(div);

        div.textContent = songData.name;
        // div.style.color = songData.textColor.title;

        const obj = {
            songData: songData,
            songDiv: div,
            scrollingHeight: this.scrollingHeight,
            translateX: 0,
            index: songs.length
        }

        //Add event
        div.onmouseover = () => {
            this.hoveredSong = obj.index;
        }
        div.onclick = (e) => {
            if (this.selectedSong == obj.index) {
                this.selectedSong = undefined;
                // return;
            }
            else {
                this.hoveredSong = obj.index;
                this.selectedSong = obj.index;
            }

            this.onclick(e);
        }

        songs.push(obj);
    }

    onclick() { }

    removeSong(index) {
        console.log(index)
        console.log(this.songs)
        this.songs[index].songDiv.remove();
        this.songs.splice(index, 1);
        this.updatePositions();
        if (index == this.hoveredSong) {
            this.hoveredSong = 0;
        }
        if (index == this.selectedSong) {
            this.selectedSong = undefined;
        }
    }

    removeAllSongs() {
        for (let i = 0; i < this.songs.length; ++i) {
            this.songs[i].songDiv.remove();

            this.songs[i] = undefined;

            if (i == this.hoveredSong) {
                this.hoveredSong = 0;
            }
            if (i == this.selectedSong) {
                this.selectedSong = undefined;
            }
        }
        this.songs = [];
        this.updatePositions();
    }

    updatePositions() {
        const songs = this.songs;
        for (let i = 0; i < songs.length; ++i) {
            const top = (i * parseInt(this.divHeight) + 1) + "vh";
            songs[i].songDiv.style.top = top;
            songs[i].index = i;
        }
    }

    remove() {
        animate.fadeOut(this.containerDiv, 1000);
        setTimeout(() => {
            this.containerDiv.remove();
        }, 1000);
    }
}