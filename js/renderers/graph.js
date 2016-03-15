var gnuplot = require('gnuplot');
var stream = require('stream');
var util = require('./util');

function render(look, data, done) {
  if (!data.length) {
    return;
  }

  data.reverse();

  var keys = Object.keys(data[0]);
  var plotData = '';

  data.forEach(function(row) {
    var values = [];
    keys.forEach(function(key) {
      values.push(row[key]);
    });
    plotData += values.join('\t') + '\n';
  });

  // console.log(plotData);

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
      .set('xrange [ "2015-12-17":"2016-03-15" ]')
      .unset('output')
      .plot('"-" using 1:2 title "' + key + '" with points pt "."')
      .set('title "' + 'title' + '"');

  s.pipe(plot).pipe(process.stdout);

  done();
}

module.exports = render;
