(function() {
  'use strict';

  // The Office initialize function must be run each time a new page is loaded
  Office.initialize = function(reason) {
    jQuery(document).ready(function() {
      if (window.location.search) {
        // Check if warning should be displayed
        var warn = getParameterByName('warn');
        if (warn) {
          $('.not-configured-warning').show();
        } else {
          var config = getConfig();
          // See if the config values were passed
          // If so, pre-populate the values
          // var user = getParameterByName('gitHubUserName');
          // var gistId = getParameterByName('defaultGistId');

          // var wiceServer = getParameterByName('wiceServer');
          // var mandant = getParameterByName('mandant');
          // var username = getParameterByName('username');
          // var password = getParameterByName('password');

          // $('#github-user').val(user);
          $('#wice-server').val(config.wiceServer);
          $('#mandant').val(config.mandant);
          $('#username').val(config.username);
          $('#password').val(config.password);

          // loadGists(user, function(success) {
          //   if (success) {
          //     $('input:hidden').filter(function() {
          //       return this.value === gistId;
          //     }).parent().addClass('is-selected');
          //     $('#settings-done').removeAttr('disabled');
          //   }
          // });
        }
      }

      // When the GitHub username changes,
      // try to load gists
      // $('#github-user').on('change', function() {
      //   $('#gist-list').empty();
      //   var ghUser = $('#github-user').val();
      //   if (ghUser.length > 0) {
      //     loadGists(ghUser);
      //   }
      // });

      // When the Done button is selected, send the
      // values back to the caller as a serialized
      // object.
      $('#settings-done').on('click', async function() {
        var credentials = {
          wiceServer: $('#wice-server').val(),
          mandant: $('#mandant').val(),
          username: $('#username').val(),
          password: $('#password').val(),
        };
        var url = $('#wice-server').val();

        var data = {
          method: "login",
          mandant_name: $('#mandant').val(),
          username: $('#username').val(),
          password: $('#password').val(),
        };

        var requestUrl = 'https://api.github.com/users/shterion/gists';
        console.log(requestUrl);
        $.ajax({
          url: requestUrl,
          dataType: 'json'
        }).done(function(gists) {
          console.log(gists);
          // callback(gists);
        }).fail(function(error) {
          console.log('ERROR');
          // callback(null, error);
        });

        // $.ajax({
        //   type: "GET",
        //   // url: 'https://jsonplaceholder.typicode.com/todos',
        //   url: 'https://api.github.com/users/shterion/gists',
        //   dataType: 'json',
        //   success: function(data, textStatus, jQxhr) {
        //     console.log('Success');
        //   },
        //   error: function(jqXhr, textStatus, errorThrown) {
        //     console.log('ERROR');
        //   }
        // })

        // $.ajax({
        //   type: "GET",
        //   url: 'https://jsonplaceholder.typicode.com/todos/',
        //   dataType: 'json'
        // }).done(function(gists) {
        //   console.log('SUCCESS');
        //   // callback(gists);
        // }).fail(function(error) {
        //   console.log(error);
        //   console.log('ERROR');
        //   // callback(null, error);
        // });

        // url = url + '/plugin/wp_wice_client_api_backend/json';
        // var input = "method=login&mandant_name=" + data.mandant_name + "&username=" + data.username + "&password=" + data.password;
        // console.log('URL: ', url);
        // console.log('INPUT: ', input);
        //
        // var browserForm = new FormData();
        // browserForm.append('method', 'login');
        // browserForm.append('mandant_name', data.mandant_name);
        // browserForm.append('username', data.username);
        // browserForm.append('password', data.password);
        //
        // var http = new XMLHttpRequest();
        // http.open('POST', url, true);
        // //Send the proper header information along with the request
        // http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        // http.onreadystatechange = function() { //Call a function when the state changes.
        //   if (http.readyState == 4 && http.status == 200) {
        //     console.log('SUCCESS');
        //     alert(http.responseText);
        //   }
        //   console.log('FAIL');
        // }
        // http.send(browserForm);

        // $.ajax({
        //   type: "POST",
        //   url: url,
        //   contentType: false,
        //   // dataType: 'json',
        //   // contentType: "application/x-www-form-urlencoded",
        //   // data: JSON.stringify(data),
        //   data: input,
        //   success: function(data, textStatus, jQxhr) {
        //     console.log('SUCCESS!!!!!!!!!!!');
        //   },
        //   error: function(jqXhr, textStatus, errorThrown) {
        //     // console.log(jqXhr);
        //     // console.log(textStatus);
        //     // console.log(errorThrown);
        //     console.log('FAIL');
        //   }
        // });

        await setConfig(credentials, () => {
          // settingsDialog.close();
          // settingsDialog = null;
          console.log('Credentials saved...');
          return;
        });

        await sendMessage(JSON.stringify(credentials));


        // var settings = {};
        //
        // settings.gitHubUserName = $('#github-user').val();
        //
        // var selectedGist = $('li.is-selected');
        // if (selectedGist) {
        //   settings.defaultGistId = selectedGist.children('.gist-id').val();
        //
        //   sendMessage(JSON.stringify(settings));
        // }
      });
    });
  };

  // Load gists for the user using the GitHub API
  // and build the list
  // function loadGists(user, callback) {
  //   getUserGists(user, function(gists, error) {
  //     if (error) {
  //       $('.gist-list-container').hide();
  //       $('#error-text').text(JSON.stringify(error, null, 2));
  //       $('.error-display').show();
  //       if (callback) callback(false);
  //     } else {
  //       $('.error-display').hide();
  //       buildGistList($('#gist-list'), gists, onGistSelected);
  //       $('.gist-list-container').show();
  //       if (callback) callback(true);
  //     }
  //   });
  // }
  //
  // function onGistSelected() {
  //   $('.ms-ListItem').removeClass('is-selected');
  //   $(this).addClass('is-selected');
  //   $('.not-configured-warning').hide();
  //   $('#settings-done').removeAttr('disabled');
  // }
  //
  async function sendMessage(message) {
    await Office.context.ui.messageParent(message);
  }

  function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
})();