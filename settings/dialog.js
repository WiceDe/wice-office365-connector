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
          $('#settings-form').on('input', function() {
            var emptyWiceServer = $('#wice-server').val();
            var emptyMandant = $('#mandant').val();
            var emptyUsername = $('#username').val();
            var emptyPassword = $('#password').val();

            // var hasSpace = $('#wice-server').val().indexOf(' ') >= 0;
            // console.log('HERE: ', hasSpace);
            // console.log('TEST: ', $.isEmptyObject($('#wice-server').val()));
            // console.log('TRIMMED: ', $.trim($('#wice-server').val()).length);

            if (emptyWiceServer !== '' && emptyMandant !== '' && emptyUsername !== '' && emptyPassword !== '') {
              $('#settings-done').removeAttr('disabled');
            }
          });
        } else {
          var config = getConfig();
          $('#wice-server').val(config.wiceServer);
          $('#mandant').val(config.mandant);
          $('#username').val(config.username);
          $('#password').val(config.password);

          var emptyWiceServer = $.isEmptyObject(config.wiceServer);
          var emptyMandant = $.isEmptyObject(config.mandant);
          var emptyUsername = $.isEmptyObject(config.username);
          var emptyPassword = $.isEmptyObject(config.password);

          $('#settings-form').on('input', function() {
            if (!emptyWiceServer && !emptyMandant && !emptyUsername && !emptyPassword) {
              $('#settings-done').removeAttr('disabled');
            }
          });
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