//var YAML = require('yamljs');
var yaml = require('js-yaml');
var fs = require('fs');

var yamlDir = 'yaml/'
var filenames = fs.readdirSync(yamlDir)
/*
var filenames = [
	"yaml/000_CSS.yaml",
	"yaml/000_City_Walk.yaml",
	"yaml/000_Gists.yaml",
	"yaml/000_HTML.yaml",
	"yaml/001_DOM.yaml",
	"yaml/001_Dev_Tools.yaml",
	"yaml/001_JSON.yaml",
	"yaml/001_Photostack.yaml",
	"yaml/001_Templating.yaml",
	"yaml/002_Communication_Between_Components.yaml",
	"yaml/002_Custom_Elements.yaml",
	"yaml/002_From_Idea_To_Component.yaml",
	"yaml/002_Web_Architecture.yaml",
	"yaml/002_Web_Components.yaml",
	"yaml/003_Component_Lifecycle.yaml",
	"yaml/003_Data_Structures.yaml",
	"yaml/003_Forms.yaml",
	"yaml/003_From_Paper_to_Polymer.yaml"
];
*/

var userMetadata = {
	"first_name": "Jan Hein",
	"last_name": "Hoogstad",
	"user_name": "yeehaa",
	"user_id": 123123,
	"avatar_url": "http://imagename.jpg",
	"roles": ["curator","consumer","assessor"],
	"organisation": "University of Amsterdam",
};

var constellationMetadata = {
	"title": "Coding the Humanities",
	"keywords": ["programming","humanities", "tool building"],
	"licence": "MIT",
	"description": "A constellation about programming and tool building for humanities research",
	"version": "0.1.0",
};

var readCheckpoint = function(filename) {
	var checkpoint = {};
	try {
		checkpoint = yaml.load(fs.readFileSync(yamlDir + filename, 'utf8'));
	}
	catch (e) {
		console.log(e);
	}
	return checkpoint;
}

var readAllCheckpoints = function(filenames) {
	var checkpointsList = [];
	for (var index in filenames) {
		var checkpoint = readCheckpoint(filenames[index]);
		checkpointsList.push(checkpoint);
	}
	return checkpointsList;
}

module.exports.filenames = filenames;
module.exports.userMetadata = userMetadata;
module.exports.constellationMetadata = constellationMetadata;
module.exports.readCheckpoint = readCheckpoint;
module.exports.readAllCheckpoints = readAllCheckpoints;
