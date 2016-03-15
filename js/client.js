var fetch = require('node-fetch');
var debug = require('debug')('looker-hack:client');
var netrc = require('netrc');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

function Client(host) {
  var apiHost = host || process.env.LOOKER_HOST;
  var rc = netrc()[apiHost];

  var clientId = (rc && rc['login']) || process.env.LOOKER_CLIENT;
  var secret = (rc && rc['password']) || process.env.LOOKER_SECRET;

  var apiBase = 'https://' + apiHost + '/api/3.0';

  return {
    login: function() {
      var client = this;

      debug('Requesting login');
      return fetch(apiBase + '/login?client_id=' + clientId + '&client_secret=' + secret, {
        method: 'POST'
      })
      .then(function(res) {
        return res.json();
      })
      .then(function(json) {
        if (json.access_token) {
          debug('Login succeeded');
          client.token = json.access_token;
        } else {
          throw new Error('login failed', json);
        }
        return client;
      });
    },

    headers: function() {
      var client = this;
      return {
        Authorization: 'token ' + client.token
      };
    },

    runQuery: function(queryId) {
      var client = this;
      debug('Running query ' + queryId);

      return fetch(apiBase + '/queries/' + queryId + '/run/json?apply_formatting=true&cache=true', {
        headers: client.headers()
      })
      .then(function (res) {
        debug('Query run ' + queryId);
        return res.json();
      });
    },

    look: function(lookId) {
      var client = this;
      debug('Running look ' + lookId);

      return fetch(apiBase + '/looks/' + lookId + '?cache=true', {
        headers: client.headers()
      })
      .then(function (res) {
        debug('Look run ' + lookId);
        return res.json();
      });
    },

    runLook: function(lookId) {
      var client = this;
      debug('Running look ' + lookId);

      return fetch(apiBase + '/looks/' + lookId + '/run/json?apply_formatting=true&cache=true', {
        headers: client.headers()
      })
      .then(function (res) {
        debug('Look run ' + lookId);
        return res.json();
      });
    }
  };
}


module.exports = Client;
