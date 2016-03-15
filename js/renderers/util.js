var capitalize = require('lodash/capitalize');

var height = 24;
var width = 80;

var SPACE = '                                                                                ';

function formatLabel(label) {
  return capitalize(label.replace(/[\._]/g, ' '));
}

function formatLabelShort(label) {
  label = label.split('.')[1];
  return formatLabel(label);
}

function formatCenter(label) {
  label = label.substr(0, width);
  label = SPACE.substr(0, parseInt(width / 2 - label.length / 2), 10) + label;

  return label;
}

function renderPadded(str) {
  var parts = str.split('\n');

  for (var idx = 0; idx < height - 1; idx++) {
    if (idx < parts.length) {
      console.log(parts[idx].substr(0, width));
    } else {
      console.log();
    }
  }
}

module.exports = {
  formatLabel: formatLabel,
  formatLabelShort: formatLabelShort,
  formatCenter: formatCenter,
  renderPadded: renderPadded
};
