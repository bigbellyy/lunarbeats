//Properties
const globalFont = "Serif";
const globalEasing = "easeInOutSine";
const url = "";
let isMobile = false;

//Detect browser
let userAgent = navigator.userAgent;
let browserName;
//https://codepedia.info/detect-browser-in-javascript
if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "chrome";
} else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "firefox";
} else if (userAgent.match(/safari/i)) {
    browserName = "safari";
} else if (userAgent.match(/opr\//i)) {
    browserName = "opera";
} else if (userAgent.match(/edg/i)) {
    browserName = "edge";
}

window.globalFont = globalFont;
window.globalEasing = globalEasing;
window.url = url;
window.isMobile = isMobile;
window.browserName = browserName;