function getConfig() {
  var config = {};
  console.log('GET CONFIG');

  config.wiceServer = Office.context.roamingSettings.get('wiceServer');
  config.mandant = Office.context.roamingSettings.get('mandant');
  config.username = Office.context.roamingSettings.get('username');
  config.password = Office.context.roamingSettings.get('password');

  return config;
}

function setConfig(config, callback) {
  console.log('SET CONFIG');
  Office.context.roamingSettings.set('wiceServer', config.wiceServer);
  Office.context.roamingSettings.set('mandant', config.mandant);
  Office.context.roamingSettings.set('username', config.username);
  Office.context.roamingSettings.set('password', config.password);

  Office.context.roamingSettings.saveAsync(callback);
}