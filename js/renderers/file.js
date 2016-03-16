var fs = require('fs');
var util = require('./util');

function render(filename, done) {
  fs.readFile(filename, function(err, data) {
    if (err) {
      throw err;
    }

    var msg = err ? err : data.toString();

    util.renderPadded(msg);

    done();
  });
}

module.exports = render;
