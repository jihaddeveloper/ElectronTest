const BrowserWindow = electron.remote.BrowserWindow;
const path = require("path");
const url = require("url");

//load content html
var contentClass1 = "../content/class1/intro_class1.html";

//For content view function
function openContentWindowClass1() {
  console.log("abc");
  var contentWindow = null;
  contentWindow = new BrowserWindow({
    height: 800,
    width: 800,
    title: "",
    show: false,
    resizable: true,
    minimizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      webviewTag: true
    }
  });

  //Define html filepath
  const filePath = url.format({
    pathname: path.join(__dirname, contentClass1),
    protocol: "file",
    slashes: true
  });

  //Load HTML into window
  contentWindow.webContents.loadURL(filePath);

  // // This is the actual solution
  // contentWindow.webContents.on("new-window", function(event, url) {
  //   event.preventDefault();
  //   shell.openExternal(url);
  // });

  //Show the window when it is ready
  contentWindow.once("ready-to-show", () => {
    contentWindow.show();
  });

  contentWindow.on("closed", function() {
    contentWindow = null;
  });
}
