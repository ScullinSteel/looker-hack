var Client = require('./client');
var GetOpt = require('node-getopt');
var debug = require('debug')('looker-hack:main');
var fs = require('fs');
var renderers = {
  banner: require('./renderers/banner'),
  file: require('./renderers/file'),
  graph: require('./renderers/graph'),
  table: require('./renderers/table')
};

var config = {};

var cli;
var client;
var curPage = 0;

function render() {
  var page = config.pages[curPage];

  function done() {
    curPage = (curPage + 1) % config.pages.length;

    if (!(cli.options.debug && cli.options.page)) {
      setTimeout(render, page.duration * 1000);
    }
  }

  if (page.lookId) {
    debug('getting look', page.lookId);
    client.look(page.lookId).then(function(look) {
      debug('running look');
      client.runLook(page.lookId)
      .then(function(data) {
        debug('look complete');
        renderers[page.renderer](look, data, done);
      })
      .catch(function(err) {
        renderers.banner(look, err, done);
      });
    })
    .catch(function(err) {
      renderers.banner(null, err, done);
    });
  } else {
    renderers[page.renderer](page.data, done);
  }
}

function main() {
  var getopt = new GetOpt([
    ['d', 'debug', 'Debug flag'],
    ['p', 'page=ARG', 'Start page #']
  ]);

  cli = getopt.bindHelp().parseSystem();

  if (cli.options.page) {
    curPage = parseInt(cli.options.page, 10);
  }

  fs.readFile('config.json', function(err, data) {
    if (err) {
      throw err;
    }

    config = JSON.parse(data);

    client = new Client(config.host);

    render();
  });
}

module.exports = main;
