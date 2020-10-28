/**
 * Copyright 2020 Elevate Digital Ltd. All rights are reserved.
 */

var Settings = {
  isShowNotificationEnabled: null,
  isPlaySoundEnabled: null,
  notificationSound: null,
  isOpenNewTabEnabled: null,
  audioPlayDuration: null,

  getVariablesFromChrome: function () {
    chrome.storage.sync.get(
      [
        "isShowNotificationEnabled",
        "isPlaySoundEnabled",
        "notificationSound",
        "isOpenNewTabEnabled",
        "audioPlayDuration",
      ],
      function (returnedItems) {
        Settings.isShowNotificationEnabled =
          returnedItems.isShowNotificationEnabled;
        Settings.isPlaySoundEnabled = returnedItems.isPlaySoundEnabled;
        Settings.notificationSound = returnedItems.notificationSound;
        Settings.isOpenNewTabEnabled = returnedItems.isOpenNewTabEnabled;
        Settings.audioPlayDuration = returnedItems.audioPlayDuration;
        Settings.useVariables();
      }
    );
  },

  useVariables: function () {
    if (Settings.isShowNotificationEnabled === true) {
      document.getElementById("desktop-notification-enabled").checked = true;
    } else {
      document.getElementById("desktop-notification-enabled").checked = false;
    }

    if (Settings.isPlaySoundEnabled === true) {
      document.getElementById("sound-reminder-enabled").checked = true;
      document.getElementById("notification-sound-dropdown").disabled = false;
    } else {
      document.getElementById("sound-reminder-enabled").checked = false;
      document.getElementById("notification-sound-dropdown").disabled = true;
    }

    if (Settings.notificationSound) {
      document.getElementById("notification-sound-dropdown").value =
        Settings.notificationSound;
    } else {
      Settings.notificationSound = "beautiful_memories";
      document.getElementById("notification-sound-dropdown").value =
        "beautiful_memories";
    }

    if (Settings.audioPlayDuration) {
      document.getElementById("audio-play-duration-dropdown").value =
        Settings.audioPlayDuration;
    } else {
      document.getElementById("audio-play-duration-dropdown").value =
        "5000";
    }

    if (Settings.isOpenNewTabEnabled === true) {
      document.getElementById("open-new-tab-enabled").checked = true;
    } else {
      document.getElementById("open-new-tab-enabled").checked = false;
    }
  },

  addEventListeners: function () {
    /**
     * Updates a setting within this script's main object and Chrome Storage Sync.
     * @param {*} elementReference - A reference to the element updated by the user.
     * @param {*} objectPropertyToUpdate - The property to update within the script's object. e.g. Settings.property
     * @param {string} chromePropertyToUpdate - The property to update in Chrome Storage Sync. e.g. "property"
     */
    function updateSetting(
      elementReference,
      objectPropertyToUpdate,
      chromePropertyToUpdate
    ) {
      if (elementReference.checked === true) {
        objectPropertyToUpdate = true;
        if (chromePropertyToUpdate == "isPlaySoundEnabled") {
          document.getElementById(
            "notification-sound-dropdown"
          ).disabled = false;
          document.getElementById(
            "audio-play-duration-dropdown"
          ).disabled = false;
        }
        chrome.storage.sync.set(
          { [chromePropertyToUpdate]: true },
          function () {
            showSuccessAlert();
            Settings.sendMessageToBackgroundScript();
          }
        );
      } else {
        objectPropertyToUpdate = false;
        if (chromePropertyToUpdate == "isPlaySoundEnabled") {
          document.getElementById(
            "notification-sound-dropdown"
          ).disabled = true;
          document.getElementById(
            "audio-play-duration-dropdown"
          ).disabled = true;
        }
        chrome.storage.sync.set(
          { [chromePropertyToUpdate]: false },
          function () {
            showSuccessAlert();
            Settings.sendMessageToBackgroundScript();
          }
        );
      }
    }

    function showSuccessAlert() {
      alert("Settings updated successfully.");
    }

    var notificationEnabled = document.getElementById(
      "desktop-notification-enabled"
    );
    notificationEnabled.onclick = function () {
      updateSetting(
        notificationEnabled,
        Settings.isShowNotificationEnabled,
        "isShowNotificationEnabled"
      );
    };

    var playSoundEnabled = document.getElementById("sound-reminder-enabled");
    playSoundEnabled.onclick = function () {
      updateSetting(
        playSoundEnabled,
        Settings.isPlaySoundEnabled,
        "isPlaySoundEnabled"
      );
    };

    var openNewTabEnabled = document.getElementById("open-new-tab-enabled");
    openNewTabEnabled.onclick = function () {
      updateSetting(
        openNewTabEnabled,
        Settings.isOpenNewTabEnabled,
        "isOpenNewTabEnabled"
      );
    };

    var notificationSoundDropdown = document.getElementById(
      "notification-sound-dropdown"
    );
    notificationSoundDropdown.onchange = function () {
      chrome.storage.sync.set(
        {
          notificationSound: notificationSoundDropdown.value,
        },
        function () {
          var audioUrl = "/common/audio/"
            .concat(notificationSoundDropdown.value)
            .concat(".mp3");
          Settings.notificationSound = notificationSoundDropdown.value;
          showSuccessAlert();
        }
      );
    };

    var audioPlayDurationDropdown = document.getElementById(
      "audio-play-duration-dropdown"
    );
    audioPlayDurationDropdown.onchange = function () {
      chrome.storage.sync.set(
        {
          audioPlayDuration: audioPlayDurationDropdown.value,
        },
        function () {
          Settings.audioPlayDuration = audioPlayDurationDropdown.value;
          showSuccessAlert();
        }
      );
    };
  },

  sendMessageToBackgroundScript: function () {
    chrome.runtime.sendMessage({
      isPlaySoundEnabled: Settings.isPlaySoundEnabled,
      isShowNotificationEnabled: Settings.isShowNotificationEnabled,
      notificationSound: Settings.notificationSound,
      isOpenNewTabEnabled: Settings.isOpenNewTabEnabled,
      audioPlayDuration: Settings.audioPlayDuration,
    });
  },
};

window.onload = function () {
  this.Settings.getVariablesFromChrome();
  this.Settings.addEventListeners();
};
