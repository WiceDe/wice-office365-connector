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

function getHeadersRequest(id) {
    // Return a GetItem EWS operation request for the headers of the specified item.
    return "<GetItem xmlns='http://schemas.microsoft.com/exchange/services/2006/messages'>" +
        "  <ItemShape>" +
        "    <t:BaseShape>IdOnly</t:BaseShape>" +
        "    <t:BodyType>Text</t:BodyType>" +
        "    <t:AdditionalProperties>" +
        // PR_TRANSPORT_MESSAGE_HEADERS
        "      <t:ExtendedFieldURI PropertyTag='0x007D' PropertyType='String' />" +
        "    </t:AdditionalProperties>" +
        "  </ItemShape>" +
        "  <ItemIds><t:ItemId Id='" + id + "'/></ItemIds>" +
        "</GetItem>";
}

function getSoapEnvelope(request) {
    // Wrap an Exchange Web Services request in a SOAP envelope.
    return "<?xml version='1.0' encoding='utf-8'?>" +
        "<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'" +
        "               xmlns:t='http://schemas.microsoft.com/exchange/services/2006/types'>" +
        "  <soap:Header>" +
        "     <t:RequestServerVersion Version='Exchange2013'/>" +
        "  </soap:Header>" +
        "  <soap:Body>" +
        request +
        "  </soap:Body>" +
        "</soap:Envelope>";
}

function callbackEws(asyncResult, headersLoadedCallback) {
    // try {
    // Process the returned response here.
    var header = null;
    if (asyncResult.value) {
        header = extractHeadersFromXml(asyncResult.value);
        // console.log('HEADER: ', header);

        // We might not have a prop and also no error. This is OK if the prop is just missing.
        if (header && !header.prop) {
            if (header.responseCode && header.responseCode.length > 0 && header.responseCode[0].firstChild && header.responseCode[0].firstChild.data === "NoError") {
                // headersLoadedCallback(null, "EWS");
                // ShowError(null, ImportedStrings.mha_headersMissing, true);
                return;
            }
        }
    }

    if (header && header.prop) {
        headersLoadedCallback(header.prop, "EWS");
    } else {
        throw new Error(ImportedStrings.mha_requestFailed);
    }
}
// catch (e) {
//     if (asyncResult) {
//         LogError(null, "Async Response\n" + stripHeaderFromXml(JSON.stringify(asyncResult, null, 2)));
//     }
//
//     if (logResponse) {
//         LogError(null, "Original Response\n" + stripHeaderFromXml(JSON.stringify(logResponse, null, 2)));
//     }
//
//     headersLoadedCallback(null, "EWS");
//     ShowError(e, "EWS callback failed");
// }
// }

function extractHeadersFromXml(xml) {
    // This function plug in filters nodes for the one that matches the given name.
    // This sidesteps the issues in jquery's selector logic.
    (function($) {
        $.fn.filterNode = function(node) {
            return this.find("*").filter(function() {
                return this.nodeName === node;
            });
        };
    })(jQuery);

    var ret = {};
    try {
        // Strip encoded embedded null characters from our XML. parseXML doesn't like them.
        xml = xml.replace(/&#x0;/g, "");
        var response = $.parseXML(xml);
        var responseDom = $(response);

        if (responseDom) {
            // See http://stackoverflow.com/questions/853740/jquery-xml-parsing-with-namespaces
            // See also http://www.steveworkman.com/html5-2/javascript/2011/improving-javascript-xml-node-finding-performance-by-2000
            // We can do this because we know there's only the one property.
            var extendedProperty = responseDom.filterNode("t:ExtendedProperty");
            if (extendedProperty.length > 0) {
                ret.prop = extendedProperty[0].textContent;
            }
        }

        if (!ret.prop) {
            ret.responseCode = responseDom.filterNode("m:ResponseCode");
        }
    } catch (e) {
        // Exceptions thrown from parseXML are super chatty and we do not want to log them.
        // We throw this exception away and just return nothing.
    }

    return ret;
}


function saveMailInWice() {
    var itemHeaderRequest = getHeadersRequest(Office.context.mailbox.item.itemId);
    var envelope = getSoapEnvelope(itemHeaderRequest);
    Office.context.mailbox.makeEwsRequestAsync(envelope, function(asyncResult) {
        callbackEws(asyncResult, null);
    });

    // Office.context.mailbox.getCallbackTokenAsync({
    //     isRest: true
    // }, function(result) {
    //     console.log('RESULT: ', result);
    //     getHeaders(result.value, null);
    //
    //     try {
    //         if (result.status === "succeeded") {
    //             var accessToken = result.value;
    //             console.log('FLAG 1');
    //             getHeaders(accessToken, headersLoadedCallback);
    //         } else {
    //             LogError(null, 'Unable to obtain callback token.\nFallback to EWS.\n' + JSON.stringify(result, null, 2), true);
    //             sendHeadersRequestEWS(headersLoadedCallback);
    //         }
    //     } catch (e) {
    //         ShowError(e, "Failed in getCallbackTokenAsync");
    //     }
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
                '    <GetItem xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"' +
                '             xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">' +
                '      <ItemShape>' +
                '        <t:BaseShape>Default</t:BaseShape>' +
                '        <t:IncludeMimeContent>true</t:IncludeMimeContent>' +
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

            console.log('RESULT: ', result);

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
