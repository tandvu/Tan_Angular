
# Encryption of Credentials Password
STIG requirements states that any sensetive data such as passwords must be encrypted at rest. To this end the ECS utilizes existing PKI tokens to leverage the RSAES-OAEP encryption/decryption scheme from the [PKCS #1](http://en.wikipedia.org/wiki/PKCS_1) family of [Public-Key Cryptography Standards](http://en.wikipedia.org/wiki/PKCS). The ECS provides access to this functionality through the [node-forge](https://github.com/digitalbazaar/forge) package and via utilities within the encryption directory:

## `encryption-manager.js`

An encryption/decryption management module that can be imported into NodeJS applications to provide access to encryption and decryption routines.

## `util/encrypt-credentials.js`

A command-line utility to encrypt credentials against a provided public PKI token such as a Public PKI Key or x509 Certificate. The encrypted ciphertext is displayed to the console in Base64 encoding. This utility utilizes the `encryption-manager.js` module and also provides a practical usage example of the module for encryption purposes.

```
  Usage: encrypt-credentials [options] <credentials>

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -c, --cert [certificate file]  x509 public certificate to utilize for encryption.
    -k, --key [key file]           PEM public key to utilize for encryption.
```

## `util/decrypt-credentials`

An example command-line utility to decrypt Base64 encoded credentials against a provided private PKI token such as a Private PKI Key. This utility utilizes the `encryption-manager.js` module and also provides a practical usage example of the module for decryption purposes and a method for confirming proper functionality of the Private PKI key in conjunction with the utilized public PKI token.

```
  Usage: decrypt-credentials [options] <credentials>

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -k, --key [key file]  PEM private key to utilize for decryption.
```

## Encryption Usage

In order to utilize the provided encryption services for use within the ECS the following workflow should be implemented:

### Prerequisites

* Ensure you have generated proper PKI tokens for your system. For an example of how to generate these token using OpenSSL see the `test/pki/create-certificates.sh` script of the `msco-database-service/generic-database-service` project.  
__NOTE__: When generating these token ensure that proper access permissions are assigned to the files to limit access to the data.

### Workflow

1. Use the `encrypt-credentials.js` utility in conjunction with either your Public PKI key in conjunction with the `--key` option or your x509 Certificate in conjunction with the `--cert` option to encrypt the desired password for the ECS.
2. Place the Base64 encoded encrypted password output from step 1 into the password field of your service configuration file. (ex. for the jBPM Basic Authentication credentials this encrypted password should be the `["jBPMService"]["jBPMPassword"]` field within the `properties/config.json` file)
3. When executing the ECS provide the `--key` option with the path to the Private PKI Key to use for decryption.
