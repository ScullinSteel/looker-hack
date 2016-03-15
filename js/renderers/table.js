var debug = require('debug')('looker-hack:renderers:table');
var util = require('./util');
var SPACE = '                                                                                ';
var LINE = '--------------------------------------------------------------------------------';

function render(look, data, done) {
  debug('rendering');

  if (!data.length) {
    return;
  }

  var str = util.formatCenter(look.title);
  str += '\n';

  var first = data[0];
  var headers = {};
  var widths = {};
  var keys = Object.keys(first);

  function divider() {
    str += '+';
    keys.forEach(function(key) {
      str += LINE.substr(0, widths[key]);
      str += '+';
    });
    str += '\n';
  }

  keys.forEach(function (key) {
    headers[key] = util.formatLabelShort(key);
    widths[key] = headers[key].length;
  });

  data.forEach(function(row) {
    Object.keys(row).forEach(function (key) {
      widths[key] = Math.max(widths[key], row[key].length);
    });
  });

  divider();

  str += '|';
  keys.forEach(function(key) {
    str += headers[key];
    str += SPACE.substr(0, widths[key] - headers[key].length);
    str += '|';
  });
  str += '\n';

  divider();

  data.forEach(function(row) {
    str += '|';
    keys.forEach(function(key) {
      str += row[key];
      str += SPACE.substr(0, widths[key] - row[key].length);
      str += '|';
    });
    str += '\n';
  });

  divider();

  util.renderPadded(str);
  done();
}

module.exports = render;
