async function createSession(credentials, callback) {
  // console.log(credentials);
  // const requestUrl = 'https://canary-api.snazzyapps.de/api/iam/login';
  // const requestUrl = 'https://snazzycontacts.com/mp_base/json_login/login';
  // const requestUrl = 'https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json';
  const requestUrl = 'https://oihwice.wice-net.de/pserv/base/json';

  const input = `method=login&mandant_name=${credentials.mandant}&username=${credentials.username}&password=${credentials.password}`;
  // const input = 'method=login&mandant_name=sandbox&username=shterion&password=d36adb53';

  makePOSTRequest(requestUrl, input, function(res) {
    if (res) {
      return callback(res);
    }
    console.log('False returned ...');
  });
}

function saveMail() {
  console.log('Email saved ...');
}

// function getUserGists(user, callback) {
//   var requestUrl = 'https://api.github.com/users/' + user + '/gists';
//
//   $.ajax({
//     url: requestUrl,
//     dataType: 'json'
//   }).done(function(gists) {
//     callback(gists);
//   }).fail(function(error) {
//     callback(null, error);
//   });
// }

// function buildGistList(parent, gists, clickFunc) {
//   gists.forEach(function(gist, index) {
//
//     var listItem = $('<li/>')
//       .addClass('ms-ListItem')
//       .addClass('is-selectable')
//       .attr('tabindex', index)
//       .appendTo(parent);
//
//     var desc = $('<span/>')
//       .addClass('ms-ListItem-primaryText')
//       .text(gist.description)
//       .appendTo(listItem);
//
//     var desc = $('<span/>')
//       .addClass('ms-ListItem-secondaryText')
//       .text(buildFileList(gist.files))
//       .appendTo(listItem);
//
//     var updated = new Date(gist.updated_at);
//
//     var desc = $('<span/>')
//       .addClass('ms-ListItem-tertiaryText')
//       .text('Last updated ' + updated.toLocaleString())
//       .appendTo(listItem);
//
//     var selTarget = $('<div/>')
//       .addClass('ms-ListItem-selectionTarget')
//       .appendTo(listItem);
//
//     var id = $('<input/>')
//       .addClass('gist-id')
//       .attr('type', 'hidden')
//       .val(gist.id)
//       .appendTo(listItem);
//
//     listItem.on('click', clickFunc);
//   });
// }

// function buildFileList(files) {
//
//   var fileList = '';
//
//   for (var file in files) {
//     if (files.hasOwnProperty(file)) {
//       if (fileList.length > 0) {
//         fileList = fileList + ', ';
//       }
//
//       fileList = fileList + files[file].filename + ' (' + files[file].language + ')';
//     }
//   }
//
//   return fileList;
// }
//
// function getGist(gistId, callback) {
//   var requestUrl = 'https://api.github.com/gists/' + gistId;
//
//   $.ajax({
//     url: requestUrl,
//     dataType: 'json'
//   }).done(function(gist) {
//     callback(gist);
//   }).fail(function(error) {
//     callback(null, error);
//   });
// }

// function buildBodyContent(gist, callback) {
//   // Find the first non-truncated file in the gist
//   // and use it.
//   for (var filename in gist.files) {
//     if (gist.files.hasOwnProperty(filename)) {
//       var file = gist.files[filename];
//       if (!file.truncated) {
//         // We have a winner
//         switch (file.language) {
//           case 'HTML':
//             // Insert as-is
//             callback(file.content);
//             break;
//           case 'Markdown':
//             // Convert Markdown to HTML
//             var converter = new showdown.Converter();
//             var html = converter.makeHtml(file.content);
//             callback(html);
//             break;
//           default:
//             // Insert contents as a <code> block
//             var codeBlock = '<pre><code>';
//             codeBlock = codeBlock + file.content;
//             codeBlock = codeBlock + '</code></pre>';
//             callback(codeBlock);
//         }
//         return;
//       }
//     }
//   }
//   callback(null, 'No suitable file found in the gist');
// }

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
