# Generic Database Service

## Prerequisites
- Existing installation of [MongoDB](http://www.mongodb.org/downloads) as the target datastore.
- Current version requirement for MongoDB is `2.6.3`

## Getting Started
Before starting ensure you have installed all dependencies (`npm install`) and that MongoDB is currently running (preferably as a service).

To execute from the command line execute the main service module:

`node generic-database-service.js`

## Execution Options
To access the current execution options run `node generic-database-service.js --help`

Current Options:
```
  Usage: generic-database-service [options]

  Options:

    -h, --help                              output usage information
    -V, --version                           output the version number
    -p, --port [port number]                interface port to open [8080]
    --mongo-host [mongodb host]             hostname for MongoDB instance [localhost]
    --mongo-port [mongodb port]             port for MongoDB instance [27017]
    --mongo-options [options file]          optional MongoDB options JSON file
    --mongo-credentials [credentials file]  optional MongoDB credentials JSON file
    -k, --key [key file]                    optional private PKI key in PEM format for decrypting encrypted credential information
    --auth ["msco", "trust", "dev"]         specify authentication module to use
    --auth-options [options file]           authentication options JSON file
    --no-development                        disable development mode logging
```

### Authentication Modules
Authentication modules are implemented as [Passport](http://passportjs.org/) strategies and offer varrying levels of authentication methods for production, develoment, and testing purposes.

`msco`: Production module intended to utilize the `msco-consumer` model project to cross-reference consumer identifications from a configurable HTTP header with database access permissions.

`dev`: Development module in which specific access rights to the specified are directly granted based on the value of configurable HTTP header. This module mirrors the permission requirements as in the `msco` authentication module therefore one must pass in the header either `read` or `manage` for `GET` requests and `manage` for `POST`, `PUT`, and `DELETE` requests.  
__NOTE__: This module shold only be used for development purposes and shoudl not be utilized in a production environment.

`trust`: A fully trusting authentication module which always grants access rights to the incoming connection.  
__NOTE__: This module shold only be used for testing purposes and shoudl not be utilized in a production environment.

#### Authentication Module Options
Options to the authentication file are stored as a JSON file and the path to this file passed via the `--auth-options` command flag. Currently supported options and their defaults are as follows:
```javascript
{
    // HTTP Header value for which the consumer identifier will be specified
    'identityHeader': 'X-Auth-Identity',

    // Access requirements necessary for each REST method
    'accessRequirements' : {
        'GET': ['manage', 'read'],
        'POST': ['manage'],
        'PUT': ['manage'],
        'DELETE': ['manage']
    }
}
```

### MongoDB Credentials
Credentials to authenticate the service to MongoDB are stored as a JSON file and the path to this file passed via the `--mongo-credentials` command flag. The format of the credentials file is as follows:

```javascript
{
    // MongoDB username used to authenticate the service
    'username': '',

    // MongoDB password used to authenticate the service.
    'password': ''
}
```

#### Encryption of Credentials Password
STIG requirements states that any sensetive data such as passwords must be encrypted at rest. To this end the Generic Database Service utilizes existing PKI tokens to leverage the RSAES-OAEP encryption/decryption scheme from the [PKCS #1](http://en.wikipedia.org/wiki/PKCS_1) family of [Public-Key Cryptography Standards](http://en.wikipedia.org/wiki/PKCS). The Generic Database Access Service provides access to this functionality through the [node-forge](https://github.com/digitalbazaar/forge) package and via utilities within the encryption directory:

##### encryption-manager.js

An encryption/decryption management module that can be imported into NodeJS applications to provide access to encryption and decryption routines.

##### util/encrypt-credentials.js

A command-line utility to encrypt credentials against a provided public PKI token such as a Public PKI Key or x509 Certificate. The encrypted ciphertext is displayed to the console in Base64 encoding. This utility utilizes the `encryption-manager.js` module and also provides a practical usage example of the module for encryption purposes.

```
  Usage: encrypt-credentials [options] <credentials>

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -c, --cert [certificate file]  x509 public certificate to utilize for encryption.
    -k, --key [key file]           PEM public key to utilize for encryption.
```

##### util/decrypt-credentials

An example command-line utility to decrypt Base64 encoded credentials against a provided private PKI token such as a Private PKI Key. This utility utilizes the `encryption-manager.js` module and also provides a practical usage example of the module for decryption purposes and a method for confirming proper functionality of the Private PKI key in conjunction with the utilized public PKI token.

```
  Usage: decrypt-credentials [options] <credentials>

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -k, --key [key file]  PEM private key to utilize for decryption.
```

##### Encryptiong Usage
In order to utilize the provided encryption services for use within the Generic Database Access Service the following workflow should be implemented:

###### Prerequisites

* [Secure](http://docs.mongodb.org/manual/tutorial/enable-authentication/) your MongoDB database according to IA requirements making note of the desired username and password created for the Generic Database Access Service.
* Ensure you have generated proper PKI tokens for your system. For an example of how to generate these token using OpenSSL see the `test/pki/create-certificates.sh` script.  
__NOTE__: When generating these token ensure that proper access permissions are assigned to the files to limit access to the data.

###### Workflow

1. Use the `encrypt-credentials.js` utility in conjunction with either your Public PKI key in conjunction with the `--key` option or your x509 Certificate in conjunction with the `--cert` option to encrypt the desired password for the Generic Database Access Service.
2. Place the Base64 encoded encrypted password output from step 1 into the password field of the [MongoDB credentials file](#mongodb-credentials).
3. When [executing](#execution-options) the Generic Database Access Service provide both the `--mongo-credentials` option to the file with the encrypted credentials and the `--key` options with the path to the Private PKI Key to use for decryption.

## REST API Documentation
The Generic Database Service exposes itself as a standards compliant REST service and provides standard [CRUD](http://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations.

### REST Variables
* `SERVICE_URL`: Base URL for accessing the running Generic Database Service. `Default: http://localhost:8080`
* `DATABASE_NAME`: Name of the MongoDB database upon which the request shall execute.
* `COLLECTION_NAME`: Name of the MongoDB collection upon which the request shall execute.
* `DOCUMENT_ID`: ID of the target document for the request. For documents this is the `_id` value as returned by the service.
* `UNIQUE_KEY`: Key of the data used to validate uniqueness within the collection.

### GET a document or documents from a collection
Returns all the documents from a supplied `DATABASE_NAME` and `COLLECTION_NAME`. If an optional `DOCUMENT_ID` is included with the request only the specific document whose ID is specified from the specified collection will be returned.

* __REST URL__: `SERVICE_URL`/`DATABASE_NAME`/`COLLECTION_NAME`[/`DOCUMENT_ID`]
* __HTTP Method__: `GET`
* __Query String__: First level [MongoDB query criteria](http://docs.mongodb.org/manual/tutorial/query-documents/)
* __Request Data__: Not Applicable
* __Response__: `application/json` - A JSON representation of the returned document or documents

#### Additional Notes
* `DOCUMENT_ID` is optional.
* If both a `DOCUMENT_ID` is specified and query criteria are supplied via the HTTP Query String the `DOCUMENT_ID` parameter will be ignored. 
* Any query criteria supplied is scoped only to the specified database and collection.

### POST a new document into a collection
Creates a new document in the supplied `DATABASE_NAME` and `COLLECTION_NAME`. If an optional `UNIQUE_KEY` is included with the request a unique index will be created in order to ensure the uniqueness integrity of the specified field on subsequent calls.

* __REST URL__: `SERVICE_URL`/`DATABASE_NAME`/`COLLECTION_NAME`[/`UNIQUE_KEY`]
* __HTTP Method__: `POST`
* __Query String__: Not Applicable
* __Request Data__: `application/json` or `application/x-www-form-urlencoded` representation of the new document
* __Response__: `application/json` - A JSON representation of the created document

#### Additional Notes
* `UNIQUE_KEY` is optional and is only valid on the first call to the creation of a document within a collection. If the same field is provided on subsequent calls this value is ignored. Providing a different `UNIQUE_KEY` value on an existing collection will return an error.

### PUT an update to a document into a collection
Updates the specified document with the `DOCUMENT_ID` in the supplied `DATABASE_NAME` and `COLLECTION_NAME` with the supplied data.

* __REST URL__: `SERVICE_URL`/`DATABASE_NAME`/`COLLECTION_NAME`/`DOCUMENT_ID`
* __HTTP Method__: `PUT`
* __Query String__: Not Applicable
* __Request Data__: `application/json` or `application/x-www-form-urlencoded` representation of the updated document
* __Response__: `application/json` - A JSON representation of the updated document

### DELETE a document from a collection
Deletes the specified document with the `DOCUMENT_ID` from the supplied `DATABASE_NAME` and `COLLECTION_NAME`. 

* __REST URL__: `SERVICE_URL`/`DATABASE_NAME`/`COLLECTION_NAME`/`DOCUMENT_ID`
* __HTTP Method__: `DELETE`
* __Query String__: Not Applicable
* __Request Data__: Not Applicable
* __Response__: `HTTP 204`

### Running Tests
* Pre-Tests (code quality and style checks) require the installation of [JSHint](http://www.jshint.com/) globally: `npm install -g jshint`
* Unit Tests require the installation of [Mocha](http://visionmedia.github.io/mocha/) globally: `npm install -g mocha`
* Ensure you have a local MongoDB instance running at: mongodb://localhost
* From the `generic-database-service` project directory execute `npm test`