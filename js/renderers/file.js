var fs = require('fs');
var util = require('./util');

function render(look, filename) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, function(err, data) {
      if (err) {
        return reject(err);
      }

      var msg = err ? err : data.toString();

      util.renderPadded(msg);

      resolve();
    });
  });
}

module.exports = render;
