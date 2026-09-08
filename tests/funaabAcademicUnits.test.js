import test from 'node:test';
import assert from 'node:assert/strict';
import { getProgramDurationYears, buildAcademicLevelOptions } from '../src/utils/funaabAcademicUnits.js';

test('major departments default to a four-year programme duration', () => {
  assert.equal(getProgramDurationYears('Computer Science'), 4);
  assert.equal(getProgramDurationYears('Physics'), 4);
  assert.equal(getProgramDurationYears('Electrical and Electronics Engineering'), 4);
});

test('agricultural and non-major programmes default to a five-year duration', () => {
  assert.equal(getProgramDurationYears('Agricultural Administration'), 5);
  assert.equal(getProgramDurationYears('Animal Production and Health'), 5);
  assert.equal(getProgramDurationYears('Crop Protection'), 5);
});

test('veterinary medicine stays at a six-year duration', () => {
  assert.equal(getProgramDurationYears('Veterinary Medicine'), 6);
  assert.deepEqual(buildAcademicLevelOptions('Veterinary Medicine'), ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', '600 Level']);
});
