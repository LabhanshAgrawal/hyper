cd dist/mac
rm ../Hyper-3.1.0-canary.1-mac.zip
../../node_modules/7zip-bin/mac/7za a -mm=Deflate -r ../Hyper-3.1.0-canary.1-mac.zip Hyper.app
../../node_modules/app-builder-bin/mac/app-builder blockmap -i ../Hyper-3.1.0-canary.1-mac.zip # -o ../throwaway.zip >../blockmap.json
