[![npm (scoped)](https://img.shields.io/npm/v/@dexpenses/extract.svg)](https://www.npmjs.com/package/@dexpenses/extract)
[![Build Status](https://travis-ci.com/dexpenses/dexpenses-extract.svg?branch=master)](https://travis-ci.com/dexpenses/dexpenses-extract)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=dexpenses-extract&metric=alert_status)](https://sonarcloud.io/dashboard?id=dexpenses-extract)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=dexpenses-extract&metric=coverage)](https://sonarcloud.io/dashboard?id=dexpenses-extract)

# Dexpenses Extract

Extract data from OCRed receipts

## Install

`npm i @dexpenses/extract`

or

`yarn add @dexpenses/extract`

## Polyfill

Uses `Array.prototype.flatMap` which means a polyfill may be needed:

`yarn add core-js`

Then `import 'core-js/modules/es.array.flat-map';` at some point.
