import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

function loadSource(path) {
  const source = fs.readFileSync(path, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const sourceModule = { exports: {} };
  new Function('module', 'exports', 'require', compiled.outputText)(sourceModule, sourceModule.exports, require);
  return sourceModule.exports;
}

const relationship = loadSource('src/lib/relationship.ts');
const tracks = loadSource('src/lib/trackLink.ts');

test('invalid dates and future dates return a zero duration', () => {
  for (const date of ['2026-02-31', '2026-13-01', '2027-01-01', 'bad']) {
    assert.deepEqual(relationship.calcDiff(date, new Date(2026, 9, 18)), {
      days: 0, hours: 0, minutes: 0, seconds: 0, years: 0, months: 0, day: 0,
    });
  }
});

test('month-end anniversaries never produce negative calendar days', () => {
  const february = relationship.calcDiff('2026-01-31', new Date(2026, 1, 28));
  assert.deepEqual([february.years, february.months, february.day], [0, 1, 0]);
  const march = relationship.calcDiff('2026-01-31', new Date(2026, 2, 1));
  assert.deepEqual([march.years, march.months, march.day], [0, 1, 1]);
  const leap = relationship.calcDiff('2024-02-29', new Date(2025, 1, 28));
  assert.deepEqual([leap.years, leap.months, leap.day], [1, 0, 0]);
});

test('failed persistence preserves the last saved snapshot and emits no update', () => {
  const values = new Map();
  let fail = false;
  let updates = 0;
  global.window = { dispatchEvent: () => updates++ };
  global.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (fail) throw new Error('QuotaExceededError');
      values.set(key, value);
    },
    removeItem: (key) => values.delete(key),
  };
  const store = loadSource('src/lib/relationship.ts');
  store.saveSettings({ ...store.getDefaultSettings(), name1: 'Saved' });
  const snapshot = store.loadSettings();
  fail = true;
  assert.throws(() => store.saveSettings({ ...snapshot, name1: 'Unsaved' }));
  assert.equal(store.loadSettings(), snapshot);
  assert.equal(updates, 1);
  assert.equal(store.updateSettings((current) => current), snapshot);
  delete global.window;
  delete global.localStorage;
});

test('track links handle broken encoding and reject non-web protocols', () => {
  assert.ok(tracks.inferTrackFromUrl('https://soundcloud.com/artist/%E0%A4%A'));
  assert.equal(tracks.inferTrackFromUrl('ftp://example.com/song'), null);
  assert.equal(tracks.inferTrackFromUrl('javascript://example.com/song'), null);
  assert.equal(tracks.inferTrackFromUrl('open.spotify.com/track/123456789012345').platform, 'Spotify');
});
