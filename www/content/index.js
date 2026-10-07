/**
 * content/index.js
 * ------------------------------------------------------------
 * ثبت تمام مجموعه‌های محتوا در رجیستری هسته (بند 30).
 * هسته بازی هیچ وابستگی‌ای به آیتم خاصی از این فایل‌ها ندارد.
 */
import { registerCollection, migrateEvent_v1toV2, getContent, getById, getRawContent } from '../core/contentManager.js';
import { EVENTS } from './events.js';
import { BUILDINGS } from './buildings.js';
import { UNITS } from './units.js';
import { GENERALS } from './generals.js';
import { COUNTRIES } from './countries.js';
import { MISSIONS } from './missions.js';
import { ACHIEVEMENTS } from './achievements.js';
import { TECHNOLOGIES } from './technologies.js';
import { TITLES } from './titles.js';
import { MAP_TILES, ownedTileProduction, TILE_TYPE_NAMES } from './mapTiles.js';
import { GOV_STYLES, SYMBOLS, FLAGS, COLORS, EPITHETS } from './royalStyles.js';

let registered = false;
export function registerAllContent() {
  if (registered) return;
  registerCollection('events', EVENTS, migrateEvent_v1toV2);
  registerCollection('buildings', BUILDINGS);
  registerCollection('units', UNITS);
  registerCollection('generals', GENERALS);
  registerCollection('countries', COUNTRIES);
  registerCollection('missions', MISSIONS);
  registerCollection('achievements', ACHIEVEMENTS);
  registerCollection('technologies', TECHNOLOGIES);
  registerCollection('titles', TITLES);
  registerCollection('mapTiles', MAP_TILES);
  registerCollection('govStyles', GOV_STYLES);
  registered = true;
}

export const content = {
  get events() { return getContent('events'); },
  get buildings() { return getContent('buildings'); },
  get units() { return getContent('units'); },
  get generals() { return getContent('generals'); },
  get countries() { return getContent('countries'); },
  get missions() { return getContent('missions'); },
  get achievements() { return getContent('achievements'); },
  get technologies() { return getContent('technologies'); },
  get titles() { return getContent('titles'); },
  get mapTiles() { return getRawContent('mapTiles'); },
  get govStyles() { return getContent('govStyles'); },
  symbols: SYMBOLS,
  flags: FLAGS,
  colors: COLORS,
  epithets: EPITHETS,
  ownedTileProduction,
  TILE_TYPE_NAMES,
  getById,
};
