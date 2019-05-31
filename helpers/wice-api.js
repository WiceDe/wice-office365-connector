async function createSession(credentials, callback) {
    const requestUrl = 'https://oihwice.wice-net.de/pserv/base/json';

    const input = `method=login&mandant_name=${credentials.mandant}&username=${credentials.username}&password=${credentials.password}`;

    makePOSTRequest(requestUrl, input, function(res) {
        if (res) {
            return callback(res);
        }
        console.log('False returned ...');
    });
}

function saveMail(email, url, cookie) {
    // console.log('Saving email ...');

    const data = {
        email,
        cookie
    };

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    // xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    // send the collected data as JSON
    xhr.send(JSON.stringify(data));
    xhr.onloadend = function() {
        //TODO: expect response from wice
    };

    // makePOSTRequest(url, emailString, function(res) {
    //   if (res) {
    //     console.log('Email saved! ', res);
    //     // return callback(res);
    //   }
    //   // console.log('False returned ...');
    // });
}

function makePOSTRequest(url, parameters, callback) {
    httpRequest = false;
    if (window.XMLHttpRequest) { // Mozilla, Safari,...
        httpRequest = new XMLHttpRequest();
        if (httpRequest.overrideMimeType) {
            // set type accordingly to anticipated content type
            //httpRequest.overrideMimeType('text/xml');
            httpRequest.overrideMimeType('text/html');
        }
    } else if (window.ActiveXObject) { // IE
        try {
            httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        }
    }
    if (!httpRequest) {
        // alert('Cannot create XMLHTTP instance');
        console.log('Cannot create XMLHTTP instance');
        return false;
    }

    httpRequest.onreadystatechange = function() { //Call a function when the state changes.
        // console.log("STATE CHANGE " + httpRequest.status + " - " + httpRequest.readyState);
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            // console.log("POST result: " + httpRequest.responseText);
            var response = JSON.parse(httpRequest.responseText);
            // console.log('RESPONSE: ', response);
            // var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
            // prefs = prefs.getBranch("extensions.tbwice_thunderbird.");

            // console.log("COOKIE: " + response.cookie);
            // prefs is an nsIPrefBranch.
            // Look in the above section for examples of getting one.
            // prefs.setCharPref("wice_cookie", response.cookie);

            if (response.cookie) {
                callback(response.cookie);
            } else {
                // alert("Login data invalid");
                console.log('Login data invalid');
                callback(false);
            }
        }
    }

    httpRequest.open('POST', url, true);
    httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // httpRequest.setRequestHeader("Content-length", parameters.length);
    // httpRequest.setRequestHeader("Connection", "close");
    httpRequest.send(parameters);
}
