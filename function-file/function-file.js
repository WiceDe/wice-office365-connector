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

function saveMailInWice() {
  config = getConfig();

  var emptyWiceServer = $.isEmptyObject(config.wiceServer);
  var emptyMandant = $.isEmptyObject(config.mandant);
  var emptyUsername = $.isEmptyObject(config.username);
  var emptyPassword = $.isEmptyObject(config.password);
  var cookie = config.cookie;

  // Check if the add-in has been configured
  if (!emptyWiceServer && !emptyMandant && !emptyUsername && !emptyPassword) {
    function getSubjectRequest(id) {
      // Return a GetItem operation request for the subject of the specified item.
      var result =
        '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap:Envelope xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance"' +
        '               xmlns:xsd="https://www.w3.org/2001/XMLSchema"' +
        '               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"' +
        '               xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">' +
        '  <soap:Header>' +
        '    <RequestServerVersion Version="Exchange2013" xmlns="http://schemas.microsoft.com/exchange/services/2006/types" soap:mustUnderstand="0" />' +
        '  </soap:Header>' +
        '  <soap:Body>' +
        '    <GetItem xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"' +
        '             xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">' +
        '      <ItemShape>' +
        '        <t:BaseShape>Default</t:BaseShape>' +
        '        <t:IncludeMimeContent>true</t:IncludeMimeContent>' +
        '      </ItemShape>' +
        '      <ItemIds><t:ItemId Id="' + id + '"/></ItemIds>' +
        '    </GetItem>' +
        '  </soap:Body>' +
        '</soap:Envelope>';
      return result;
    }

    (function sendRequest() {
      // Create a local variable that contains the mailbox.
      var mailbox = Office.context.mailbox;
      mailbox.makeEwsRequestAsync(getSubjectRequest(mailbox.item.itemId), callback);
    }());

    function callback(asyncResult) {
      var result = asyncResult.value;
      var context = asyncResult.context;
      var url = config.wiceServer + "/pserv/base/outlook365";

      saveMail(result, url, cookie, function(cb) {
        console.log('CB: ', cb);
        // var url = "https://oihwice.wice-net.de";

        // window.location.replace(url);

        // window.location.href = 'https://oihwice.wice-net.de';
        // document.location.href = 'https://oihwice.wice-net.de';

        // $('#test').prop("href", cb.responseURL);
        // document.querySelector('#test').setAttribute('href', url);
        // var attr = $('#test').attr('href');
        // console.log(attr);

        var url = new URI('./function-file.html').absoluteTo(window.location).toString();
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
      });
    }
  } else {
    // Save the event object so we can finish up later
    btnEvent = event;
    // Not configured yet, display settings dialog with
    // warn=1 to display warning.
    var url = new URI('../settings/dialog.html?warn=1').absoluteTo(window.location).toString();
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
