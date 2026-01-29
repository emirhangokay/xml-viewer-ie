// This file is copied into the production `build/` folder by Create React App.
// electron-builder (react-cra preset) expects an entry at `build/electron.js`.
// The simplest reliable content is to require the real Electron main script
// that lives at the app root (`main.js`). Keep this file minimal and non-empty.
/* eslint-disable */
try {
	// In the packaged ASAR, `build/electron.js` will be at `build/` and
	// the main process file is at the ASAR root: require('../main.js')
	module.exports = require('../main.js');
} catch (err) {
	// Fallback for dev environments where paths may differ.
	module.exports = require('../../main.js');
}

