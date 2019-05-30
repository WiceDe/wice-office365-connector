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
    // var itemHeaderRequest = getHeadersRequest(Office.context.mailbox.item.itemId);
    // var envelope = getSoapEnvelope(itemHeaderRequest);
    // Office.context.mailbox.makeEwsRequestAsync(envelope, function(asyncResult) {
    //     callbackEws(asyncResult, null);
    // });

    // Office.context.mailbox.getCallbackTokenAsync({
    //     isRest: true
    // }, function(result) {
    // console.log('RESULT: ', result);
    // getHeaders(result.value, null);
    // try {
    //     if (result.status === "succeeded") {
    //         var accessToken = result.value;
    //         console.log('FLAG 1');
    //         getHeaders(accessToken, headersLoadedCallback);
    //     } else {
    //         LogError(null, 'Unable to obtain callback token.\nFallback to EWS.\n' + JSON.stringify(result, null, 2), true);
    //         sendHeadersRequestEWS(headersLoadedCallback);
    //     }
    // }
    // catch (e) {
    //     ShowError(e, "Failed in getCallbackTokenAsync");
    // }
    // });

    // var schema = "http://schemas.microsoft.com/mapi/proptag/0x007D001E";
    // var headers = Office.context.mailbox.item.PropertyAccessor.GetProperty(schema);

    config = getConfig();

    var emptyWiceServer = $.isEmptyObject(config.wiceServer);
    var emptyMandant = $.isEmptyObject(config.mandant);
    var emptyUsername = $.isEmptyObject(config.username);
    var emptyPassword = $.isEmptyObject(config.password);
    var cookie = config.cookie;

    // Check if the add-in has been configured
    if (!emptyWiceServer && !emptyMandant && !emptyUsername && !emptyPassword) {
        // // if (config && config.defaultGistId) {
        // Office.context.mailbox.item.body.getAsync(
        //   'html', {
        //     asyncContext: "This is passed to the callback"
        //   },
        //   function callback(result) {
        //     // console.log('HTML FORMAT: ', result);
        //
        //     console.log(Office.context.mailbox.item.itemId);
        //
        //     const customMail = {
        //       attachments: Office.context.mailbox.item.attachments,
        //       body: result.value,
        //       from: {
        //         displayName:Office.context.mailbox.item.from.displayName,
        //         emailAddress: Office.context.mailbox.item.from.emailAddress
        //       },
        //       date: Office.context.mailbox.item.dateTimeCreated,
        //       internetMessageId: Office.context.mailbox.item.internetMessageId,
        //       subject: Office.context.mailbox.item.subject,
        //     };
        //     var url = config.wiceServer + "/pserv/base/outlook365";
        //     // Save mail functions is in helpers
        //     saveMail(customMail, url, cookie);
        //   });

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
                '    <GetItem xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">' +
                '      <ItemShape>' +
                '        <t:BaseShape>IdOnly</t:BaseShape>' +
                '        <t:AdditionalProperties>' +
                '            <t:FieldURI FieldURI="message:InternetMessageId"/>' +
                '            <t:FieldURI FieldURI="item:DateTimeReceived"/>' +
                '            <t:FieldURI FieldURI="item:Attachments"/>' +
                '            <t:FieldURI FieldURI="message:From"/>' +
                '            <t:FieldURI FieldURI="item:Subject"/>' +
                '            <t:FieldURI FieldURI="item:Body"/>' +
                '        </t:AdditionalProperties>' +
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

            saveMail(result, url, cookie);
            // Process the returned response here.
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
