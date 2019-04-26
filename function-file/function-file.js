var config;
var btnEvent;

// The initialize function must be run each time a new page is loaded
Office.initialize = function(reason) {};

// Add any ui-less function here
function showError(error) {
  Office.context.mailbox.item.notificationMessages.replaceAsync('github-error', {
    type: 'errorMessage',
    message: error
  }, function(result) {});
}

var settingsDialog;

async function saveMail(event) {
  config = getConfig();

  var emptyWiceServer = $.isEmptyObject(config.wiceServer);
  var emptyMandant = $.isEmptyObject(config.mandant);
  var emptyUsername = $.isEmptyObject(config.username);
  var emptyPassword = $.isEmptyObject(config.password);

  // Check if the add-in has been configured
  if (!emptyWiceServer && !emptyMandant && !emptyUsername && !emptyPassword) {
    Office.context.mailbox.item.body.getAsync(
      'html', {
        asyncContext: "This is passed to the callback"
      },
      function callback(result) {
        console.log(config);
        var url = config.wiceServer + "/pserv/base/thunderbird";
        // console.log('URL: ', url);

        //TODO: Save mail in wice
        // console.log(result.value);
      });
    try {
      // getGist(config.defaultGistId, function(gist, error) {
      //   if (gist) {
      //     buildBodyContent(gist, function(content, error) {
      //       if (content) {
      //         Office.context.mailbox.item.body.setSelectedDataAsync(content, {
      //           coercionType: Office.CoercionType.Html
      //         }, function(result) {
      //           event.completed();
      //         });
      //       } else {
      //         showError(error);
      //         event.completed();
      //       }
      //     });
      //   } else {
      //     showError(error);
      //     event.completed();
      //   }
      // });
    } catch (err) {
      showError(err);
      event.completed();
    }

  } else {
    // Save the event object so we can finish up later
    btnEvent = event;
    // Not configured yet, display settings dialog with
    // warn=1 to display warning.
    var url = new URI('../credentials/dialog.html?warn=1 ').absoluteTo(window.location).toString();
    var dialogOptions = {
      width: 20,
      height: 40,
      displayInIframe: true
    };

    Office.context.ui.displayDialogAsync(url, dialogOptions, function(result) {
      settingsDialog = result.value;
      settingsDialog.addEventHandler(Microsoft.Office.WebExtension.EventType.DialogMessageReceived, receiveMessage);
      settingsDialog.addEventHandler(Microsoft.Office.WebExtension.EventType.DialogEventReceived, dialogClosed);
    });
  }
}

function receiveMessage(message) {
  config = JSON.parse(message.message);
  setConfig(config, function(result) {
    settingsDialog.close();
    settingsDialog = null;
    btnEvent.completed();
    btnEvent = null;
  });
}

function dialogClosed(message) {
  settingsDialog = null;
  btnEvent.completed();
  btnEvent = null;
}