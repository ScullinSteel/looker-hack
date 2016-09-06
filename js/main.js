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
    client.checkLogin().then(function(client) {
      client.Look.look({look_id: page.lookId}).then(function(result) {
        var look = result.obj;
        debug('running look');
        client.Look.run_look({look_id: page.lookId, result_format: 'json', apply_formatting: true}).then(function(result) {
          var data = result.obj;
          debug('look complete');
          renderers[page.renderer](look, data).then(done);
        });
      });
    })
    .catch(function(err) {
      renderers.banner(null, err).then(done);
    });
  } else {
    renderers[page.renderer](null, page.data).then(done);
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
