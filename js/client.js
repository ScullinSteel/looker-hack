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
        client.token = null;

        if (json.access_token) {
          debug('Login succeeded');
          client.token = json.access_token;

          if (client.loginTimer) {
            clearTimeout(client.loginTimer);
          }

          if (json.expires_in) {
            debug('Login expires in ' + json.expires_in);

            client.loginTimer = setTimeout(function() {
              client.token = null;
            }, json.expires_in * 500);
          }
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

    checkLogin() {
      var client = this;

      if (client.token) {
        return Promise.resolve(client);
      } else {
        return client.login();
      }
    },

    runQuery: function(queryId) {
      return this.checkLogin().then(function(client) {
        debug('Running query ' + queryId);

        return fetch(apiBase + '/queries/' + queryId + '/run/json?apply_formatting=true&cache=true', {
          headers: client.headers()
        })
        .then(function (res) {
          debug('Query run ' + queryId);
          return res.json();
        });
      });
    },

    look: function(lookId) {
      return this.checkLogin().then(function(client) {
        debug('Running look ' + lookId);

        return fetch(apiBase + '/looks/' + lookId + '?cache=true', {
          headers: client.headers()
        })
        .then(function (res) {
          debug('Got look ' + lookId);
          return res.json();
        });
      });
    },

    runLook: function(lookId) {
      return this.checkLogin().then(function(client) {
        debug('Running look ' + lookId);

        return fetch(apiBase + '/looks/' + lookId + '/run/json?apply_formatting=true&cache=true', {
          headers: client.headers()
        })
        .then(function (res) {
          debug('Ran look ' + lookId);
          return res.json();
        });
      });
    }
  };
}


module.exports = Client;
