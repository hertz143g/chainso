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
  new Function('module', 'exports', 'require', compiled.outputText)(sourceModule, sourceModule.exports, (specifier) => specifier.startsWith('@/') ? loadSource(`src/${specifier.slice(2)}.ts`) : require(specifier));
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

const images = loadSource('src/lib/widgetAppearance.ts');

test('uploads reject non-images and oversized files before decoding', async () => {
  await assert.rejects(images.prepareImageForStorage({ type: 'text/plain', size: 10 }));
  await assert.rejects(images.prepareImageForStorage({ type: 'image/png', size: 33 * 1024 * 1024 }));
  await assert.rejects(images.prepareImageForStorage({ type: 'image/png', size: 0 }));
});

test('broken image decoding rejects and releases the object URL', async () => {
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  const originalWindow = global.window;
  const originalDocument = global.document;
  let released;
  const canvas = { width: 1, height: 1 };
  URL.createObjectURL = () => 'blob:test-image';
  URL.revokeObjectURL = (url) => { released = url; };
  global.document = { createElement: () => canvas };
  global.window = { Image: class {
    set src(value) { queueMicrotask(() => this.onerror(new Error(value))); }
  } };
  try {
    await assert.rejects(images.prepareImageForStorage({ type: 'image/png', size: 10 }));
    assert.equal(released, 'blob:test-image');
    assert.equal(canvas.width, 0);
    assert.equal(canvas.height, 0);
  } finally {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    if (originalWindow === undefined) delete global.window;
    else global.window = originalWindow;
    if (originalDocument === undefined) delete global.document;
    else global.document = originalDocument;
  }
});

const timer = loadSource('src/lib/timeDisplay.ts');

test('orbit crosses the minute and day boundaries forwards', () => {
  assert.equal(timer.nextOrbitAngle(59, 0, 60, 354), 360);
  assert.equal(timer.nextOrbitAngle(0, 1, 60, 360), 366);
  assert.equal(timer.nextOrbitAngle(23, 0, 24, 345), 360);
  assert.equal(timer.nextOrbitAngle(58, 2, 60, 348), 372);
});

test('timer keeps malformed values within their clock ranges', () => {
  assert.equal(timer.clampTimeUnit(NaN, 60), 0);
  assert.equal(timer.clampTimeUnit(Infinity, 60), 0);
  assert.equal(timer.clampTimeUnit(-1, 24), 0);
  assert.equal(timer.clampTimeUnit(24, 24), 23);
  assert.equal(timer.clampTimeUnit(9.8, 60), 9);
});


const appleLink = 'https://music.apple.com/tr/album/%D0%BD%D0%B5%D1%82-%D1%82%D0%B5%D0%B1%D1%8F-single/6786450095';

test('Apple release suffix is removed without inventing an artist', () => {
  assert.equal(tracks.inferTrackFromUrl(appleLink).title, 'нет тебя');
  assert.equal(tracks.inferTrackFromUrl(appleLink).artist, '');
  assert.equal(tracks.cleanTrackTitle('нет тебя single', appleLink), 'нет тебя');
  assert.equal(tracks.cleanTrackTitle('Single', appleLink), 'Single');
  assert.equal(tracks.cleanTrackTitle("I’m Single", appleLink), "I’m Single");
  assert.equal(tracks.cleanTrackTitle('A Single', 'https://soundcloud.com/artist/song'), 'A Single');
});

test('provider requests cannot be redirected to lookalike domains', () => {
  assert.equal(tracks.getTrackOembedUrl('https://spotify.com.evil.example/track/123'), null);
  assert.equal(tracks.getTrackOembedUrl('https://notspotify.com/track/123'), null);
  assert.equal(tracks.inferTrackFromUrl('https://user:password@open.spotify.com/track/123'), null);
  assert.equal(tracks.inferTrackFromUrl('https://youtu.be/dQw4w9WgXc').title, '');
});

const music = loadSource('src/lib/musicMetadata.ts');

test('Apple lookup picks the requested song rather than the first album track', () => {
  const fallback = tracks.inferTrackFromUrl(appleLink + '?i=22');
  const data = [
    { collectionName: 'нет тебя - Single', artistName: '9mice' },
    { kind: 'song', trackId: 11, trackName: 'Другой трек', artistName: '9mice' },
    { kind: 'song', trackId: 22, trackName: 'нет тебя', artistName: '9mice' },
  ];
  const result = music.parseAppleResults(data, fallback, '22');
  assert.equal(result.title, 'нет тебя');
  assert.equal(result.artist, '9mice');
  assert.equal(music.parseAppleResults(data, fallback).title, 'нет тебя');
  assert.equal(music.parseAppleResults(data, fallback, '999').resolved, false);
});

test('metadata does not treat a provider name as a performer', () => {
  const fallback = tracks.inferTrackFromUrl('https://open.spotify.com/track/123456789012345');
  const result = tracks.parseTrackOembed({ title: 'Song name' }, fallback);
  assert.equal(result.artist, '');
  const withArtist = tracks.parseTrackOembed({ title: 'Artist - Song name', author_name: 'Artist' }, fallback);
  assert.equal(withArtist.title, 'Song name');
  assert.equal(withArtist.artist, 'Artist');
});

const dates = loadSource('src/lib/widgetDates.ts');

test('event labels distinguish today, future and past calendar dates', () => {
  const today = new Date(2026, 9, 18, 23, 50);
  assert.equal(dates.eventDayLabel('2026-10-18', today), 'Сегодня');
  assert.equal(dates.eventDayLabel('2026-10-19', today), 'Через 1 день');
  assert.equal(dates.eventDayLabel('2026-10-15', today), '3 дня назад');
  assert.equal(dates.eventDayLabel('2026-02-31', today), null);
});

test('metadata lookup uses the track id and stays on fixed provider hosts', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url) => {
    calls.push(new URL(url));
    return { ok: true, json: async () => ({ results: [{ kind: 'song', trackId: 22, trackName: 'Наш трек', artistName: 'Исполнитель' }] }) };
  };
  try {
    const metadata = await music.resolveMusicMetadata(appleLink + '?i=22');
    assert.equal(metadata.title, 'Наш трек');
    assert.equal(calls[0].hostname, 'itunes.apple.com');
    assert.equal(calls[0].searchParams.get('id'), '22');
    assert.equal(calls[0].searchParams.get('country'), 'tr');
    await music.resolveMusicMetadata('https://unrelated.example/song');
    assert.equal(calls.length, 1);
  } finally {
    global.fetch = originalFetch;
  }
});

test('provider outages leave a usable cleaned music link', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error('Offline'); };
  try {
    const metadata = await music.resolveMusicMetadata(appleLink);
    assert.equal(metadata.title, 'нет тебя');
    assert.equal(metadata.url, tracks.inferTrackFromUrl(appleLink).url);
    assert.equal(metadata.resolved, false);
  } finally {
    global.fetch = originalFetch;
  }
});
