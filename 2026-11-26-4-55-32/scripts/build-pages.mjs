import {spawnSync} from 'node:child_process';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const portalRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;

function run(args) {
  const result = spawnSync(node, args, {cwd: portalRoot, stdio: 'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Pages build failed with exit code ${result.status ?? 'unknown'}.`);
  }
}

run([join(portalRoot, 'scripts', 'prepare-games.mjs'), '--pages']);
run([
  join(portalRoot, 'node_modules', 'vite', 'bin', 'vite.js'),
  'build',
  '--base=/SCDteamproject/',
]);
