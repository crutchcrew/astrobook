// Publishes this fork as tarballs on a GitHub release, without npm.
//
// Usage: node scripts/release-fork.mjs <version>    e.g. 0.14.0-crutchcrew.1
//
// Each package's `@astrobook/*` dependencies point at the tarballs of the same
// release, so a project installs the fork with a single dependency:
//
//   "astrobook": "https://github.com/crutchcrew/astrobook/releases/download/v<version>/astrobook-<version>.tgz"

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const REPO = 'crutchcrew/astrobook'
const PACKAGES = ['types', 'core', 'ui', 'astrobook']

const version = process.argv[2]
if (!version || !/^\d+\.\d+\.\d+-crutchcrew\.\d+$/.test(version)) {
  console.error('Usage: node scripts/release-fork.mjs <x.y.z-crutchcrew.n>')
  process.exit(1)
}

const tag = `v${version}`
function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { stdio: 'inherit', ...opts })
}
function read(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8' }).trim()
}

if (read('git', ['status', '--porcelain'])) {
  console.error('The working tree has changes. Commit or discard them first.')
  process.exit(1)
}
const sha = read('git', ['rev-parse', 'HEAD'])

function tarballName(name) {
  return `${name.replace('@', '').replace('/', '-')}-${version}.tgz`
}
function tarballUrl(name) {
  return `https://github.com/${REPO}/releases/download/${tag}/${tarballName(name)}`
}

run('pnpm', ['run', 'build:package'])

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astrobook-release-'))
const assets = []

for (const dir of PACKAGES) {
  const packDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astrobook-pack-'))
  run('pnpm', ['pack', '--pack-destination', packDir], {
    cwd: path.join('packages', dir),
  })
  const [packed] = fs.readdirSync(packDir)
  run('tar', ['-xzf', path.join(packDir, packed), '-C', packDir])

  const manifestPath = path.join(packDir, 'package', 'package.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  manifest.version = version
  for (const name of Object.keys(manifest.dependencies ?? {})) {
    if (name === 'astrobook' || name.startsWith('@astrobook/')) {
      manifest.dependencies[name] = tarballUrl(name)
    }
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')

  const asset = path.join(outDir, tarballName(manifest.name))
  run('tar', ['-czf', asset, '-C', packDir, 'package'])
  assets.push(asset)
}

run('gh', [
  'release',
  'create',
  tag,
  ...assets,
  '--repo',
  REPO,
  '--target',
  sha,
  '--title',
  tag,
  '--notes',
  `Fork build of ${sha}. Install with:\n\n\`\`\`json\n"astrobook": "${tarballUrl('astrobook')}"\n\`\`\``,
])
