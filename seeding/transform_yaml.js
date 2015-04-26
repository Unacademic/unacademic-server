//var constellations = require('./constellations.js');

// temporary hack to generate ids
var idCounter = {
	"constellation": 0,
	"constellation_waypoint": 0,
	"waypoint": 0,
	"checkpoint": 0,
	"resource": 0
}

var getNewId = function(type) {
	idCounter[type]++;
	return idCounter[type];
}

var makeYamlConstellation = function(checkpoints) {
	return {"checkpoints": checkpoints};
}

var transformConstellation = function(yamlConstellation, userMetadata, constellationMetadata, seedData, callback) {
	var cthConstellation = new CthConstellation(userMetadata, constellationMetadata);
	// get constellation id
	cthConstellation['id'] = getNewId('constellation');

	// transform YAML checkpoints to CtH waypoints
	for (var i in yamlConstellation['checkpoints']) {
		var cthWaypointId = transformWaypoint(yamlConstellation['checkpoints'][i], userMetadata, seedData);
		cthConstellation['waypoints'].push(cthWaypointId);
		// create constellation_waypoint to connect waypoints to constellation
		var cthConstellationWaypoint = new CthConstellationWaypoint(cthConstellation['id'], cthWaypointId, yamlConstellation['checkpoints'][i]);
		seedData['constellation_waypoints'].push(cthConstellationWaypoint);
	}

	// add constellation to seed data
	seedData['constellations'].push(cthConstellation);
	//console.log(JSON.stringify(seedData.constellation_waypoints, undefined, 4));
	return callback(0);
}


var transformWaypoint = function(yamlCheckpoint, userMetadata, seedData) {
	var cthWaypoint = new CthWaypoint(yamlCheckpoint, userMetadata);
	cthWaypoint['id'] = getNewId('waypoint');

	// transform YAML tasks to CtH checkpoints
	for (var i in yamlCheckpoint['tasks']) {
		var cthCheckpoint = transformCheckpoint(yamlCheckpoint['tasks'][i], userMetadata, seedData);
		// checkpoints is not yet implemented in waypoint model
		cthWaypoint['checkpoints'].push(cthCheckpoint);
	}
	seedData['waypoints'].push(cthWaypoint);
	return cthWaypoint['id'];
}


var transformCheckpoint = function(yamlTask, userMetadata, seedData) {
	var cthCheckpoint = new CthCheckpoint(yamlTask, userMetadata);
	cthCheckpoint['id'] = getNewId('checkpoint');

	// transform YAML resources to CtH resources
	for (var i in yamlTask['resources']) {
		var cthResource = transformResource(yamlTask['resources'][i], userMetadata, seedData);
		// resources is not yet implemented in checkpoint model
		cthCheckpoint['resources'].push(cthResource);
	}

	seedData['checkpoints'].push(cthCheckpoint);
	return cthCheckpoint;
}

var transformResource = function(yamlResource, userMetadata, seedData) {
	var cthResource = new CthResource(yamlResource, userMetadata);
	cthResource['id'] = getNewId('resource');
	seedData['resources'].push(cthResource);
	return cthResource;
}

function CthConstellation(userMetadata, constellationMetadata) {
	this['id'] = null;
	// set cthConstellation metadata
	this["curator"] =  userMetadata.user_name;
	this["curator_org"] =  userMetadata.organisation;
	this["contributors"] = [];
	this["title"] =  constellationMetadata.title;
	this["keywords"] =  constellationMetadata.keywords;
	this["description"] =  constellationMetadata.description;
	this["summary"] =  "";
	this["version"] =  constellationMetadata.version;
	this["license"] =  constellationMetadata.licence;
	this["image_url"] = "";
	this["asset_urls"] = [];
	this["forks"] = [];
	this["forked_from"] = null;
	this["waypoints"] =  [];
	this["learners"] = [];
}

function CthConstellationWaypoint(cthConstellationId, cthWaypointId, yamlCheckpoint) {
	this['id'] = getNewId('constellation_waypoint');
	this["constellation_id"] = cthConstellationId;
	this["piep_id"] = cthWaypointId;
	this["notes"] = null;
	// Currently not implemented in constellation-waypoint model:
	this["level"] =  yamlCheckpoint.level;
	this["title"] =  yamlCheckpoint.title;
	this["points"] =  yamlCheckpoint.points;
	this["mandatory"] =  yamlCheckpoint.mandatory;
	this["technologies"] =  yamlCheckpoint.technologies;
}

function CthWaypoint(yamlCheckpoint, userMetadata) {
	this["id"] = null;
	this["curator"] = userMetadata.user_name;
	this["curator_org"] =  userMetadata.organisation;
	this["contributors"] = [];
	// 'title' is preferred over 'name':
	this["title"] = yamlCheckpoint.title;
	this["description"] = yamlCheckpoint.description.full;
	this["summary"] = yamlCheckpoint.description.summary;
	this["version"] =  null;
	this["keywords"] = ["cth-" + yamlCheckpoint['category']];
	// preferred listing checkpoints instead of resources:
	this["checkpoints"] =  [];
	//this["resources"] = [];
}

function CthCheckpoint(yamlTask, userMetadata) {
	var fields = ['description','instructions'];
	fields.forEach(function(field) {
		if (!(field in yamlTask)) {
			yamlTask[field] = '';
		}
	});
	this['id'] = null;
	// 'curator' is preferred over author
	this["curator"] = userMetadata.user_name;
	// 'curator_org' is preferred over author_org
	this["curator_org"] =  userMetadata.organisation;
	// description is preferred over content
	this["description"] = yamlTask.description;
	this["keywords"] = [];
	// currently not implemented in piep model:
	this["title"] = yamlTask.title;
	this["instructions"] = yamlTask.instructions;
	this["resources"] = [];
}

function CthResource(yamlResource, userMetadata) {
	this['id'] = null;
	// 'curator' is preferred over author:
	this["curator"] = userMetadata.user_name;
	// 'curator_org' is preferred over author_org:
	this["curator_org"] =  userMetadata.organisation;
	this["title"] = yamlResource.title;
	//this["description"] = yamlResource.description;
	// checkpoint_id should allow list of checkpoints?
	this["checkpoint_id"] = "";
	// 'site_url' is preferred over github_url:
	this["keywords"] = [];
	// currently not implemented in piep model
	this["resourceType"] = yamlResource.type;
	this["site_url"] = "";
	this["site_name"] = "";
	if ('site' in yamlResource) {
		this["site_url"] = yamlResource.url;
		this["site_name"] = yamlResource.site.name;
	}
}

module.exports.makeYamlConstellation = makeYamlConstellation;
module.exports.transformConstellation = transformConstellation;
