function getConfig() {
  var config = {};

  // config.gitHubUserName = Office.context.roamingSettings.get('gitHubUserName');
  // config.defaultGistId = Office.context.roamingSettings.get('defaultGistId');

  config.wiceServer = Office.context.roamingSettings.get('wiceServer');
  config.mandant = Office.context.roamingSettings.get('mandant');
  config.username = Office.context.roamingSettings.get('username');
  config.password = Office.context.roamingSettings.get('password');
  config.cookie = Office.context.roamingSettings.get('cookie');

  return config;
}

function setConfig(config, callback) {
  // Office.context.roamingSettings.set('gitHubUserName', config.gitHubUserName);
  // Office.context.roamingSettings.set('defaultGistId', config.defaultGistId);

  Office.context.roamingSettings.set('wiceServer', config.wiceServer);
  Office.context.roamingSettings.set('mandant', config.mandant);
  Office.context.roamingSettings.set('username', config.username);
  Office.context.roamingSettings.set('password', config.password);
  Office.context.roamingSettings.set('cookie', config.cookie);

  Office.context.roamingSettings.saveAsync(callback);
}