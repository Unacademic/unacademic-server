const mongoose = require('mongoose');
const fs = require('fs');
var BPromise = require("bluebird");
const api = require('unacademic-api');
const host = process.env.HOST || '0.0.0.0';
var waypointsController = api.waypoints.controller;
var Waypoint = api.waypoints.schema;
var Constellation = api.constellations.schema;
var constellationsController = api.constellations.controller;

var seedWaypoints = JSON.parse(fs.readFileSync('waypoints.seeding.json', 'utf-8'));
var seedCheckpoints = JSON.parse(fs.readFileSync('checkpoints.seeding.json', 'utf-8'));
var seedConstellations = JSON.parse(fs.readFileSync('constellations.seeding.json', 'utf-8'));
var dataTypes = ['constellations', 'waypoints'];

var mongoLocalURL = "mongodb://" + host + "/unacademic";
mongoose.connect(mongoLocalURL);
var con = mongoose.connection;


con.once('open', function() {
	console.log('connected to mongodb successfully');
	var seedPromise = seedWaypointsDB();
	seedPromise.then(function(message) {
		console.log(message);
		console.log('seeding done!');
		var seedPromise = seedConstellationsDB();
		seedPromise.then(function(message) {
			console.log(message);
			console.log('seeding done!');
			process.exit(0);
		});
	});

});

con.once('error', function() {
	console.log('MongoLab connection error!');
	console.error.bind(console, 'connection error:');
});

function resetDB(dataType) {
    return new BPromise(function(resolve, reject) {
		console.log('resetting ' + dataType + ' DB');
        mongoose.connection.collections[dataType].drop(resolve, reject);
    });
}

function seedWaypointsDB() {
	return new BPromise(function(resolve, reject) {
		waypointsController.findWaypoints({}).then(function(collection) {
			if(collection.length === 0) {
				var wCount = 0;
				var tCount = seedWaypoints.length;
				var mapPromise = BPromise.map(seedWaypoints, function(waypoint) {
					waypoint.version = "1.0.0";
					var savePromise = waypointsController.saveWaypoint(waypoint);
					savePromise.then(function(savedWaypoint) {
						wCount++;
						if (wCount === tCount) {
							resolve('seeds saved');
						}
					})
					savePromise.catch(function(error) {
						reject(error);
					})
				});
			}
			else {
				resolve('no seeding needed, already ' + collection.length + ' waypoinys in database');
			}

		});
	});
};


function seedConstellationsDB() {
	return new BPromise(function(resolve, reject) {
		constellationsController.findConstellations({}).then(function(collection) {
			if(collection.length === 0) {
				var wCount = 0;
				var tCount = seedConstellations.length;
				var mapPromise = BPromise.map(seedConstellations, function(constellation) {
					constellation.version = "1.0.0";
					var savePromise = constellationsController.saveConstellation(constellation);
					savePromise.then(function(savedConstellation) {
						wCount++;
						if (wCount === tCount) {
							resolve('seeds saved');
						}
					})
					savePromise.catch(function(error) {
						reject(error);
					})
				});
			}
			else {
				resolve('no seeding needed, already ' + collection.length + ' constellations in database');
			}

		});
	});
};

