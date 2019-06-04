function createSession(credentials, callback) {
    const requestUrl = 'https://oihwice.wice-net.de/pserv/base/json';

    var input = `method=login&mandant_name=${credentials.mandant}&username=${credentials.username}&password=${credentials.password}`;

    makePOSTRequest(requestUrl, input, function(res) {
        if (res) {
            return callback(res);
        }
        console.log('False returned ...');
    });
}

function saveMail(email, url, cookie) {
    // console.log('Saving email ...');

    var data = {
        contents: email,
        cookie: cookie,
        save_message: 1
    };

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    // xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    // send the collected data as JSON
    xhr.send(JSON.stringify(data));
    xhr.onloadend = function() {
        // TODO: expect response from wice
        console.log('RES: ', xhr);
    };
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

    httpRequest.onreadystatechange = function() {
     if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var response = JSON.parse(httpRequest.responseText);
            if (response.cookie) {
                callback(response.cookie);
            } else {
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
