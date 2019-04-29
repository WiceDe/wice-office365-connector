(function() {
  'use strict';
  var config;

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
          $('#wice-server').val(config.wiceServer);
          $('#mandant').val(config.mandant);
          $('#username').val(config.username);
          $('#password').val(config.password);

          // See if the config values were passed
          // If so, pre-populate the values
          // var user = getParameterByName('gitHubUserName');
          // var gistId = getParameterByName('defaultGistId');
        }
      }

      $('#settings-done').on('click', async function() {
        var credentials = {
          wiceServer: $('#wice-server').val(),
          mandant: $('#mandant').val(),
          username: $('#username').val(),
          password: $('#password').val(),
        };
        var url = $('#wice-server').val();

        await createSession(credentials, async function(cookie, error) {
          credentials.cookie = cookie
          await setConfig(credentials, () => {
            // settingsDialog.close();
            // settingsDialog = null;
            console.log('Credentials saved...');
            return;
          });

          await sendMessage(JSON.stringify(credentials));
        });
      });
    });
  };

  function sendMessage(message) {
    Office.context.ui.messageParent(message);
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