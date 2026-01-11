//Get fps
const defaultFps = 144 //thats my monitor
let fps = 0;
let fpsMultiplier = Math.max(defaultFps / fps, 1); //144
let initialTime = 0;
function updateFps(timeStamp) {
    window.requestAnimationFrame(updateFps);

    let deltaTime = (timeStamp - initialTime) / 1000;
    initialTime = timeStamp;
    fps = Math.floor(1 / deltaTime);
    fpsMultiplier = Math.min(Math.max(defaultFps / fps, 1), 3);
}
updateFps()

window.defaultFps = defaultFps;
window.fps = fps;
window.fpsMultiplier = fpsMultiplier;
window.updateFps = updateFps;