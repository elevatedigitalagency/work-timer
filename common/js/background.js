/**
 * Copyright 2020 Elevate Digital Ltd. All rights are reserved.
 */

var Background = {
  isShowNotificationEnabled: null,
  isPlaySoundEnabled: null,
  notificationSound: null,
  isOpenNewTabEnabled: null,
  timeRemaining: null,
  intervalUpdateTimeRemaining: null,
  timerDuration: null,
  audioPlayDuration: null,

  getVariablesFromChrome: function () {
    chrome.storage.sync.get(
      [
        "isShowNotificationEnabled",
        "isPlaySoundEnabled",
        "notificationSound",
        "isOpenNewTabEnabled",
        "timerDuration",
      ],
      function (returnedItems) {
        Background.isShowNotificationEnabled =
          returnedItems.isShowNotificationEnabled;
        Background.isPlaySoundEnabled = returnedItems.isPlaySoundEnabled;
        Background.notificationSound = returnedItems.notificationSound;
        Background.isOpenNewTabEnabled = returnedItems.isOpenNewTabEnabled;
        Background.timerDuration = returnedItems.timerDuration;
        Background.audioPlayDuration = returnedItems.audioPlayDuration;
        Background.setVariables();
      }
    );
  },

  setVariables: function () {
    if (Background.isShowNotificationEnabled == null) {
      Background.isShowNotificationEnabled = true;
      chrome.storage.sync.set({
        isShowNotificationEnabled: true,
      });
    }

    if (Background.isPlaySoundEnabled == null) {
      Background.isPlaySoundEnabled = true;
      chrome.storage.sync.set({
        isPlaySoundEnabled: true,
      });
    }

    // Todo: Add sound files
    if (Background.notificationSound == null) {
      Background.notificationSound = "beautiful_memories";
      chrome.storage.sync.set({
        notificationSound: "beautiful_memories",
      });
    }

    if (Background.isOpenNewTabEnabled == null) {
      Background.isOpenNewTabEnabled = true;
      chrome.storage.sync.set({
        isOpenNewTabEnabled: true,
      });
    }

    if (Background.timerDuration == null) {
      Background.timerDuration = null;
      chrome.storage.sync.set({
        timerDuration: null,
      });
    }

    if (Background.audioPlayDuration == null) {
      Background.audioPlayDuration = 5000;
      chrome.storage.sync.set({
        audioPlayDuration: 5000,
      });
    }
  },

  startTimer: function () {
    Background.timeRemaining = Background.timerDuration;
    Background.intervalUpdateTimeRemaining = setInterval(
      Background.updateTimeRemaining,
      1000
    );
  },

  updateTimeRemaining: function () {
    Background.timeRemaining = Background.timeRemaining - 1;
    var newBadgeText = Math.round(Background.timeRemaining / 60)
      .toString()
      .concat("m");
    if (Background.timeRemaining > 60) {
      Background.updateBadgeText(newBadgeText);
    } else {
      if (Background.timeRemaining > 1) {
        Background.updateBadgeText("<1m");
      } else {
        Background.expireTimer();
      }
    }
  },

  updateBadgeText: function (newBadgeText) {
    chrome.browserAction.setBadgeText({ text: newBadgeText });
  },

  expireTimer: function () {
    Background.stopTimer();

    if (Background.isPlaySoundEnabled) {
      Background.playSound();
    }

    if (Background.isShowNotificationEnabled) {
      Background.showNotification();
    }

    if (Background.isOpenNewTabEnabled) {
      Background.openNewTab();
    }
  },

  stopTimer: function () {
    clearInterval(Background.intervalUpdateTimeRemaining);
    Background.intervalUpdateTimeRemaining = null;
    Background.updateBadgeText("");
  },

  resetTimer: function () {
    Background.stopTimer();
    Background.startTimer();
  },

  playSound: function () {
    switch (Background.notificationSound) {
      case "beautiful_memories":
        var audio = new Audio("/common/audio/beautiful_memories.mp3");
        audio.play();
        setTimeout(function () {
          audio.pause();
        }, 5000);
        break;
      case "quiet_time":
        var audio = new Audio("/common/audio/quiet_time.mp3");
        audio.play();
        setTimeout(function () {
          audio.pause();
        }, 5000);
        break;
      case "tropical_keys":
        var audio = new Audio("/common/audio/tropical_keys.mp3");
        audio.play();
        setTimeout(function () {
          audio.pause();
        }, 5000);
        break;
    }
  },

  showNotification: function () {
    var notificationTitle, notificationMessage;
    var randomNumber = Math.floor(Math.random() * 1 + 1);
    // limit of 30 characters for notification title
    switch (randomNumber) {
      case 1:
        notificationTitle = "Your timer has expired.";
        notificationMessage = "You can stop working now.";
        break;
      case 2:
        notificationTitle = "Time's up";
        notificationMessage = "Your timer has expired.";
        break;
      default:
        notificationTitle = "Your timer has expired";
        notificationMessage = "Time flies when you're working hard.";
        break;
    }

    chrome.notifications.create({
      type: "basic",
      title: notificationTitle,
      message: notificationMessage,
      iconUrl: "/common/img/128.png",
      requireInteraction: true,
    });
  },

  /**
   * Opens a new tab when the timer has expired.
   */
  openNewTab: function () {
    chrome.tabs.create({ url: "expired.html" });
  },
};

window.onload = function () {
  Background.getVariablesFromChrome();
};

chrome.runtime.onUpdateAvailable.addListener(function (updateDetails) {
  chrome.runtime.reload();
});

chrome.storage.onChanged.addListener(function (changes, areaName) {
  for (var key in changes) {
    var storageChange = changes[key];
    switch (key) {
      case "isShowNotificationEnabled":
        Background.isShowNotificationEnabled = storageChange.newValue;
        break;
      case "isPlaySoundEnabled":
        Background.isPlaySoundEnabled = storageChange.newValue;
        break;
      case "notificationSound":
        Background.notificationSound = storageChange.newValue;
        break;
      case "isOpenNewTabEnabled":
        Background.isOpenNewTabEnabled = storageChange.newValue;
        break;
      case "timerDuration":
        Background.timerDuration = storageChange.newValue;
        break;
      case "audioPlayDuration":
        Background.audioPlayDuration = storageChange.newValue;
        break;
      default:
        break;
    }
  }
});

// Clear notification when user clicks on it
chrome.notifications.onClicked.addListener(function (notificationId) {
  chrome.notifications.clear(notificationId);
});

chrome.runtime.setUninstallURL("https://elevatedigital.ie/work-timer/feedback");

chrome.runtime.onInstalled.addListener(function (details) {
  var installReason = details.reason;
  switch (installReason) {
    case "install":
      break;
    case "update":
      break;
    default:
      break;
  }
});

// Receive message from popup
chrome.runtime.onMessage.addListener(function (
  receivedData,
  sender,
  sendResponse
) {
  var senderUrl = sender.url;
  if (senderUrl.includes("popup.html")) {
    switch (receivedData.reason) {
      case "stop-timer":
        Background.stopTimer();
        break;
      case "reset-timer":
        Background.resetTimer();
        break;
      case "start-5s-timer":
        Background.timerDuration = 5;
        Background.startTimer();
        break;
      case "start-30m-timer":
        Background.timerDuration = 1800;
        Background.startTimer();
        break;
      case "start-60m-timer":
        Background.timerDuration = 3600;
        Background.startTimer();
        break;
      case "start-90m-timer":
        Background.timerDuration = 5400;
        Background.startTimer();
        break;
      default:
        break;
    }
  }
  if (senderUrl.includes("settings.html")) {
    Background.isPlaySoundEnabled = receivedData.isPlaySoundEnabled;
    Background.isShowNotificationEnabled =
      receivedData.isShowNotificationEnabled;
    Background.notificationSound = receivedData.notificationSound;
    Background.isOpenNewTabEnabled = receivedData.isOpenNewTabEnabled;
    Background.audioPlayDuration = receivedData.audioPlayDuration;
  }
});
