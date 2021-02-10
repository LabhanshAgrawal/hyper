// eslint-disable-next-line no-unused-vars
const packager = require('electron-packager');
const snap = require('electron-installer-snap');

const arch = 'arm64';

// packager({ dir: './target', platform: 'linux', arch: arch })
//     .then(paths => snap({ src: paths[0], arch: arch }))
//     .then(snapPath => {
//         console.log(`Created snap at ${snapPath}!`)
//     })

snap({src: './dist/linux-arm64-unpacked', arch: arch}).then((snapPath) => {
  console.log(`Created snap at ${snapPath}!`);
});
