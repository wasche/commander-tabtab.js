var tabtab = require('tabtab');

exports.init = function (program, binName) {
  if(process.argv.slice(2)[0] === 'completion'){
    return tabtab.complete(binName, function(err, data) {
      // simply return here if there's an error or data not provided.
      // stderr not showing on completions
      if(err || !data) { return; }

      if (data.words > 1){
        var cmds = data.line.split(' ').slice(1);
        var cmd = cmds.shift();
        if (program._execs[cmd] && typeof program._execs[cmd] !== 'function'){
          // pass through to sub-command
          var args = process.argv.slice(2);
          var path = require('path');

          var dir = path.dirname(process.argv[1]);
          var bin = path.basename(process.argv[1], '.js') + '-' + cmd;

          var local = path.join(dir, bin);
          args.unshift(local);

          require('child-process').spawn(
            'node',
            args,
            {
              cwd: process.cwd(),
              stdio: 'inherit',
              env: process.env
            }
          );
          return;
        }

        program = program.commands.filter(function(c){ return c._name === cmd; });
        if (!program){ return; }
      }

      // Log all Generic Long Options
      if(/^--\w?/.test(data.last)){
        return tabtab.log(program.options.map(function (data) {
          return data.long;
        }), data);
      }

      // Log all Generic Short Options
      if(/^-\w?/.test(data.last)){
        return tabtab.log(program.options.map(function (data) {
          return data.short;
        }), data);
      }

      // Log all inital commands

      tabtab.log(program.commands.map(function (data) {
        return data._name;
      }), data);

    });
  }
};
