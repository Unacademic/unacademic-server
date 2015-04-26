var readYaml = require('./read_yaml.js');
var transformYaml = require('./transform_yaml.js');
var fs = require('fs');

"use strict";

var filenames = readYaml.filenames;
var userMetadata = readYaml.userMetadata;
var constellationMetadata = readYaml.constellationMetadata;
var checkpoints = readYaml.readAllCheckpoints(filenames);

var seedData = {
	"constellations": [],
	"waypoints": [],
	"constellation_waypoints": [],
	"checkpoints": [],
	"resources": [],
	"waypoint_objectives": []
}

var yamlConstellation = transformYaml.makeYamlConstellation(checkpoints);
transformYaml.transformConstellation(yamlConstellation, userMetadata, constellationMetadata, seedData, function(err) {
	if (err) {
		console.log('exiting with error code ' + err);
		process.exit(err);
	}
	fs.writeFile('waypoints.seeding.json', JSON.stringify(seedData.waypoints));
	fs.writeFile('constellations.seeding.json', JSON.stringify(seedData.constellations));
	fs.writeFile('checkpoints.seeding.json', JSON.stringify(seedData.checkpoints));
});




