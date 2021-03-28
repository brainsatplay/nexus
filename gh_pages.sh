# #!/bin/bash
# clean dist folders
sudo rm -rf dist
# build the dist for public url 
webpack --config ./bundler/webpack.prod.js
# make sure to add dist 
git add dist -f
# commit the GH pages changes 
git commit -m "gh-pages commit"
# push to subtree remote 
git push origin `git subtree split --prefix dist main`:gh-pages --force
# revert last commits 
git reset --hard
