import { spawn } from 'child_process';
import { resolve } from 'path';

const cliPath = resolve(__dirname, '../src/bin/cli.js');

function cli(args: string[], cb: (error: string | undefined, data?: JSON) => any) {
  const cp = spawn('node', [cliPath].concat(args));
  cp.stdout.on('data', data => cb(undefined, JSON.parse(data.toString())));
  cp.stderr.on('data', data => cb(data.toString()));
  // cp.on('close', (code: any) => console.log(`child process exited with code ${code}`));
  return cp;
}

describe('TreeView cli', () => {

  it('should works!', (done) => {
    cli(['./oups'], (error, data) => {
      expect(error).toBeDefined();
      expect(data).toBeUndefined();
      done();
    });
  });

});
