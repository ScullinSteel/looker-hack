var gnuplot = require('gnuplot');
var stream = require('stream');
var util = require('./util');
var debug = require('debug')('looker-hack:renderers:graph');

function render(look, data) {
  if (!data.length) {
    return Promise.reject('No data');
  }

  data.reverse();

  var keys = Object.keys(data[0]);
  var plotData = '';

  var startX;
  var endX;

  data.forEach(function(row) {
    var values = [];
    keys.forEach(function(key) {
      var value = row[key].replace(/[\$\,]/g, '');
      values.push(value);
    });
    endX = values[0];
    if (startX === undefined) {
      startX = endX;
    }
    plotData += values.join('\t') + '\n';
  });

  // debug(plotData);

  var s = new stream.Readable();
  s.push(plotData);
  s.push(null);

  var key =  util.formatLabelShort(keys[1]);

  var plot = gnuplot()
      .set('term dumb')
      // .set('nokey')
      .set('title "' + look.title + '"')
      .set('timefmt "%Y-%m-%d"')
      .set('xdata time')
      .set('xrange [ "' + startX + '":"' + endX + '" ]')
      .unset('output')
      .plot('"-" using 1:2 title "' + key + '" with points pt "."')
      .set('title "' + 'title' + '"');

  s.pipe(plot).pipe(process.stdout);

  return Promise.resolve();
}

module.exports = render;
