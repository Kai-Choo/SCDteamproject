import {cpSync, existsSync, mkdirSync, rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {dirname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const portalRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(portalRoot, '..');
const publicRoot = join(portalRoot, 'public');
const viteBuilds = [
  {name: 'ArrowGame', root: join(workspaceRoot, 'ArrowGame-main')},
  {name: 'Kokang2', root: join(workspaceRoot, 'Kokang2-main')},
];

for (const game of viteBuilds) {
  const viteCli = join(game.root, 'node_modules', 'vite', 'bin', 'vite.js');
  if (!existsSync(viteCli)) {
    throw new Error(`Vite is not installed for ${game.name}. Install dependencies in ${game.root}.`);
  }

  const result = spawnSync(process.execPath, [viteCli, 'build'], {
    cwd: game.root,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${game.name} build failed with exit code ${result.status ?? 'unknown'}.`);
  }

  const output = join(game.root, 'dist');
  if (!existsSync(join(output, 'index.html'))) {
    throw new Error(`${game.name} build did not produce dist/index.html.`);
  }
}

function copyGame(source, route, filter) {
  const destination = join(publicRoot, route);
  rmSync(destination, {recursive: true, force: true});
  mkdirSync(dirname(destination), {recursive: true});
  cpSync(source, destination, {recursive: true, filter});
}

for (const game of viteBuilds) {
  copyGame(join(game.root, 'dist'), game.name, () => true);
}

const potterySource = join(workspaceRoot, 'pottery-game-complete', 'pottery-adventure');
if (!existsSync(join(potterySource, 'index.html'))) {
  throw new Error(`Pottery game entry point not found at ${potterySource}.`);
}

copyGame(potterySource, 'Pottery', (entry) => {
  const relativePath = relative(potterySource, entry);
  if (!relativePath) return true;
  return !relativePath.split(sep).some((part) =>
    ['.git', '.vite', 'node_modules'].includes(part),
  ) && relativePath !== '.gitignore';
});
