// Copyright (c) 2016 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

"use strict"

var assert = require("assert"),
    exec = require('child_process').exec,
    gen = require("..").generator,
    path = require("path");

var Meal = null;

describe('widl-nan Unit Test - IDL enum', function () {
  it('Generating binding C++ code', function () {
    gen.reset();
    return Promise.all([
      gen.addFile('test/enum/enum.widl')
      ]).then(function () {
        gen.compile();
        gen.writeToDir('test/enum/gen');
      }).catch(e => {
        console.log(e);
        throw e;
      });
  });

  it('Building addon', function (done) {
    var cmd = 'cd test/enum; node-gyp rebuild';
    exec(cmd, function(error, stdout, stderr) {
      // TODO: Detect errors
      done();
    })
  });

  it('Loading addon', function () {
    var addonDir = path.join(path.dirname(__filename), 'enum');
    var addon = require('bindings')(
        {'bindings': 'testerAddon', 'module_root': addonDir});
    // TODO: Detect errors
    Meal = addon.Meal;
    assert.equal(typeof Meal, 'function');
  });

  it('Setting attribute with a valid enum value', done => {
    var x = new Meal();
    x.type = 'rice';
    assert.equal(x.type, 'rice');
    done();
  });

  it('Setting attribute with an invalid enum value (no effect)', () => {
    var x = new Meal();
    x.type = 'rice';
    x.type = 'invalid-enum-value'; // No effect
    assert.equal(x.type, 'rice');
  });

  it('Calling operation with a valid enum value', () => {
    var x = new Meal();
    x.initialize('noodles', 50);
    assert.equal(x.type, 'noodles');
  });

  it('Calling operation with an invalid enum value (throw exception)', () => {
    return assert.throws(function () {
      var x = new Meal();
      x.initialize('lasagna', 50); // Throws TypeError()
    }, function (e) {
      if (e instanceof TypeError && /type/.test(e)) {
        return true;
      }
    }, "Unexpected error");
  });

  it('NOP test', done => {
    done();
  });

});