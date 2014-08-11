# MSCO Node.js projects:

## Projects:

* `msco-database-service`: Generic Database Service Parent Project
    * `generic-database-admin`: MSCO Generic Database Authorization Administration Interface
    * `generic-database-service`: MSCO Generic Database Service
    * `msco-consumer`: MSCO Generic Database Consumer Model and Interface

* `EnvironmentConfigurationServices`: Mid Tier App Services

# Generic Database Service Project

## Installation
1.  From the msco-ecs/msco-database-service/msco-consumer directory run `npm link`
2.  From the msco-ecs/msco-database-service/msco-consumer directory run `npm install`
3.  From the msco-ecs/msco-database-service/generic-database-service directory run `npm link msco-consumer`
4.  From the msco-ecs/msco-database-service/generic-database-service directory run `npm install`

## Execution
To run the Generic Database Service at this time with a fully-trusting Authentication plugin from the `msco-ecs/msco-database-service/generic-database-service` directory run `node generic-database-service.js --auth trust`. Additional execution options are as follows:

        Usage: generic-database-service [options]

        Options:

        -h, --help                       output usage information
        -V, --version                    output the version number
        -p, --port [port number]         interface port to open [8080]
        --mongo-host [mongodb host]      Hostname for MongoDB instance [localhost]
        --mongo-port [mongodb port]      Port for MongoDB instance [27017]
        --mongo-options [options file]   MongoDB options JSON file
        --auth ["msco", "trust", "dev"]  specify authentication module to use
        --auth-options [options file]    Authentication options JSON file
        -d, --development                enable development mode logging


# EnvironmentConfigurationServices: Mid Tier App Services

1.  npm install

2.  cd into the ./EnvironmentConfigurationServices/properties

3.  modify the config.json to meet your environment 

4.  node environmentConfigServicesREST.js 

How to interface with the EnvironmentConfigurationServices can found EnvironmentConfigurationServices/app/routes.js. Also some examples can be found in the EnvironmentConfigurationServices/Calling ECS-v001.docx
