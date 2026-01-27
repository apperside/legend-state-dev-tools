#!/usr/bin/env bash
set -euo pipefail

npm run build

cp -r packages/core/dist ./dist

# Back up original package.json and create a publish-only version
cp package.json package.json.bak

restore() {
  mv package.json.bak package.json 2>/dev/null || true
}
trap restore EXIT

node -e "
const pkg = require('./package.json.bak');
const publish = {};
for (const key of ['name','version','private','main','module','types','exports','files','license']) {
  if (key in pkg) publish[key] = pkg[key];
}
require('fs').writeFileSync('package.json', JSON.stringify(publish, null, 2) + '\n');
"

npm publish
