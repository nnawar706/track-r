import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getWeekStart, getWeekEnd } from '../lib/week.js';

test('getWeekStart returns the Monday for a mid-week date', () => {
  assert.equal(getWeekStart('2026-09-16'), '2026-09-14');
});

test('getWeekStart returns the same date when given a Monday', () => {
  assert.equal(getWeekStart('2026-09-14'), '2026-09-14');
});

test('getWeekStart returns the Friday-week Monday when given a Friday', () => {
  assert.equal(getWeekStart('2026-09-18'), '2026-09-14');
});

test("getWeekStart resolves a Saturday to that week's Monday", () => {
  assert.equal(getWeekStart('2026-09-19'), '2026-09-14');
});

test("getWeekStart resolves a Sunday to that week's Monday, not the following week", () => {
  assert.equal(getWeekStart('2026-09-20'), '2026-09-14');
});

test('getWeekStart handles a year boundary correctly', () => {
  assert.equal(getWeekStart('2026-01-01'), '2025-12-29');
});

test('getWeekEnd is exactly 4 days after weekStart', () => {
  const weekStart = getWeekStart('2026-09-16');
  assert.equal(getWeekEnd(weekStart), '2026-09-18');
});

test('getWeekEnd handles a year boundary correctly', () => {
  assert.equal(getWeekEnd('2025-12-29'), '2026-01-02');
});
