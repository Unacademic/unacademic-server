var expect = require("chai").expect;
var superagent = require("superagent");
var mongoose = require('mongoose');
const express = require('express');
const app = express();
var BPromise = require('bluebird');
var Constellation = require('../api/modules/constellations/schema');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '8080';

var apiURL = 'http://' + host + ':' + port + '/' + 'api/0/constellations';

var mongoLocalURL = "mongodb://localhost/unacademic_api";
var mongoLabURL = "mongodb://admin:eOZE.97iNn@ds029051.mongolab.com:29051/unacademic_api";

var mongoURL = mongoLabURL;
//var mongoURL = mongoLocalURL;

function resetConstellations() {
    return new BPromise(function(resolve, reject) {
        mongoose.connection.collections['constellations'].drop(resolve, reject);
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

var mockConstellation = {
	"curator": "yeehaa",
	"curator_org": "University of Amsterdam",
	"description": "A constellation about programming and tool building for humanities research",
	"id": 1,
	"image_url": "",
	"keywords": ["Programming", "Humanities", "Tool building"],
	"license": "MIT",
	"summary": "",
	"title": "Coding the Humanities",
	"version": "0.1.0",
	"constellations": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
};

var postedConstellationId;

describe("when saving constellations", function() {
	var postedConstellation;
	var error;
	var status;
	var constellations;

	describe("that are valid constellations", function() {
		before(function(done) {
			connectDB(mongoURL)
			.then(resetConstellations)
			.then(function() {
				superagent.post(apiURL).send(mockConstellation).end(function(err, response) {
					error = err;
					postedConstellation = response.body;
					status = response.status;
					postedConstellationId = postedConstellation.id;
					done();
				});
			});
		});

		it("should return keywords in lowercased", function() {
			expect(postedConstellation.keywords[0]).to.equal('programming');
			expect(postedConstellation.keywords[1]).to.equal('humanities');
		});

		it("should return a status of 200 if the database saved", function() {
			expect(status).to.equal(200);
		});
		it("should return a constellation with an id", function() {
			expect(postedConstellation.id).to.not.be.undefined;
		});
	});

	describe("with existing foreign key", function() {

		before(function(done) {
			superagent.post(apiURL).send(mockConstellation).end(function(err, response) {
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
			var invalidConstellation = mockConstellation;
			delete invalidConstellation.title;
			superagent.post(apiURL).send(invalidConstellation).end(function(err, response) {
				var error = response.error.text;

				expect(response.error.text).to.equal('Constellation is missing required fields \'title\'')
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

describe("when getting constellations", function() {
	var error;
	var getConstellations;
	var id;
	var status;
	before (function(done) {
		superagent.get(apiURL).end(function(err, response) {
			error = err;
			getConstellations = response.body;
			status = response.status;
			id = getConstellations[0].id;
			done();
		});
	});

	describe("with an existing id", function() {
		var getConstellation;
		before (function(done) {
			superagent.get(apiURL + '/id/' + id).end(function(err, response) {
				error = err;
				getConstellation = response.body;
				status = response.status;
				done();
			});
		});

		it("should return a constellation with an id", function() {
			expect(getConstellation.id).to.not.be.undefined;
		});
		it("should return a constellation without __v field", function() {
			expect(getConstellation.__V).to.be.undefined;
		});
		it("should return a constellation without _id field", function() {
			expect(getConstellation._id).to.be.undefined;
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
				getConstellation = response.body;
				status = response.status;
				done();
			});
		});

		it("should return an error that there is no constellation with that id", function() {
			expect(status).to.equal(500);
			expect(error).to.equal("Constellation does not exist");
		});
	});

	describe('with an existing user and title', function() {
		var user = "yeehaa";
		var title = "Coding the Humanities";

		before (function(done) {
			superagent.get(apiURL + '/user/' + user + '/title/' + title).end(function(err, response) {
				error = response.error.text;
				getConstellation = response.body;
				status = response.status;
				done();
			});
		});

		it('should return a constellation with the correct creator and title', function() {
			expect(getConstellation.curator).to.equal(user);
			expect(getConstellation.title).to.equal(title);
		});
	});
});

describe("when updating a constellation", function() {
	describe("with a new title", function() {

		var mockUpdate = mockConstellation;
		var error;
		var updatedConstellation;

		before(function(done) {

			mockUpdate.title = "Nsync";

			superagent.put(apiURL + '/id/' + postedConstellationId).send(mockUpdate).end(function(err, response) {
				updatedConstellation = response.body;
				done();
			});
		});

		it("should return the upddated constellation with the new title", function() {
			expect(updatedConstellation.title).to.equal(mockUpdate.title);
		});
	});

	describe("with a constellation containing a new foreignKey", function() {
		var mockUpdate = mockConstellation;
		var error;
		var updatedConstellation;

		before(function(done) {

			mockUpdate.curator = "marijn";

			superagent.put(apiURL + '/id/' + postedConstellationId).send(mockUpdate).end(function(err, response) {
				error = response.error.text;
				updatedConstellation = response.body;
				done();
			});
		});

		it("should return an 'unknown foreignkey' error", function() {
			expect(error).to.equal("updated constellation has different curator than existing constellation");
		});
	});
});
