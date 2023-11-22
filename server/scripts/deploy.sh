set -e
set -x

source ../config

pnpm i
npm run build

ssh $server "
  cd $project_name/server && \
  rm -rf dist
"
rsync -SavLP \
  dist \
  uploads \
  package.json \
  $server:"~/$project_name/server"

ssh $server "
  source ~/.nvm/nvm.sh && \
  cd $project_name/server && \
  pnpm i --prod && \
  cd dist && \
  echo ln -s ../.env . && \
  npx knex migrate:latest && \
  node src/seed.js && \
  cd .. && \
  echo pm2 start --name $project_name dist/src/main.js && \
  pm2 reload $project_name && \
  pm2 log $project_name
"