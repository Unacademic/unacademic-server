var expect = require("chai").expect;
var superagent = require("superagent");
var mongoose = require('mongoose');
const express = require('express');
const app = express();
var BPromise = require('bluebird');
var Waypoint = require('../api/modules/waypoints/schema');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '8080';

var apiURL = 'http://' + host + ':' + port + '/' + 'api/0/waypoints';

var mongoLocalURL = "mongodb://localhost/unacademic_api";
var mongoLabURL = "mongodb://admin:eOZE.97iNn@ds029051.mongolab.com:29051/unacademic_api";

var mongoURL = mongoLabURL;

function resetWaypoints() {
    return new BPromise(function(resolve, reject) {
        mongoose.connection.collections['waypoints'].drop(resolve, reject);
    });
}

var connectDB = BPromise.promisify(mongoose.connect, mongoose);

var con = mongoose.connection;

con.once('open', function() {
	console.log('connected to mongodb successfully');
});

con.once('error', function() {
	console.log('MongoLab connection error');
	console.error.bind(console, 'connection error:');
});


app.use(require('../api'));

app.listen(port, host);

console.log('Server running on %s:%d...', host, port);

var mockWaypoint = {
	title: "Async",
	curator: "yeehaa",
	version: "1.0.0",
	summary: "A good way to explain asynchronicity is to take examples from everyday life",
	description: "Asynchronicity sounds like a difficult term, but it simply is an indication of action and time. Asynchronous events do not necessarily occur at the same time. They might have to wait or listen for other events to happen. To understand what asynchronicity exactly is, it is probably better to look at examples from everyday life. As a matter of fact, real life is full of asynchronous events.",
	keywords: ["AJAX", "JavaScript"],
	checkpoints: [
		{
			"description": "Learn about styling web pages with cascading style sheets.\n",
			"id": 1,
			"instructions": ["Read the article.", "Watch the instruction video."],
			"resources": [
				{
					"checkpoint_id": "",
					"curator": "yeehaa",
					"curator_org": "University of Amsterdam",
					"id": 1,
					"site_name": "CSS Tutorial",
					"site_url": "http://youtu.be/Waq1d1jpl3M",
					"title": "CSS Tutorial",
					"resourceType": "video"
				}
			],
			"title": "Introduction"
		},
		{
			"curator": "yeehaa",
			"curator_org": "University of Amsterdam",
			"description": "In order for CSS to work you first need to specify which element you wish  to apply CSS to. You do this with 'selectors'. Selectors are essentially  just names for the things you want to target and affect. Within the  {brackets} of selectors you place the effects you want to apply. In this  assignment we want you to create selectors.\n",
			"id": 2,
			"instructions": ["Read the article.", "Watch the video.", "Add selectors to the html provided in the resources for the body, the paragraphs and each separate title."],
			"resources": [
				{
					"checkpoint_id": "",
					"curator": "yeehaa",
					"curator_org": "University of Amsterdam",
					"id": 2,
					"site_name": "Mozilla Developer Network",
					"site_url": "https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Selectors",
					"title": "CSS selectors",
					"resourceType": "article"
				}, {
					"checkpoint_id": "",
					"curator": "yeehaa",
					"curator_org": "University of Amsterdam",
					"id": 3,
					"site_name": "Simple CSS Flat Design Container",
					"site_url": "http://youtu.be/irZ1ZMImZfg",
					"title": "CSS Container",
					"resourceType": "video"
				}
			],
			"title": "Selectors"
		}
	]
};

var postedWaypointId;

describe("when saving waypoints", function() {
	var postedWaypoint;
	var error;
	var status;
	var waypoints;

	describe("that are valid waypoints", function() {
		before(function(done) {
			connectDB(mongoURL)
			.then(resetWaypoints)
			.then(function() {
				superagent.post(apiURL).send(mockWaypoint).end(function(err, response) {
					error = err;
					postedWaypoint = response.body;
					status = response.status;
					postedWaypointId = postedWaypoint.id;
					done();
				});
			});
		});

		it("should return keywords in lowercased", function() {
			expect(postedWaypoint.keywords[0]).to.equal('ajax');
			expect(postedWaypoint.keywords[1]).to.equal('javascript');
		});

		it("should return a status of 200 if the database saved", function() {
			expect(status).to.equal(200);
		});
		it("should return a waypoint with an id", function() {
			expect(postedWaypoint.id).to.not.be.undefined;
		});
	});

	describe("with existing foreign key", function() {

		before(function(done) {
			superagent.post(apiURL).send(mockWaypoint).end(function(err, response) {
				error = err;
				responseError = response.error.text;
				status = response.status;
				done();
			});
		});

		it("should return an error that curator and title are an existing foreign key", function() {
			expect(responseError).to.equal('Combination of curator and title already exists');
			expect(status).to.equal(500);
		});
	});

	describe("that are incomplete", function() {

		it("should return an error if required fields are missing", function(done) {
			var invalidWaypoint = mockWaypoint;
			delete invalidWaypoint.title;
			superagent.post(apiURL).send(invalidWaypoint).end(function(err, response) {
				var error = response.error.text;

				expect(response.error.text).to.equal('Waypoint is missing required fields \'title\'')
				expect(status).to.equal(500);
				done();
			});
		});

	});

	/*
	after(function(done) {
		mongoose.connection.close();
		done();
	});
	*/

});

describe("when getting waypoints", function() {
	var error;
	var getWaypoints;
	var id;
	var status;
	before (function(done) {
		superagent.get(apiURL).end(function(err, response) {
			error = err;
			getWaypoints = response.body;
			status = response.status;
			id = getWaypoints[0].id;
			done();
		});
	});

	describe("with an existing id", function() {
		var getWaypoint;
		before (function(done) {
			superagent.get(apiURL + '/id/' + id).end(function(err, response) {
				error = err;
				getWaypoint = response.body;
				status = response.status;
				done();
			});
		});

		it("should return a waypoint with an id", function() {
			expect(getWaypoint.id).to.not.be.undefined;
		});
		it("should return a waypoint without __v field", function() {
			expect(getWaypoint.__V).to.be.undefined;
		});
		it("should return a waypoint without _id field", function() {
			expect(getWaypoint._id).to.be.undefined;
		});
		it("should return status code 200", function() {
			expect(status).to.equal(200);
		});
	});

	describe("with an non-existing id", function() {
		var id = "bla";
		var error;
		before (function(done) {
			superagent.get(apiURL + '/id/' + id).end(function(err, response) {
				error = response.error.text;
				getWaypoint = response.body;
				status = response.status;
				done();
			});
		});

		it("should return an error that there is no waypoint with that id", function() {
			expect(status).to.equal(500);
			expect(error).to.equal("Waypoint does not exist");
		});
	});

	describe('with an existing user and title', function() {
		var user = "yeehaa";
		var title = 'Async'
		before (function(done) {
			superagent.get(apiURL + '/user/' + user + '/title/' + title).end(function(err, response) {
				error = response.error.text;
				getWaypoint = response.body;
				status = response.status;
				done();
			});
		});

		it('should return a waypoint with the correct creator and title', function() {
			expect(getWaypoint.curator).to.equal(user);
			expect(getWaypoint.title).to.equal(title);
		})
	})

});

describe("when updating a waypoint", function() {
	describe("with a new title", function() {

		var mockUpdate = mockWaypoint;
		var error;
		var updatedWaypoint;

		before(function(done) {

			mockUpdate.title = "Nsync";

			superagent.put(apiURL + '/id/' + postedWaypointId).send(mockUpdate).end(function(err, response) {
				updatedWaypoint = response.body;
				done();
			});
		});

		it("should return the upddated waypoint with the new title", function() {
			expect(updatedWaypoint.title).to.equal(mockUpdate.title);
		});
	});

	describe("with a waypoint containing a new foreignKey", function() {
		var mockUpdate = mockWaypoint;
		var error;
		var updatedWaypoint;

		before(function(done) {

			mockUpdate.curator = "marijn";

			superagent.put(apiURL + '/id/' + postedWaypointId).send(mockUpdate).end(function(err, response) {
				error = response.error.text;
				updatedWaypoint = response.body;
				done();
			});
		});

		it("should return an 'unknown foreignkey' error", function() {
			expect(error).to.equal("updated waypoint has different curator than existing waypoint");
		});
	});
});
