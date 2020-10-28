/**
 * Copyright 2020 Elevate Digital Ltd. All rights are reserved.
 */

var Popup = {
  addEventListeners: function () {
    document.getElementById("stop-timer").onclick = function () {
      Popup.sendMessageToBackgroundScript("stop-timer");
    };
    document.getElementById("reset-timer").onclick = function () {
      Popup.sendMessageToBackgroundScript("reset-timer");
    };
    document.getElementById("start-5s-timer").onclick = function () {
      Popup.sendMessageToBackgroundScript("start-5s-timer");
    };
    document.getElementById("start-30m-timer").onclick = function () {
      Popup.sendMessageToBackgroundScript("start-30m-timer");
    };
    document.getElementById("start-60m-timer").onclick = function () {
      Popup.sendMessageToBackgroundScript("start-60m-timer");
    };
    document.getElementById("start-90m-timer").onclick = function () {
      Popup.sendMessageToBackgroundScript("start-90m-timer");
    };
  },

  sendMessageToBackgroundScript: function (reason) {
    chrome.runtime.sendMessage({
      reason: reason,
    });
  },
};

window.onload = function () {
  Popup.addEventListeners();
};
