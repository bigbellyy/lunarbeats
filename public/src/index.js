'use strict';

//Created by Herman Ben Toledo

function checkForPortraitMode() {
    //Constantly check if device is portrait
    const portraitWarning = document.getElementById("portraitWarning")
    setInterval(() => {
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;

        if (!isPortrait) {
            portraitWarning.style.display = "none"
            return
        }

        portraitWarning.style.display = "block"
    }, 500);
}

function createTitleSong() {
    const titleSong = document.createElement("audio");
    Game.titleSongAudio = titleSong;
    titleSong.volume = localStorage.getItem("musicVolume") || 1;
    titleSong.src = "mp3/LightnessPeaceReverb.ogg";
    titleSong.loop = true;

    return titleSong;
}

$(document).ready(() => {
    //Show Initial Loading Screen
    LoadingScreen.show(1000);

    let finished = false;
    let directory = undefined;

    //Fetch directory.json, contaning URLs for all images and song data.
    $.getJSON(url + "directory.json", function (data) {
        directory = data;
        beginLoading()
    })

    function beginLoading() {
        const songCount = directory.base.songCount;
        const songURL = directory.base.songURL;
        const baseImages = directory.baseImages;
        const songGroups = directory.base.songGroups;
        const baseSongData = Game.baseSongData; //Array
        const baseSongImages = Game.baseSongImages; //Array
        
        let began = false;
        let finishedIcons = 0;
        let finishedGroupIcons = 0;
        let titleSongLoaded = false;

        let timeElapsed = 0

        //Create + load title song
        const titleSong = createTitleSong()
        titleSong.oncanplaythrough = function () {
            titleSongLoaded = true;
        }

        //Grab all base song images from the directory.json file.
        for (let i = 0; i < songCount; ++i) {
            const parsedURL = String(url + songURL + "/song" + String(i)); //Find song file location
            $.getJSON(parsedURL + "/data.json", function (data) {
                baseSongData[i] = data;
                finishedIcons++;
            })
            const songImage = document.createElement("img");
            songImage.src = url + parsedURL + "/icon.svg";
            baseSongImages[i] = songImage; //Store songImage element
        }

        //Preload base images
        let finishedImages = 0;
        for (let i = 0; i < baseImages.length; ++i) {
            //Index 0 is the name of the object, index 1 is the URL
            const v = baseImages[i];
            const name = v[0];
            const url = v[1];
            const img = document.createElement("img");
            img.src = url;
            Game.baseImages[name] = img;
            $(img).on("load", function () {
                finishedImages++;
            })
        }

        //Preload song group images
        for (let i = 0; i < songGroups.length; ++i) {
            const v = songGroups[i][0];
            const parsedURL = `songs/base/groups/${v}.svg`;
            const img = document.createElement("img");
            img.src = parsedURL;
            img.setAttribute("id", songGroups[i]);
            songGroups[i].push(img);
            Game.songGroups.push(songGroups[i]);
            img.onload = function () {
                finishedGroupIcons++;
            }
        }

        //Repeatedly poll, check if all song images are finished loading.
        const msDelay = 100
        const checkFinished = setInterval(() => {
            timeElapsed += msDelay
            
            const finishedLoading = finishedImages === baseImages.length && 
                                    finishedIcons === songCount && 
                                    began === false && titleSongLoaded && 
                                    finishedGroupIcons === songGroups.length
            
            const timeoutTime = 30000
            const isTakingTooLong = timeElapsed > timeoutTime
            if (finishedLoading || isTakingTooLong) {
                clearInterval(checkFinished);
                
                //Start the game
                finished = true;
                Game.premenu();
            }
        }, msDelay);
    }

    checkForPortraitMode()
})
