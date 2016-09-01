var figlet = require('figlet');
var isArray = require('lodash/isArray');
var debug = require('debug')('looker-hack:renderers:banner');
var util = require('./util');

function renderOne(data) {
  debug('rendering one', data);
  var str = '';

  Object.keys(data).forEach(function(key) {
    var label = util.formatLabel(key);
    str += label + '\n' + data[key] + '\n';
  });

  return str;
}

function render(look, data) {
  debug('rendering');
  var deferred = Promise.defer();
  var str = '';
  if (isArray(data)) {
    data.forEach(function (val) {
      str += renderOne(val);
    });
  } else {
    str += renderOne(data);
  }
  debug('rendering', str);

  figlet.text(str, { }, function(err, data) {
    if (err) {
      return deferred.reject(err);
    }
    util.renderPadded(data);
    deferred.resolve();
  });

  return deferred.promise;
}

module.exports = render;
