/* Copyright (C) 2017 Project-EBDO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * Test utility faking a ES cluster.
 * Check received query against known ones using fixtures files
 * and sends data or error back.
 *
 * EBDO-FeatureService fake-ES test endpoint
 * Author: Alexandre Degurse
 */
'use strict';


var HyperSwitch = require('hyperswitch');
var path = require('path');
var assert = require('../../utils/assert.js');

var fixtures = require('./fixtures.js');


var spec = HyperSwitch.utils.loadSpec(path.join(__dirname, 'fake-es.yaml'));

// FES service
function FES(options) {
    this.options = options;
}

FES.prototype.query = function(hyper, req) {

    var body = req.body;
    var headers = req.headers;
    var index = req.params.index;
    var method = req.params.method;


    var foundValue = fixtures.values.filter(value => {
        return  assert.isDeepEqual(JSON.parse(body), value.expectedEsQuery) *
                assert.isDeepEqual(index,value.expectedIndex) *
                assert.isDeepEqual(method,"_search") *
                assert.isDeepEqual(headers,{ "Content-Type": "application/json" })
    });

    if (foundValue.length === 1) {
        return {
            status: 200,
            body: foundValue[0].esResult
        };
    } else {
        /* console.error('fake_ES couldn\'t find an expected matching ES query:\n'
            +'Received: ' + JSON.stringify(body)); */
        return { status: 404 };
    }
};

module.exports = function(options) {
    var fes = new FES(options);

    return {
        spec: spec,
        operations: {
            query: fes.query.bind(fes)
        }
    };
};
