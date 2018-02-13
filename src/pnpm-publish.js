#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require("commander");
const fileName = `${process.cwd()}/package.json`;
const packageJson = require(fileName);
const semver = require("semver");
const publishDefault = require("./config/publish-default");
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function run() {
  const currentVersion = packageJson.version;
  const dependencies = packageJson.dependencies;
  const devDependencies = packageJson.devDependencies;
  const peerDependencies = packageJson.peerDependencies;

  function updateJson(version, devAsPeer, rewind = false) {
    if (rewind && devAsPeer) {
      packageJson.dependencies = dependencies;
      packageJson.devDependencies = devDependencies;
      packageJson.peerDependencies = peerDependencies;
    } else if (devAsPeer) {
      packageJson.peerDependencies = packageJson.peerDependencies || [];
      packageJson.peerDependencies.push(...packageJson.dependencies);
      packageJson.dependencies = undefined;
      packageJson.devDependencies = undefined;
    }
    packageJson.version = version;
    fs.writeFileSync(fileName, JSON.stringify(packageJson, null, 2));
  }

  program
    .option("-r, --release", "release type semver version")
    .option("-d2p, --deptopeer", "dependencies to peer")
    .option("-l, --loose", "Interpret versions and ranges loosely")
    .option(
      "-pre",
      "Identifier to be used to prefix premajor, preminor, prepatch or prerelease version increments"
    )
    .parse(process.argv);

  var args = program.args;

  const settings = {
    release: args.release || publishDefault.release,
    loose: args.loose || publishDefault.loose,
    prefix: args.prefix || publishDefault.prefix,
    d2p: args.deptopeer || publishDefault.d2p
  };

  const newVersion = semver.inc(
    currentVersion,
    settings.release,
    settings.loose,
    settings.prefix
  )
  updateJson(
    newVersion,
    args.deptopeer
  );

  const { stdout, stderr } = await exec("npm publish");

  if (stderr) {
    updateJson(currentVersion, args.deptopeer, true);
    throw stderr;
  } else {
    console.log(stdout);
  }
}

run();
