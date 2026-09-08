import test from 'node:test';
import assert from 'node:assert/strict';
import { isCourseLevelMatch } from '../src/utils/courseRules.js';

test('reverts the hard 3xx restriction so level 300 students can still access valid department courses', () => {
  assert.equal(isCourseLevelMatch({ code: 'CSC 301', carryover: false }, '300 Level'), true);
  assert.equal(isCourseLevelMatch({ code: 'CSC 201', carryover: false }, '300 Level'), true);
  assert.equal(isCourseLevelMatch({ code: 'MTH 101', carryover: false }, '300 Level'), true);
});

test('still keeps carryover courses visible without forcing exact-level match', () => {
  assert.equal(isCourseLevelMatch({ code: 'STA 401', carryover: true }, '300 Level'), true);
  assert.equal(isCourseLevelMatch({ code: 'ENG 200', carryover: true }, '200 Level'), true);
});
