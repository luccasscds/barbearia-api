var_branch_production='production'
var_url_origin=$(git remote get-url origin)
# git branch --show-current

npm run build
npm version patch
var_version=`node -e "console.log(require('./package.json').version)"`
git commit --amend -m 'v'$var_version

# Git
git push origin --tags
git push origin HEAD

cd dist/
# Git
git init
git checkout -b $var_branch_production
git add -A
git commit -m '🚀 Deploy v'$var_version
git push -f $var_url_origin $var_branch_production

cd ..