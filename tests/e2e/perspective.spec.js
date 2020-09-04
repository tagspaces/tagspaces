import { clearLocalStorage, delay } from './hook';
import {
  createLocation,
  defaultLocationName,
  defaultLocationPath,
  openLocation
} from './location.helpers';

describe('TST11 - Perspective tests', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
  });

  it.skip('TST1101 - Add perspective', () => {});

  it.skip('TST1102 - Remove perspective', () => {});

  it.skip('TST1103 - Change perspective order', () => {});

  it.skip('TST1104 - Should switch perspective to grid perspective', () => {});
});
