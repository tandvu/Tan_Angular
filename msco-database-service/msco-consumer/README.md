# Generic Database Service - Consumer Model Project

## Getting Started

As this project is intended to be shared amongst the `generic-database-service` and `generic-database-admin` projects the msco-consumer project needs to be linked between the two using the following methodology:

1. From the `msco-consumer` project directory execute `npm link; npm install`
2. From the `generic-database-service` project directory execute `npm install; npm link msco-consumer`
3. From the `generic-database-admin` project execute `npm install; npm link msco-consumer`

## Design

The consumer model consist of three constituent object types: `Consumer`, `Role`, `Database Access`.

### Consumer
The base object which correlates to a single consumer to a number of associated `Role`s.

### Role
An associative object which groups a number of `DatabaseAccess` attributes.

### DatabaseAccess
A rule object which associates an access capability to a specific database.

### Running Tests
* Pre-Tests (code quality and style checks) require the installation of [JSHint](http://www.jshint.com/) globally: `npm install -g jshint`
* Unit Tests require the installation of [Mocha](http://visionmedia.github.io/mocha/) globally: `npm install -g mocha`
* Ensure you have a local MongoDB instance running at: mongodb://localhost
* From the `msco-consumer` project directory execute `npm test`