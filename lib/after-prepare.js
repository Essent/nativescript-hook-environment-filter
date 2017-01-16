var path = require('path');
// promisefy all the things 😇
var fs = require('mz/fs')
var glob = require('glob-promise');

var envs = ['dev', 'tst', 'acc', 'prd'];

module.exports = function (logger, platformsData, projectData, hookArgs, options) {
	var environment = process.env.ENV;

	if (envs.indexOf(environment) == -1) {
		logger.warn('does\'t not support this environment: ' + environment);
		process.exit(1);
	}

	var projectDir = projectData.projectDir;
	var platform = hookArgs.platform.toLowerCase();

	var platformData = platformsData.getPlatformData(platform);
	var platformOutDir = platformData.appDestinationDirectoryPath;
	var platformAppDir = path.join(platformOutDir, 'app');

	logger.trace('\nPlatform: ' + platform + ', Environment mode: ' + environment + '\n');

	var envsToRemove = envs.filter(function (env) {
		return env !== environment;
	}).join('|');

	var filesToRenamePromise = glob('**/*.' + environment + '.*', {
		cwd: platformAppDir
	}).then(function (filesToRename) {
		logger.trace('files to rename', filesToRename);
		return Promise.all(filesToRename.map(function (name) {
			var oldPath = path.join(platformAppDir, name);
			var newName = name.replace('.' + environment + '.', '');
			var newPath = path.join(platformAppDir, newName);
			return fs.rename(oldPath, newPath);
		}));
	});

	var filesToRemovePromise = glob('**/*.+(' + envsToRemove + ').*', {
		cwd: platformAppDir
	}).then(function (filesToRemove) {
		logger.trace('files to remove', filesToRemove);
		return Promise.all(filesToRemove.map(function (fileName) {
			return fs.unlink(path.join(platformAppDir, fileName));
		}));
	});

	return Promise.all([filesToRenamePromise, filesToRemovePromise])
		.then(function (result) {
			logger.info('Succesfully prepared platform: `' + platform + '` with environment: `' + environment + '`');
			return result;
		});
};
