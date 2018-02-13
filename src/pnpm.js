#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const fileName = `${process.cwd()}/package.json`;
const {version} = require(fileName);
program
  .version(version)
  .description('Fake package manager')
  .command('publish', 'publish package').alias('u')
  .parse(process.argv);
