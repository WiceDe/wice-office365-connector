(function() {
  'use strict';

  var config;
  var settingsDialog;

  Office.initialize = function(reason) {
    jQuery(document).ready(function() {
      config = getConfig();
      $('#not-configured').show();
      // When the settings icon is selected, open the settings dialog
      $('#settings-field').on('click', function() {
        // Display settings dialog
        var url = new URI('../settings/dialog.html').absoluteTo(window.location).toString();

        var dialogOptions = {
          width: 20,
          height: 40,
          displayInIframe: true
        };

        Office.context.ui.displayDialogAsync(url, dialogOptions, function(result) {
          settingsDialog = result.value;
          if (settingsDialog) {
            settingsDialog.addEventHandler(Microsoft.Office.WebExtension.EventType.DialogMessageReceived, receiveMessage);
            settingsDialog.addEventHandler(Microsoft.Office.WebExtension.EventType.DialogEventReceived, dialogClosed);
          }
        });
      })
    });
  };

  function receiveMessage(message) {
    config = JSON.parse(message.message);
    setConfig(config, function(result) {
      settingsDialog.close();
      settingsDialog = null;
    });
  }

  function dialogClosed(message) {
    settingsDialog = null;
  }
})();
