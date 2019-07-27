# Serverless Microsevices

[![npm](https://img.shields.io/npm/v/serverless-plugin-microsevices.svg)](https://www.npmjs.com/package/serverless-plugin-microsevices)

A [serverless](https://serverless.com) plugin to handle [Microservices](https://en.wikipedia.org/wiki/Microservices) architectural style that structures application in different Serverless projects.

## Usage

### Installation

```bash
$ npm install serverless-plugin-microsevices --save-dev
```
or using yarn
```bash
$ yarn add serverless-plugin-microsevices
```

### Configuration

```yaml
plugins:
  - serverless-plugin-microsevices

custom:
  service:
    path: services/*/serverless.yml # glob pattern are supported
    strategy: parallel # deploy strategy, parallel or sequential, default: sequential
    only: # filter discovered services by service name  
      - auth
      - cart
      - products
```

`path`: glob pattern that point to sevice's `serverless.yml` file.

`strategy`: this is the default configuration of deploy strategy. Can be overrided by `--strategy` parameter. This can be used to deploy service with cross-service dependencies that require a sequential deploy in some cases.

`only`: during seviceses load it's `serverless.yml` are readed and `service` key (use by Serverless to identify your app name) is used as filter target.

## Repository structures

You can use both *Mono-Repo* or *Multi-Repo* approach, you can find more info about these pattern [here](https://serverless-stack.com/chapters/organizing-serverless-projects.html).

### Mono-Repo

An example of Mono-Repo organization is placing all services into separate directory under a main *services* directory. 

Your repository structure should be similar to:
```
myapp
├── serverless.yml
└── services
    ├── auth
    │   ├── handler.js
    │   └── severless.yml
    ├── cart
    │   ├── handler.js
    │   └── severless.yml
    └── products
        ├── handler.js
        └── severless.yml
```
where the root `serverless.yml` file contains `serverless-plugin-microsevices` configurations and some globals resources. Every service directory contain a Serverless framework's project that will deployed separatly in the same method you deploy a single project.

With this repository organization you can use a configuration similar to:
```yaml
plugins:
  - serverless-plugin-microsevices

custom:
  service:
    path: services/*/serverless.yml # where "services" is the directory that contain services
    strategy: parallel
```

Deploy all sevices using:
```bash
serverless microservices init
serverless microservices deploy --stage dev --region us-west-1
```

Benefits:
- A complete view of all the services in the same repository 
- Faster changes to services
- Easiest way to share code between services

### Multi-Repo

An Multi-Repo approach use *npm* or *yarn* (or even *git submodules* or *composer*) package manager to organize your services and download a specific version.

If you are using npm as package manager your repository structure should be similar to:
```
myapp
├── node_modules
│   ├── auth
│   │   ├── handler.js
│   │   └── severless.yml
│   ├── cart
│   │   ├── handler.js
│   │   └── severless.yml
│   └── products
│       ├── handler.js
│       └── severless.yml
├── package.json
└── serverless.yml
```
where every npm modules is a seprate Serverless projects service, root `serverless.yml` file contains `serverless-plugin-microsevices`

Your `package.json` can include service from Github:
```json
"dependencies": {
  "auth": "git://github.com/foo/bar-auth.git",
  "cart": "git://github.com/foo/bar-cart.git",
  "products": "git://github.com/foo/bar-products.git"
}
```
from private repository:
```json
"dependencies": {
  "auth": "git+ssh://gitlab.com/foo/bar-auth.git",
  "cart": "git+ssh://gitlab.com/foo/bar-cart.git",
  "products": "git+ssh://gitlab.com/foo/bar-products.git"
}
```
using a specific version or commit id:
```json
"dependencies": {
  "auth": "git+ssh://gitlab.com/foo/bar-auth.git#v1.0.2",
  "cart": "git+ssh://gitlab.com/foo/bar-cart.git#semver:^2.0",
  "products": "git+ssh://gitlab.com/foo/bar-products.git#521747298a3790fde1710f3aa2d03b55020575aa"
}
```

With this repository organization you can use a configuration similar to:
```yaml
plugins:
  - serverless-plugin-microsevices

custom:
  service:
    path: node_modules/*/serverless.yml # where "node_modules" is the directory that contain npm package
    strategy: parallel
    only: # protection from other potential serverless.yml inside other npm package
      - auth
      - cart
      - products
```
_Note: pay attention that if you use serverless as a npm package it contain templates with a lot of severless.yml files, you must set the 'only' settings inside your root severless.yml file_

Benefits:
- A complete isolation of services dependencies
- Services can reused for an other application
- Seprate version versioning for each sevice

## Commands

### Initialize services

Initialize services using:
```bash
serverless microservices init
```
this will execute `npm install` on every services directories.

### Deploy services

Deploy services using:
```bash
serverless microservices deploy --stage dev --region us-west-1
```
this will execute `severless deploy` on every services directories with stage and region parameter.

### Remove services

Remove services using:
```bash
serverless microservices remove --stage dev --region us-west-1
```
this will execute `severless remove` on every services directories with stage and region parameter.

## TODO

- [ ] Verbose mode with command output
- [ ] Handle cross-service dependencies with multiple deploy steps
