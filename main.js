"use strict";

const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const url = require("url");
const shell = require("electron").shell;
const ipcRenderer = require("electron").ipcRenderer;
const sqlite3 = require("sqlite3").verbose();

var newWindow = null;

//Sqlite config
const db_name = path.join(__dirname, "sqlite", "sm.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'apptest.db'");
});

//Database generation

//Reload application after update
require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron")
});

//Database connection
var knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, "/sqlite/database.sqlite")
  }
});

// Specify flash path, supposing it is placed in the same directory with main.js.
let pluginName;
switch (process.platform) {
  case "win32":
    pluginName = "pepflashplayer.dll";
    break;
  // case "darwin":
  //   pluginName = "PepperFlashPlayer.plugin";
  //   break;
  case "linux":
    pluginName = "libpepflashplayer.so";
    break;
}

//console.log(pluginName);

//Set flash library to application
app.commandLine.appendSwitch(
  "ppapi-flash-path",
  path.join(__dirname, pluginName)
);

//html location
var login = "/view/login.html";
var main = "/view/main.html";
var contentClass1 = "/content/class1/intro_class1.html";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

//Custom Menu building
var menu = Menu.buildFromTemplate([
  { label: app.getName() },
  { label: "Notice Board" },
  {
    label: "Class",
    submenu: [
      {
        label: "Class 1",
        submenu: [
          {
            label: "Content Class 1",
            click() {
              openContentWindowClass1();
            }
          }
        ]
      },
      { type: "separator" },
      { label: "Class 2", submenu: [{ label: "Content Class 2" }] },
      { type: "separator" },
      { label: "Class 3", submenu: [{ label: "Content Class 3" }] }
    ]
  },
  {
    label: "Teacher",
    submenu: [
      { label: "Teacher List" },
      { type: "separator" },
      {
        label: "Add Teacher",
        click() {
          addTeacher();
        }
      },
      { type: "separator" },
      { label: "Teacher Attendance" }
    ]
  },
  {
    label: "Student",
    submenu: [
      {
        label: "Student List",
        click() {
          console.log("Student List");
        }
      },
      { type: "separator" },
      { label: "Add Student" },
      { type: "separator" },
      { label: "Student Attendance" }
    ]
  },
  {
    label: "Links",
    submenu: [
      {
        label: "Education Ministry",
        click() {
          shell.openExternal("https://moedu.gov.bd/");
        }
      }
    ]
  },
  { label: "Exam" },
  { label: "Result" },
  {
    label: "Exit",
    click() {
      app.quit();
    }
  }
]);
//Set Menu to application
Menu.setApplicationMenu(menu);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", openLoginWindow);

//Show the home page
app.once("ready-to-show", () => {
  app.show();
});

app.on("closed", function() {
  app = null;
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

exports.openWindow = filename => {
  let win = BrowserWindow({ width: 800, height: 800 });
  win.loadURL(`file://${__dirname}/view/` + filename + `.html`);
};

//Generate main window
function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    maxWidth: 1920,
    maxHeight: 1080,
    show: false,
    title: "",
    resizable: true,
    maximizable: true,
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
    pathname: path.join(__dirname, main),
    protocol: "file",
    slashes: true
  });

  //Load HTML into window
  mainWindow.webContents.loadURL(filePath);

  //Find data from DB and send to window
  ipcMain.on("mainWindowLoaded", function() {
    let result = knex.select("FirstName").from("User");
    result.then(function(rows) {
      mainWindow.webContents.send("resultSent", rows);
    });
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  //Show the home page
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}

//For content view function
function openContentWindowClass1() {
  console.log("abc");

  if (contentWindow) {
    contentWindow.focus();
    return;
  }

  var contentWindow = null;
  contentWindow = new BrowserWindow({
    height: 800,
    width: 800,
    maxHeight: 1080,
    maxWidth: 1920,
    title: "",
    resizable: true,
    minimizable: true,
    fullscreenable: true,
    show: false,
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

//For Teacher add function
function addTeacher() {
  var addTeacherWindow = null;

  if (addTeacherWindow) {
    addTeacherWindow.focus();
    return;
  }

  addTeacherWindow = new BrowserWindow({
    height: 800,
    width: 800,
    title: "",
    resizable: true,
    minimizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      webviewTag: true
    }
  });

  addTeacherWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "/view/addTeacher.html"),
      protocol: "file",
      slashes: true
    })
    //"file://" + __dirname + "/content/class1/intro_class1.html"
  );

  addTeacherWindow.on("closed", function() {
    addTeacherWindow = null;
  });
}

//Login window
//For Teacher add function
function openLoginWindow() {
  if (loginWindow) {
    loginWindow.focus();
    return;
  }

  var loginWindow = null;

  loginWindow = new BrowserWindow({
    height: 800,
    width: 800,
    title: "",
    resizable: true,
    minimizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      webviewTag: true
    }
  });

  loginWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, login),
      protocol: "file",
      slashes: true
    })
  );

  // Open the DevTools.
  loginWindow.webContents.openDevTools();

  // //Custom Menu building
  // var menu = Menu.buildFromTemplate([
  //   { label: app.getName() },
  //   { label: "Notice Board" },
  //   {
  //     label: "Class",
  //     submenu: [
  //       {
  //         label: "Class 1",
  //         submenu: [
  //           {
  //             label: "Content Class 1",
  //             click() {
  //               openContentWindowClass1();
  //             }
  //           }
  //         ]
  //       },
  //       { type: "separator" },
  //       { label: "Class 2", submenu: [{ label: "Content Class 2" }] },
  //       { type: "separator" },
  //       { label: "Class 3", submenu: [{ label: "Content Class 3" }] }
  //     ]
  //   },
  //   {
  //     label: "Teacher",
  //     submenu: [
  //       { label: "Teacher List" },
  //       { type: "separator" },
  //       {
  //         label: "Add Teacher",
  //         click() {
  //           addTeacher();
  //         }
  //       },
  //       { type: "separator" },
  //       { label: "Teacher Attendance" }
  //     ]
  //   },
  //   {
  //     label: "Student",
  //     submenu: [
  //       {
  //         label: "Student List",
  //         click() {
  //           console.log("Student List");
  //         }
  //       },
  //       { type: "separator" },
  //       { label: "Add Student" },
  //       { type: "separator" },
  //       { label: "Student Attendance" }
  //     ]
  //   },
  //   {
  //     label: "Links",
  //     submenu: [
  //       {
  //         label: "Education Ministry",
  //         click() {
  //           shell.openExternal("https://moedu.gov.bd/");
  //         }
  //       }
  //     ]
  //   },
  //   { label: "Exam" },
  //   { label: "Result" },
  //   {
  //     label: "Exit",
  //     click() {
  //       app.quit();
  //     }
  //   }
  // ]);

  // //Set Menu to application
  // Menu.setApplicationMenu(menu);

  //Show the home page
  loginWindow.once("ready-to-show", () => {
    loginWindow.show();
  });

  loginWindow.on("closed", function() {
    loginWindow = null;
  });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
