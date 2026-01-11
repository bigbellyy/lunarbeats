//Objects and Functions
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
function getDistance(x1, x2, y1, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

//https://stackoverflow.com/a/5624139
function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const ArrayFunctions = {
    swap: (array, a, b) => { //Swaps array index a with index b
        const c = array[a];
        array[a] = array[b];
        array[b] = c;
    }
}

function findInArray(v, array) { //Returns index of the found element , else false
    for (let i = 0; i < array.length; ++i) {
        const n = array[i];
        if (n == v) {
            return i;
        }
    }
    return false;
}
function findInDeepArray(v, e, array) { //Returns index of the found element , else false
    for (let i = 0; i < array.length; ++i) {
        const n = array[i][e];
        if (n == v) {
            return i;
        }
    }
    return false;
}

function parseColor(input) { //https://stackoverflow.com/a/21966100/20363208 thanks
    return input.split("(")[1].split(")")[0].split(",");
}

function parseGradient(gradient) {
    gradient = gradient.substring(gradient.indexOf('(') + 1, gradient.lastIndexOf(')'));
    return gradient.split(/,(?![^(]*\))(?![^"']*["'](?:[^"']*["'][^"']*["'])*[^"']*$)/);
}

function YouTubeGetID(url) {
    url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const Color = {
    new: (r, g, b, a) => {
        if (a === undefined) {
            return String("rgb(" + r + "," + g + "," + b + ")");
        }
        return String("rgba(" + r + "," + g + "," + b + "," + Math.floor(a * 10) / 10 + ")");
    }
}