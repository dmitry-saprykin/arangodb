/* global describe, it */
'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const statuses = require('statuses');
const path = require('path');
const fs = require('fs');
const internal = require('internal');
const crypto = require('@arangodb/crypto');
const SyntheticResponse = require('@arangodb/foxx/router/response');

describe('SyntheticResponse', function () {
  describe('headers', function () {
    it('exposes the headers of the native response', function () {
      require("console").log('exposes the headers of the native response');
      const rawRes = {headers: {hello: 'world'}};
      const res = new SyntheticResponse(rawRes, {});
      expect(res.headers).to.equal(rawRes.headers);
    });
  });
  describe('statusCode', function () {
    it('exposes the responseCode of the native response', function () {
      require("console").log('exposes the responseCode of the native response');
      const rawRes = {responseCode: 999};
      const res = new SyntheticResponse(rawRes, {});
      expect(res.statusCode).to.equal(rawRes.responseCode);
    });
    it('allows setting the responseCode of the native response', function () {
      require("console").log('allows setting the responseCode of the native response');
      const rawRes = {responseCode: 999};
      const res = new SyntheticResponse(rawRes, {});
      res.statusCode = 666;
      expect(res.statusCode).to.equal(rawRes.responseCode).and.to.equal(666);
    });
  });
  describe('body', function () {
    it('exposes the body of the native response', function () {
      require("console").log('exposes the body of the native response');
      const rawRes = {body: 'banana'};
      const res = new SyntheticResponse(rawRes, {});
      expect(res.body).to.equal(rawRes.body);
    });
    it('allows setting the native response body to a string', function () {
      require("console").log('allows setting the native response body to a string');
      const rawRes = {body: 'banana'};
      const res = new SyntheticResponse(rawRes, {});
      res.body = 'potato';
      expect(rawRes.body).to.equal('potato');
    });
    it('allows setting the native response body to a buffer', function () {
      require("console").log('allows setting the native response body to a buffer');
      const rawRes = {body: 'banana'};
      const res = new SyntheticResponse(rawRes, {});
      res.body = new Buffer('potato');
      expect(rawRes.body).to.eql(new Buffer('potato'));
    });
    it('allows removing the native response body with null', function () {
      require("console").log('allows removing the native response body with null');
      const rawRes = {body: 'banana'};
      const res = new SyntheticResponse(rawRes, {});
      res.body = null;
      expect(rawRes).not.to.have.a.property('body');
    });
    it('allows removing the native response body with undefined', function () {
      require("console").log('allows removing the native response body with undefined');
      const rawRes = {body: 'banana'};
      const res = new SyntheticResponse(rawRes, {});
      res.body = undefined;
      expect(rawRes).not.to.have.a.property('body');
    });
    it('converts objects to JSON', function () {
      require("console").log('converts objects to JSON');
      const value = {hello: 'world'};
      const rawRes = {body: 'banana'};
      const res = new SyntheticResponse(rawRes, {});
      res.body = value;
      expect(rawRes.body).to.equal(JSON.stringify(value));
    });
    it('converts arrays to JSON', function () {
      require("console").log('converts arrays to JSON');
      const value = [1, 2, 3];
      const rawRes = {body: 'banana'};
      const res = new SyntheticResponse(rawRes, {});
      res.body = value;
      expect(rawRes.body).to.equal(JSON.stringify(value));
    });
    [0, 23, -1, false, true].forEach(function (value) {
      it(`converts ${value} to a string`, function () {
        require("console").log(`converts ${value} to a string`);
        const rawRes = {body: 'banana'};
        const res = new SyntheticResponse(rawRes, {});
        res.body = value;
        expect(rawRes.body).to.equal(String(value));
      });
    });
  });
  describe('getHeader', function () {
    it('returns the header by name', function () {
      require("console").log('returns the header by name');
      const rawRes = {headers: {hello: 'world'}};
      const res = new SyntheticResponse(rawRes, {});
      expect(res.getHeader('hello')).to.equal('world');
    });
    it('converts the name to lowercase', function () {
      require("console").log('converts the name to lowercase');
      const rawRes = {headers: {hello: 'world'}};
      const res = new SyntheticResponse(rawRes, {});
      expect(res.getHeader('Hello')).to.equal(res.getHeader('hello'));
    });
    it('intercepts content-type headers', function () {
      require("console").log('intercepts content-type headers');
      const rawRes = {contentType: 'application/x-meow'};
      const res = new SyntheticResponse(rawRes, {});
      expect(res.getHeader('content-type')).to.equal(rawRes.contentType);
    });
    it('intercepts content-type headers in any case', function () {
      require("console").log('intercepts content-type headers in any case');
      const rawRes = {contentType: 'application/x-meow'};
      const res = new SyntheticResponse(rawRes, {});
      expect(res.getHeader('Content-Type')).to.equal(rawRes.contentType);
    });
  });
  describe('removeHeader', function () {
    it('removes the header by name', function () {
      require("console").log('removes the header by name');
      const rawRes = {headers: {hello: 'world'}};
      const res = new SyntheticResponse(rawRes, {});
      res.removeHeader('hello');
      expect(rawRes.headers).not.to.have.a.property('hello');
    });
    it('converts the name to lowercase', function () {
      require("console").log('converts the name to lowercase');
      const rawRes = {headers: {hello: 'world'}};
      const res = new SyntheticResponse(rawRes, {});
      res.removeHeader('Hello');
      expect(rawRes.headers).not.to.have.a.property('hello');
    });
    it('intercepts content-type headers', function () {
      require("console").log('intercepts content-type headers');
      const rawRes = {contentType: 'application/x-meow'};
      const res = new SyntheticResponse(rawRes, {});
      res.removeHeader('content-type');
      expect(rawRes).not.to.have.a.property('contentType');
    });
    it('intercepts content-type headers in any case', function () {
      require("console").log('intercepts content-type headers in any case');
      const rawRes = {contentType: 'application/x-meow'};
      const res = new SyntheticResponse(rawRes, {});
      res.removeHeader('Content-Type');
      expect(rawRes).not.to.have.a.property('contentType');
    });
  });
  describe('setHeader', function () {
    it('updates the header by name', function () {
      require("console").log('updates the header by name');
      const rawRes = {headers: {hello: 'world'}};
      const res = new SyntheticResponse(rawRes, {});
      res.setHeader('hello', 'pancakes');
      expect(rawRes.headers.hello).to.equal('pancakes');
    });
    it('converts the name to lowercase', function () {
      require("console").log('converts the name to lowercase');
      const rawRes = {headers: {hello: 'world'}};
      const res = new SyntheticResponse(rawRes, {});
      res.setHeader('Hello', 'pancakes');
      expect(rawRes.headers.hello).to.equal('pancakes');
    });
    it('intercepts content-type headers', function () {
      require("console").log('intercepts content-type headers');
      const rawRes = {contentType: 'application/x-meow'};
      const res = new SyntheticResponse(rawRes, {});
      res.setHeader('content-type', 'application/x-woof');
      expect(rawRes.contentType).to.equal('application/x-woof');
    });
    it('intercepts content-type headers in any case', function () {
      require("console").log('intercepts content-type headers in any case');
      const rawRes = {contentType: 'application/x-meow'};
      const res = new SyntheticResponse(rawRes, {});
      res.setHeader('Content-Type', 'application/x-woof');
      expect(rawRes.contentType).to.equal('application/x-woof');
    });
    it('has no effect when called without a name', function () {
      require("console").log('has no effect when called without a name');
      const rawRes = {headers: {}, contentType: 'application/x-wat'};
      const res = new SyntheticResponse(rawRes, {});
      Object.freeze(rawRes.headers);
      Object.freeze(rawRes);
      expect(function () {
        res.setHeader();
      }).not.to.throw();
    });
  });
  describe('write', function () {
    describe('when the native response has no body', function () {
      it('allows setting the native response body to a string', function () {
        require("console").log('allows setting the native response body to a string');
        const rawRes = {};
        const res = new SyntheticResponse(rawRes, {});
        res.write('potato');
        expect(rawRes.body).to.equal('potato');
      });
      it('allows setting the native response body to a buffer', function () {
        require("console").log('allows setting the native response body to a buffer');
        const rawRes = {};
        const res = new SyntheticResponse(rawRes, {});
        res.write(new Buffer('potato'));
        expect(rawRes.body).to.eql(new Buffer('potato'));
      });
      it('ignores null values', function () {
        require("console").log('ignores null values');
        const rawRes = {};
        const res = new SyntheticResponse(rawRes, {});
        res.write(null);
        expect(rawRes).not.to.have.a.property('body');
      });
      it('ignores undefined values', function () {
        require("console").log('ignores undefined values');
        const rawRes = {};
        const res = new SyntheticResponse(rawRes, {});
        res.write(undefined);
        expect(rawRes).not.to.have.a.property('body');
      });
      it('converts objects to JSON', function () {
        require("console").log('converts objects to JSON');
        const value = {hello: 'world'};
        const rawRes = {};
        const res = new SyntheticResponse(rawRes, {});
        res.write(value);
        expect(rawRes.body).to.equal(JSON.stringify(value));
      });
      it('converts arrays to JSON', function () {
        require("console").log('converts arrays to JSON');
        const value = [1, 2, 3];
        const rawRes = {};
        const res = new SyntheticResponse(rawRes, {});
        res.write(value);
        expect(rawRes.body).to.equal(JSON.stringify(value));
      });
      [0, 23, -1, false, true].forEach(function (value) {
        it(`converts ${value} to a string`, function () {
          require("console").log(`converts ${value} to a string`);
          const rawRes = {};
          const res = new SyntheticResponse(rawRes, {});
          res.write(value);
          expect(rawRes.body).to.equal(String(value));
        });
      });
    });
    describe('when the native response has a string body', function () {
      const body = 'banana';
      it('allows adding a string to the native response body', function () {
        require("console").log('allows adding a string to the native response body');
        const rawRes = {body: body};
        const res = new SyntheticResponse(rawRes, {});
        res.write('potato');
        expect(rawRes.body).to.equal(body + 'potato');
      });
      it('allows adding a buffer to the native response body', function () {
        require("console").log('allows adding a buffer to the native response body');
        const rawRes = {body: body};
        const res = new SyntheticResponse(rawRes, {});
        res.write(new Buffer('potato'));
        expect(rawRes.body).to.eql(new Buffer(body + 'potato'));
      });
      it('ignores null values', function () {
        require("console").log('ignores null values');
        const rawRes = {body: body};
        const res = new SyntheticResponse(rawRes, {});
        res.write(null);
        expect(rawRes.body).to.equal(body);
      });
      it('ignores undefined values', function () {
        require("console").log('ignores undefined values');
        const rawRes = {body: body};
        const res = new SyntheticResponse(rawRes, {});
        res.write(undefined);
        expect(rawRes.body).to.equal(body);
      });
      it('converts objects to JSON', function () {
        require("console").log('converts objects to JSON');
        const value = {hello: 'world'};
        const rawRes = {body: body};
        const res = new SyntheticResponse(rawRes, {});
        res.write(value);
        expect(rawRes.body).to.equal(body + JSON.stringify(value));
      });
      it('converts arrays to JSON', function () {
        require("console").log('converts arrays to JSON');
        const value = [1, 2, 3];
        const rawRes = {body: body};
        const res = new SyntheticResponse(rawRes, {});
        res.write(value);
        expect(rawRes.body).to.equal(body + JSON.stringify(value));
      });
      [0, 23, -1, false, true].forEach(function (value) {
        it(`converts ${value} to a string`, function () {
          require("console").log(`converts ${value} to a string`);
          const rawRes = {body: body};
          const res = new SyntheticResponse(rawRes, {});
          res.write(value);
          expect(rawRes.body).to.equal(body + String(value));
        });
      });
    });
    describe('when the native response has a buffer body', function () {
      const body = 'banana';
      it('allows adding a string to the native response body', function () {
        require("console").log('allows adding a string to the native response body');
        const rawRes = {body: new Buffer(body)};
        const res = new SyntheticResponse(rawRes, {});
        res.write('potato');
        expect(rawRes.body).to.eql(new Buffer(body + 'potato'));
      });
      it('allows adding a buffer to the native response body', function () {
        require("console").log('allows adding a buffer to the native response body');
        const rawRes = {body: new Buffer(body)};
        const res = new SyntheticResponse(rawRes, {});
        res.write(new Buffer('potato'));
        expect(rawRes.body).to.eql(new Buffer(body + 'potato'));
      });
      it('ignores null values', function () {
        require("console").log('ignores null values');
        const buf = new Buffer(body);
        const rawRes = {body: buf};
        const res = new SyntheticResponse(rawRes, {});
        res.write(null);
        expect(rawRes.body).to.equal(buf);
      });
      it('ignores undefined values', function () {
        require("console").log('ignores undefined values');
        const buf = new Buffer(body);
        const rawRes = {body: buf};
        const res = new SyntheticResponse(rawRes, {});
        res.write(undefined);
        expect(rawRes.body).to.equal(buf);
      });
      it('converts objects to JSON', function () {
        require("console").log('converts objects to JSON');
        const value = {hello: 'world'};
        const rawRes = {body: new Buffer(body)};
        const res = new SyntheticResponse(rawRes, {});
        res.write(value);
        expect(rawRes.body).to.eql(new Buffer(body + JSON.stringify(value)));
      });
      it('converts arrays to JSON', function () {
        require("console").log('converts arrays to JSON');
        const value = [1, 2, 3];
        const rawRes = {body: new Buffer(body)};
        const res = new SyntheticResponse(rawRes, {});
        res.write(value);
        expect(rawRes.body).to.eql(new Buffer(body + JSON.stringify(value)));
      });
      [0, 23, -1, false, true].forEach(function (value) {
        it(`converts ${value} to a string`, function () {
          require("console").log(`converts ${value} to a string`);
          const rawRes = {body: new Buffer(body)};
          const res = new SyntheticResponse(rawRes, {});
          res.write(value);
          expect(rawRes.body).to.eql(new Buffer(body + String(value)));
        });
      });
    });
  });
  describe('attachment', function () {
    it('adds a content-disposition header', function () {
      require("console").log('adds a content-disposition header');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.attachment('lol.js');
      expect(rawRes.headers).to.have.a.property(
        'content-disposition',
        'attachment; filename="lol.js"'
      );
    });
    it('only exposes the basename', function () {
      require("console").log('only exposes the basename');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.attachment('/hello/world/lol.js');
      expect(rawRes.headers).to.have.a.property(
        'content-disposition',
        'attachment; filename="lol.js"'
      );
    });
    it('escapes quotation marks in the filename', function () {
      require("console").log('escapes quotation marks in the filename');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.attachment('"lol".js');
      expect(rawRes.headers).to.have.a.property(
        'content-disposition',
        'attachment; filename="\\"lol\\".js"'
      );
    });
    it('escapes special characters', function () {
      require("console").log('escapes special characters');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.attachment('l\rl.js');
      expect(rawRes.headers).to.have.a.property(
        'content-disposition',
        'attachment; filename="l?l.js"; filename*=UTF-8\'\'l%0Dl.js'
      );
    });
    [
      ['js', 'application/javascript'],
      ['json', 'application/json'],
      ['txt', 'text/plain'],
      ['unknown mime type', 'application/octet-stream']
    ].forEach(function (t) {
      it(`sets the content-type header to ${t[1]} for ${t[0]} files`, function () {
        require("console").log(`sets the content-type header to ${t[1]} for ${t[0]} files`);
        const rawRes = {};
        const res = new SyntheticResponse(rawRes, {});
        res.attachment(`lol.${t[0]}`);
        expect(rawRes.contentType).to.equal(t[1]);
      });
    });
    it('does not override existing content-type', function () {
      require("console").log('does not override existing content-type');
      const rawRes = {contentType: 'application/json'};
      const res = new SyntheticResponse(rawRes, {});
      res.attachment('hello.txt');
      expect(rawRes.contentType).to.equal('application/json');
    });
    it('overrides existing content-disposition headers', function () {
      require("console").log('overrides existing content-disposition headers');
      const rawRes = {headers: {'content-disposition': 'lolcat'}};
      const res = new SyntheticResponse(rawRes, {});
      res.attachment('hello.txt');
      expect(rawRes.headers).to.have.a.property(
        'content-disposition',
        'attachment; filename="hello.txt"'
      );
    });
  });
  describe('download', function () {
    it('passes the arguments to attachment and sendFile', function () {
      require("console").log('passes the arguments to attachment and sendFile');
      const path = '/hello/world.js';
      const filename = 'lol.js';
      const res = new SyntheticResponse({}, {});
      res.attachment = sinon.spy();
      res.sendFile = sinon.spy();
      res.download(path, filename);
      expect(res.attachment.calledOnce).to.equal(true);
      expect(res.attachment.args[0]).to.eql([filename]);
      expect(res.sendFile.calledOnce).to.equal(true);
      expect(res.sendFile.args[0]).to.eql([path]);
    });
    it('falls back to path if filename is omitted', function () {
      require("console").log('falls back to path if filename is omitted');
      const path = '/hello/world.js';
      const res = new SyntheticResponse({}, {});
      res.attachment = sinon.spy();
      res.sendFile = sinon.spy();
      res.download(path);
      expect(res.attachment.calledOnce).to.equal(true);
      expect(res.attachment.args[0]).to.eql([path]);
      expect(res.sendFile.calledOnce).to.equal(true);
      expect(res.sendFile.args[0]).to.eql([path]);
    });
  });
  describe('json', function () {
    [{hello: 'world'}, [1, 2, 3], 'a string', 23, null, false, true, -1].forEach(function (value) {
      it(`converts ${value} to JSON`, function () {
        require("console").log(`converts ${value} to JSON`);
        const rawRes = {};
        const res = new SyntheticResponse(rawRes, {});
        res.json(value);
        expect(rawRes.body).to.equal(JSON.stringify(value));
      });
    });
    it('sets the content-type to JSON', function () {
      require("console").log('sets the content-type to JSON');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.json({some: 'json'});
      expect(rawRes.contentType).to.equal('application/json; charset=utf-8');
    });
    it('does not override the existing content-type', function () {
      require("console").log('does not override the existing content-type');
      const rawRes = {contentType: 'application/x-lolcat'};
      const res = new SyntheticResponse(rawRes, {});
      res.json({some: 'json'});
      expect(rawRes.contentType).to.equal('application/x-lolcat');
    });
  });
  describe('redirect', function () {
    it('sets the responseCode of the native request', function () {
      require("console").log('sets the responseCode of the native request');
      const rawRes = {responseCode: 999};
      const res = new SyntheticResponse(rawRes, {});
      res.redirect(303, '/lol/cat');
      expect(rawRes.responseCode).to.equal(303);
    });
    it('sets the location header of the native request', function () {
      require("console").log('sets the location header of the native request');
      const rawRes = {responseCode: 999};
      const res = new SyntheticResponse(rawRes, {});
      res.redirect(303, '/lol/cat');
      expect(rawRes.headers).to.have.a.property('location', '/lol/cat');
    });
    it('defaults to code 302 if no code is provided', function () {
      require("console").log('defaults to code 302 if no code is provided');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.redirect('/lol/cat');
      expect(rawRes.responseCode).to.equal(302);
    });
    it('sets responseCode to 301 if code is "permanent"', function () {
      require("console").log('sets responseCode to 301 if code is "permanent"');
      const rawRes = {responseCode: 999};
      const res = new SyntheticResponse(rawRes, {});
      res.redirect('permanent', '/lol/cat');
      expect(rawRes.responseCode).to.equal(301);
    });
    it('does not override responseCode if no code is provided', function () {
      require("console").log('does not override responseCode if no code is provided');
      const rawRes = {responseCode: 999};
      const res = new SyntheticResponse(rawRes, {});
      res.redirect('/lol/cat');
      expect(rawRes.responseCode).to.equal(999);
    });
  });
  describe('sendFile', function () {
    const filename = fs.normalize(fs.makeAbsolute(path.join(
      internal.startupPath,
      'common',
      'test-data',
      'foxx',
      'toomanysecrets.txt'
    )));
    const body = fs.readBuffer(filename);
    const lastModified = new Date(fs.mtime(filename) * 1000).toUTCString();
    it('sets the native request body to the file contents', function () {
      require("console").log('sets the native request body to the file contents');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.sendFile(filename);
      expect(rawRes.body).to.eql(body);
    });
    it('sets the last-modified header by default', function () {
      require("console").log('sets the last-modified header by default');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.sendFile(filename);
      expect(rawRes.headers).to.have.a.property('last-modified', lastModified);
    });
    it('does not override existing last-modified header', function () {
      require("console").log('does not override existing last-modified header');
      const rawRes = {headers: {'last-modified': 'not today'}};
      const res = new SyntheticResponse(rawRes, {});
      res.sendFile(filename);
      expect(rawRes.headers).to.have.a.property('last-modified', 'not today');
    });
    it('overrides last-modified header if lastModified is true', function () {
      require("console").log('overrides last-modified header if lastModified is true');
      const rawRes = {headers: {'last-modified': 'not today'}};
      const res = new SyntheticResponse(rawRes, {});
      res.sendFile(filename, {lastModified: true});
      expect(rawRes.headers).to.have.a.property('last-modified', lastModified);
    });
    it('does not set the last-modified header if lastModified is false', function () {
      require("console").log('does not set the last-modified header if lastModified is false');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.sendFile(filename, {lastModified: false});
      expect(rawRes).not.to.have.a.property('headers');
    });
    it('treats options boolean as lastModified', function () {
      require("console").log('treats options boolean as lastModified');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.sendFile(filename, false);
      expect(rawRes).not.to.have.a.property('headers');
    });
  });
  describe('sendStatus', function () {
    it('sets the responseCode of the native request', function () {
      require("console").log('sets the responseCode of the native request');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.sendStatus(400);
      expect(rawRes.responseCode).to.equal(400);
    });
    it('sets the response body to the matching message', function () {
      require("console").log('sets the response body to the matching message');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.sendStatus(400);
      expect(rawRes.body).to.equal(statuses[400]);
    });
    it('sets the response body to the status code if no message exists', function () {
      require("console").log('sets the response body to the status code if no message exists');
      expect(statuses).not.to.have.a.property('999');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.sendStatus(999);
      expect(rawRes.body).to.equal('999');
    });
  });
  describe('set', function () {
    it('updates the header by name', function () {
      require("console").log('updates the header by name');
      const rawRes = {headers: {hello: 'world'}};
      const res = new SyntheticResponse(rawRes, {});
      res.set('hello', 'pancakes');
      expect(rawRes.headers.hello).to.equal('pancakes');
    });
    it('converts the name to lowercase', function () {
      require("console").log('converts the name to lowercase');
      const rawRes = {headers: {hello: 'world'}};
      const res = new SyntheticResponse(rawRes, {});
      res.set('Hello', 'pancakes');
      expect(rawRes.headers.hello).to.equal('pancakes');
    });
    it('intercepts content-type headers', function () {
      require("console").log('intercepts content-type headers');
      const rawRes = {contentType: 'application/x-meow'};
      const res = new SyntheticResponse(rawRes, {});
      res.set('content-type', 'application/x-woof');
      expect(rawRes.contentType).to.equal('application/x-woof');
    });
    it('intercepts content-type headers in any case', function () {
      require("console").log('intercepts content-type headers in any case');
      const rawRes = {contentType: 'application/x-meow'};
      const res = new SyntheticResponse(rawRes, {});
      res.set('Content-Type', 'application/x-woof');
      expect(rawRes.contentType).to.equal('application/x-woof');
    });
    it('has no effect when called without a name', function () {
      require("console").log('has no effect when called without a name');
      const rawRes = {headers: {}, contentType: 'application/x-wat'};
      const res = new SyntheticResponse(rawRes, {});
      Object.freeze(rawRes.headers);
      Object.freeze(rawRes);
      expect(function () {
        res.set();
      }).not.to.throw();
    });
    it('accepts a headers object', function () {
      require("console").log('accepts a headers object');
      const rawRes = {headers: {a: '1'}};
      const res = new SyntheticResponse(rawRes, {});
      res.set({b: '2', c: '3'});
      expect(rawRes.headers).to.eql({a: '1', b: '2', c: '3'});
    });
  });
  describe('status', function () {
    it('allows setting the responseCode of the native response', function () {
      require("console").log('allows setting the responseCode of the native response');
      const rawRes = {responseCode: 999};
      const res = new SyntheticResponse(rawRes, {});
      res.status(666);
      expect(rawRes.responseCode).to.equal(666);
    });
  });
  describe('vary', function () {
    it('manipulates the vary header', function () {
      require("console").log('manipulates the vary header');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.vary('Origin');
      expect(res.headers).to.have.a.property('vary', 'Origin');
      res.vary('User-Agent');
      expect(res.headers).to.have.a.property('vary', 'Origin, User-Agent');
    });
    it('ignores duplicates', function () {
      require("console").log('ignores duplicates');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.vary('x, y');
      expect(res.headers).to.have.a.property('vary', 'x, y');
      res.vary('x, z');
      expect(res.headers).to.have.a.property('vary', 'x, y, z');
    });
    it('understands arrays', function () {
      require("console").log();
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.vary('x');
      expect(res.headers).to.have.a.property('vary', 'x');
      res.vary(['y', 'z']);
      expect(res.headers).to.have.a.property('vary', 'x, y, z');
    });
    it('understands wildcards', function () {
      require("console").log('understands wildcards');
      const rawRes = {};
      const res = new SyntheticResponse(rawRes, {});
      res.vary('*');
      expect(res.headers).to.have.a.property('vary', '*');
      res.vary('User-Agent');
      expect(res.headers).to.have.a.property('vary', '*');
    });
  });
});
