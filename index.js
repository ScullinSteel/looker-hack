#!/usr/bin/env node

require('es6-promise').polyfill();

var main = require('./js/main');
var util = require('util');

main(util.argv);
