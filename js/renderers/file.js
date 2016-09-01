var fs = require('fs');
var util = require('./util');

function render(look, filename) {
  var deferred = Promise.defer();

  fs.readFile(filename, function(err, data) {
    if (err) {
      return deferred.reject(err);
    }

    var msg = err ? err : data.toString();

    util.renderPadded(msg);

    deferred.resolve();
  });

  return deferred.promise;
}

module.exports = render;
