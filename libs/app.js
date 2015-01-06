
/*

1. findImageFiles
2. backupAll
3. resizeAll
*/

var fs = require('fs-extra');
var debug = require('debug')('resize-tool');
var async = require('async');
var glob = require('glob');
var gm = require('gm').subClass({ imageMagick: true });


var PATH_TO_RESIZE = '/Users/dca/handbook_img_rsync';
// var ALLOW_EXT = '+(jpg|JPG)';
var ALLOW_EXT = '+(JPEG|jpeg|JPG|jpg|png|PNG)';

async.waterfall([
	
	function makeDir(callback) {
		fs.mkdir(PATH_TO_RESIZE + '_bak', callback);
	},
	
	function makeDir(callback) {
		fs.mkdir(PATH_TO_RESIZE + '_resize', callback);
	},
	
	function findImageFiles(callback) {		
		glob(PATH_TO_RESIZE + '/**/*.' + ALLOW_EXT, callback);
	},
	
	function backupAll(files, callback) {
		console.log('files', files);
		console.log('count', files.length);
		
		// 取一百做測試用
		// files = files.slice(0, 50);
		
		async.each(files, function (filePath, cb) {
			var backupPath = filePath.replace(PATH_TO_RESIZE, PATH_TO_RESIZE + '_bak');
			var resizePath = filePath.replace(PATH_TO_RESIZE, PATH_TO_RESIZE + '_resize');

			console.log('backupPath', backupPath);
			
			//TODO 錯誤處理
			fs.copySync(filePath, backupPath); //copies file
			fs.copySync(filePath, resizePath); //copies file
			cb();
			
		}, function (err) {
			callback(err, files);
		});
	},

	function resizeAll(files, callback) {
		console.log('do resize', files.length);
		
		async.eachLimit(files, 100, function (filePath, cb) {
			var resizePath = filePath.replace(PATH_TO_RESIZE, PATH_TO_RESIZE + '_resize');
			
			gm(filePath).size(function (err, sizeValue){
				if (err) {
					return cb(err);
				}

				console.log('sizeValue', filePath, sizeValue);

				gm(filePath).thumb(Math.min(1000, sizeValue.width), 0, resizePath, 95, function (err, stdout, stderr, command) {
					console.log('err, stdout, stderr, command', err, stdout, stderr, command);
					cb(err);
				});
			});
			
		}, function (err) {
			callback(err);
		});	
	}
	
], function (err, res) {
	console.log('err', err);
	
	if (err && err.code === 'EEXIST') {
		console.log('EEXIST 請確認已存在的備份');
		process.exit();
	}
	console.log('res', res);
});


