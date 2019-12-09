const electron = require("electron");
const ipc = electron.ipcRenderer;
document.addEventListener("DOMContentLoaded", function() {
  ipc.send("mainWindowLoaded");
  ipc.on("resultSent", function(evt, result) {
    let resultEl = document.getElementById("result");
    //console.log(result);
    for (var i = 0; i < result.length; i++) {
      resultEl.innerHTML +=
        "First Name: " + result[i].FirstName.toString() + "<br/>";
    }
  });
});
