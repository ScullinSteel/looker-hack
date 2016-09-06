var fetch = require('node-fetch');
var debug = require('debug')('looker-hack:client');
var netrc = require('netrc');
var Swagger = require('swagger-client');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

function Client(host) {
  var apiHost = host || process.env.LOOKER_HOST;
  var rc = netrc()[apiHost];

  var clientId = (rc && rc['login']) || process.env.LOOKER_CLIENT;
  var secret = (rc && rc['password']) || process.env.LOOKER_SECRET;

  var apiBase = 'https://' + apiHost + '/api/3.0';
  var token;
  var loginTimer;
  var client;

  return {
    login: function() {
      debug('Requesting login');
      return fetch(apiBase + '/login?client_id=' + clientId + '&client_secret=' + secret, {
        method: 'POST'
      })
      .then(function(res) {
        return res.json();
      })
      .then(function(json) {
        token = null;

        if (json.access_token) {
          debug('Login succeeded');
          token = json.access_token;

          client = new Swagger({
            url: apiBase + '/swagger.json',
            usePromise: true,
            authorizations: {
              token: new Swagger.ApiKeyAuthorization('Authorization', 'token ' + token, 'header')
            }
          });

          if (loginTimer) {
            clearTimeout(loginTimer);
          }

          if (json.expires_in) {
            debug('Login expires in ' + json.expires_in);

            loginTimer = setTimeout(function() {
              token = null;
            }, json.expires_in * 500);
          }
        } else {
          throw new Error('login failed', json);
        }
        return client;
      });
    },

    checkLogin: function() {
      if (token) {
        return Promise.resolve(client);
      } else {
        return this.login();
      }
    }
  };
}


module.exports = Client;
