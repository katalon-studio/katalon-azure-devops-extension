import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Sample task tests', function () {

    before( function() {
        console.log("Call before");
    });

    after(() => {
        console.log("call after");
    });

    it('should succeed with simple inputs', function(done: MochaDone) {
        // Add success test here
        console.log("should succeed");
    });

    it('it should fail if tool returns 1', function(done: MochaDone) {
        // Add failure test here
        console.log("should fail");
    });    
});

it('should succeed with simple inputs', function(done: MochaDone) {

    console.log("Call it should succeed");

    this.timeout(1000);

    let tp = path.join(__dirname, 'success.js');
    let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    tr.run();
    console.log(tr.succeeded);
    assert.equal(tr.succeeded, true, 'should have succeeded');
    assert.equal(tr.warningIssues.length, 0, "should have no warnings");
    assert.equal(tr.errorIssues.length, 0, "should have no errors");
    console.log(tr.stdout);
    assert.equal(tr.stdout.indexOf('Hello human') >= 0, true, "should display Hello human");
    done();
});

it('it should fail if tool returns 1', function(done: MochaDone) {
    this.timeout(1000);

    console.log("Call it should fail");

    let tp = path.join(__dirname, 'failure.js');
    let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    tr.run();
    console.log(tr.succeeded);
    assert.equal(tr.succeeded, false, 'should have failed');
    assert.equal(tr.warningIssues, 0, "should have no warnings");
    assert.equal(tr.errorIssues.length, 1, "should have 1 error issue");
    assert.equal(tr.errorIssues[0], 'Bad input was given', 'error issue output');
    assert.equal(tr.stdout.indexOf('Hello bad'), -1, "Should not display Hello bad");

    done();
});