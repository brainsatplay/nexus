# #!/bin/bash
# clean dist folders
sudo rm -rf dist
# build the dist for public url 
npm run build
# make sure to add dist 
git add dist -f

# commit the GH pages changes 
git commit -m "gh-pages commit"
# push to subtree remote 
git subtree push --prefix dist origin gh-pages
