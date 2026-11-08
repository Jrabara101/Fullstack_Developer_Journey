import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHaversineMiles, atomicDeductVariantStock, MERCH_PRODUCTS, ALBUMS, TRACKS, TOUR_DATES } from '../src/store.js';

test('Haversine distance calculation is accurate', () => {
  // Distance between San Francisco (37.7749, -122.4194) and Los Angeles (34.0522, -118.2437) is approx 347 miles
  const miles = calculateHaversineMiles(37.7749, -122.4194, 34.0522, -118.2437);
  assert.ok(miles > 340 && miles < 360, `Expected ~347 miles, got ${miles}`);
});

test('Albums catalog contains all 3 eras with matching themes', () => {
  assert.equal(ALBUMS.length, 3);
  const nocturne = ALBUMS.find(a => a.era_key === 'nocturne');
  const solar = ALBUMS.find(a => a.era_key === 'solar');
  const echo = ALBUMS.find(a => a.era_key === 'echo');

  assert.ok(nocturne && nocturne.era_theme_json.accent === '#FF3366');
  assert.ok(solar && solar.era_theme_json.accent === '#FF6B00');
  assert.ok(echo && echo.era_theme_json.accent === '#A855F7');
});

test('Tracks have multi-channel stem mappings, synced lyrics, and waveform peaks', () => {
  const track1 = TRACKS[0];
  assert.ok(track1.stems_json.vocals, 'Should have vocal stem');
  assert.ok(track1.stems_json.synths, 'Should have synth stem');
  assert.ok(track1.stems_json.drums, 'Should have drum stem');
  assert.ok(track1.stems_json.bass, 'Should have bass stem');
  assert.ok(track1.synced_lyrics_lrc.length > 0, 'Should have synced lyrics');
  assert.ok(track1.waveform_peaks.length > 10, 'Should have peak points');
});

test('Atomic variant stock deduction behaves safely under inventory constraints', () => {
  const testProduct = MERCH_PRODUCTS[0];
  const testVariant = testProduct.variants[0];
  const initialStock = testVariant.stock_available;

  // Deduct 1 item
  const result1 = atomicDeductVariantStock(testVariant.id, 1);
  assert.equal(result1.success, true);
  assert.equal(testVariant.stock_available, initialStock - 1);

  // Attempt to deduct more than available
  const resultTooMany = atomicDeductVariantStock(testVariant.id, 99999);
  assert.equal(resultTooMany.success, false);
});

