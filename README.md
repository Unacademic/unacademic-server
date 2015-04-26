# unacademic-API

This is the repository of the API for the Coding the Humanities unacademic web application.

## Up and Running (quick and dirty)

1. Fork and clone this repository.
2. Move into the repo directory with `cd unacademic-api`.
3. Install dependencies with `npm install`.
4. Run `grunt` to begin a watch and lint task.
5. Run `mocha test/<resource name>`(e.g. `mocha test/places.js`)   to run the tests.
5. Run `node index.js` to start the server.

## Setting up local development environment with vagrant
1. ensure [ansible > 1.8.2](http://docs.ansible.com/intro_installation.html), [virtualbox](https://www.virtualbox.org/wiki/Downloads) and [vagrant > 1.7.2](https://www.vagrantup.com/downloads.html) are installed.
2. `npm install`.
3. `vagrant up`
4. `npm run provision-vagrant`
5. `vagrant ssh`
6. inside the vagrant box, run
    - `cd /home/deploy/unacademic/`
    - `pm2 start index.js`
    - when necessary, reload the server with `pm2 reload all`
    - view logs of pm2 with `pm2 logs`
7. visit browser `33.33.33.33` and `33.33.33.33/api/0`

## Setting up staging environment
1. create a box on [digitalocean](digitalocean.com) and change the root password through SSH
2. configure the ip adress in `devops/inventories/staging.yml`
3. `npm run provision-staging`

## Deploying to environment
1. commit all required changes to repository
2. `npm run deploy-staging`

## Seeding the databse
1. move to seeding directory
	- `cd seeding`
2. run yaml to json transformation
	- `node prepare_seeds.js`
3a. seed database if it’s empty:
	- `node seedData.js`
3b. alternatively, empty database and seed it:
	- `node dropAndSeedData.js`
