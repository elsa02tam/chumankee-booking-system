set -e
set -x

source ../config

cd ../server
pnpm i
NODE_ENV=development ORIGIN=$origin npx ts-node src/core.ts

cd ../frontend
pnpm i
npm run build

ssh $server "
  mkdir -p ~/$project_name/server
"

rsync -SavLP \
  www \
  $server:"~/$project_name/server"

echo "done."
