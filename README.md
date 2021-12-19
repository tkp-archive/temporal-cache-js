# temporal-cache-js

Time-based cache invalidation

[![Build Status](https://github.com/timkpaine/temporal-cache-js/workflows/Build%20Status/badge.svg?branch=main)](https://github.com/timkpaine/temporal-cache/actions?query=workflow%3A%22Build+Status%22)
[![License](https://img.shields.io/github/license/timkpaine/temporal-cache-js.svg)](https://www.npmjs.com/package/temporal-cache)
[![npm](https://img.shields.io/npm/v/temporal-cache.svg)](https://www.npmjs.com/package/temporal-cache)



## Install

From npm

`npm install --save temporal-cache`

## Why?

I needed something that would automagically refresh at 4:00pm when markets close.


## Interval Cache

The interval cache expires every `time` interval since its first use


## Expire Cache

The expire cache expires on the time given, in scheduler/cron style.

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This software is licensed under the Apache 2.0 license. See the
[LICENSE](LICENSE) and [AUTHORS](AUTHORS) files for details.
