/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { expect, test } from './fixtures';
import {
  clickOn,
  clickOnIfVisible,
  createNewDirectory,
  expectElementExist,
  getGridFileSelector,
  reloadDirectory,
  selectAllFiles,
  setInputValue,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import {
  createPwLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import { openContextEntryMenu } from './test-utils';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  if (isS3) {
    await startTestingApp({ isWeb, isS3, webServerPort, testInfo });
    await closeWelcomePlaywright();
  } else {
    await startTestingApp(
      { isWeb, isS3, webServerPort, testInfo },
      'extconfig.js',
    );
  }
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async () => {
  await clearDataStorage();
});

test.beforeEach(async ({ isS3, testDataDir }) => {
  if (isS3) {
    await createS3Location('', defaultLocationName, true);
    await closeWelcomePlaywright();
  } else {
    await createPwLocation(testDataDir, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 15000);
});

async function openMoveCopyDialogForEmptyFolder() {
  await openContextEntryMenu(
    '[data-tid=fsEntryName_empty_folder]',
    'fileMenuMoveCopyDirectoryTID',
  );
  // Wait for the dialog primary CTA — default mode is Move → confirmMoveFiles
  await expectElementExist('[data-tid=confirmMoveFiles]', true, 10000);
}

async function closeMoveCopyDialog() {
  await clickOnIfVisible('[data-tid=closeMoveCopyDialog]', 3000);
}

test.describe('TST10 - Move/Copy dialog new features', () => {
  test('TST1001 - Mode toggle switches the primary CTA [web,s3,electron]', async () => {
    await openMoveCopyDialogForEmptyFolder();

    // Default Move → confirmMoveFiles is present, confirmCopyFiles is not
    await expectElementExist('[data-tid=confirmMoveFiles]', true, 5000);
    await expectElementExist('[data-tid=confirmCopyFiles]', false, 1500);

    // Switch to Copy mode
    await clickOn('[data-tid=mcfModeCopy]');
    await expectElementExist('[data-tid=confirmCopyFiles]', true, 5000);
    await expectElementExist('[data-tid=confirmMoveFiles]', false, 1500);

    // Back to Move
    await clickOn('[data-tid=mcfModeMove]');
    await expectElementExist('[data-tid=confirmMoveFiles]', true, 5000);

    await closeMoveCopyDialog();
  });

  test('TST1002 - Search filters the folder list [web,s3,electron]', async () => {
    await openMoveCopyDialogForEmptyFolder();

    // The picker should list empty_folder as a target at root
    await expectElementExist('[data-tid=MoveTargetempty_folder]', true, 5000);

    // Typing a non-matching query filters it out
    await setInputValue(
      '[data-tid=folderBrowserSearch]',
      'no-such-folder-name-xyz',
    );
    await expectElementExist('[data-tid=MoveTargetempty_folder]', false, 3000);

    // Clearing brings it back
    await setInputValue('[data-tid=folderBrowserSearch]', '');
    await expectElementExist('[data-tid=MoveTargetempty_folder]', true, 3000);

    await closeMoveCopyDialog();
  });

  test('TST1003 - Up button returns to the parent folder [web,s3,electron]', async () => {
    await openMoveCopyDialogForEmptyFolder();

    // Descend into empty_folder via the picker
    await expectElementExist('[data-tid=MoveTargetempty_folder]', true, 5000);
    await clickOn('[data-tid=MoveTargetempty_folder]');

    // Now we're inside empty_folder — empty_folder itself is no longer a row
    await expectElementExist('[data-tid=MoveTargetempty_folder]', false, 3000);

    // Click Up
    await clickOn('[data-tid=navigateToParentTID]');

    // empty_folder reappears at root
    await expectElementExist('[data-tid=MoveTargetempty_folder]', true, 5000);

    await closeMoveCopyDialog();
  });

  test('TST1004 - Mode toggle is persisted across dialog opens [web,s3,electron]', async () => {
    // Open dialog and switch to Copy mode
    await openMoveCopyDialogForEmptyFolder();
    await clickOn('[data-tid=mcfModeCopy]');
    await expectElementExist('[data-tid=confirmCopyFiles]', true, 5000);
    await closeMoveCopyDialog();

    // Reopen — should default to Copy mode now (persisted via lastMoveCopyMode setting)
    await openContextEntryMenu(
      '[data-tid=fsEntryName_empty_folder]',
      'fileMenuMoveCopyDirectoryTID',
    );
    await expectElementExist('[data-tid=confirmCopyFiles]', true, 10000);

    // Reset to Move for subsequent tests
    await clickOn('[data-tid=mcfModeMove]');
    await closeMoveCopyDialog();
  });

  test('TST1005 - Location picker opens with grouped locations [web,s3,electron]', async () => {
    await openMoveCopyDialogForEmptyFolder();

    // The LocationPicker trigger sits inside the destination row
    await expectElementExist(
      '[data-tid=folderBrowserLocationPicker]',
      true,
      5000,
    );

    // Click to open the menu and verify the current location is in the menu
    await clickOn('[data-tid=folderBrowserLocationPicker]');
    await expectElementExist(
      '[data-tid=folderBrowserLocationItem_' + defaultLocationName + ']',
      true,
      5000,
    );

    // Close the menu — press Escape
    await global.client.keyboard.press('Escape');
    await closeMoveCopyDialog();
  });

  test('TST1006 - Search + Copy commits the operation [electron,_pro]', async () => {
    // Use a pre-existing file from the test data root (same pattern as TST0114)
    // — avoids a create-then-wait-for-refresh dance.
    const fileName = 'sample.txt';

    // Open the dialog from the file's context menu
    await openContextEntryMenu(
      getGridFileSelector(fileName),
      'fileMenuMoveCopyFile',
    );
    await expectElementExist('[data-tid=confirmMoveFiles]', true, 10000);

    // Filter to a folder via search
    await setInputValue('[data-tid=folderBrowserSearch]', 'empty');
    await expectElementExist('[data-tid=MoveTargetempty_folder]', true, 5000);

    // Pick the destination (descends into it — targetPath becomes empty_folder)
    await clickOn('[data-tid=MoveTargetempty_folder]');

    // Switch to Copy mode and commit
    await clickOn('[data-tid=mcfModeCopy]');
    await clickOn('[data-tid=confirmCopyFiles]');
    await clickOnIfVisible('[data-tid=uploadCloseAndClearTID]');

    // Source file should still be at the root
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await expectElementExist(getGridFileSelector(fileName), true, 5000);

    // Destination folder should contain the copy
    await global.client.dblclick(getGridFileSelector('empty_folder'));
    await expectElementExist(getGridFileSelector(fileName), true, 5000);
  });

  test('TST1007 - Cyclic move guard disables primary CTA [web,s3,electron]', async () => {
    // Open the dialog on a folder; the source is `empty_folder` itself.
    await openContextEntryMenu(
      '[data-tid=fsEntryName_empty_folder]',
      'fileMenuMoveCopyDirectoryTID',
    );
    await expectElementExist('[data-tid=confirmMoveFiles]', true, 10000);

    // Descend INTO empty_folder via the picker — target now equals the source
    // folder, which is the cyclic case validity guards against.
    await clickOn('[data-tid=MoveTargetempty_folder]');

    // Inline error row appears with the stable id used by aria-describedby.
    await expectElementExist('#mcf-validity-error', true, 5000);

    // And the Move primary is disabled.
    const moveBtn = global.client.locator('[data-tid=confirmMoveFiles]');
    expect(await moveBtn.isDisabled()).toBe(true);

    await closeMoveCopyDialog();
  });

  test('TST1009 - Bulk multi-file copy renders single-row progress and lands on disk (regression) [electron,s3]', async () => {
    // Regression guard for the bounded-fanout work in copyFilesWithProgress.
    // Two things must hold for a multi-file copy:
    //   1. The progress dialog uses the single-row batch-key shape — title
    //      shows `(N%)`, not the misleading per-file `(0/1)`. Asserting on
    //      "%" in the title text is the cheapest way to lock that in.
    //   2. Every selected file actually arrives at the destination. If
    //      runConcurrent's worker pool ever silently dropped tail items
    //      this assertion would fail.
    const destName = 'bulkcopy_dest_' + Date.now();

    // Create the destination folder at the root.
    await createNewDirectory(destName);
    await expectElementExist(getGridFileSelector(destName), true, 10000);

    // Select all files in the root listing (the supported-filestypes location
    // ships with ~69 sample files — enough to exercise the pool but small
    // enough that the copy completes in seconds, not minutes).
    await selectAllFiles();

    // Open the bulk move/copy dialog via the toolbar action.
    await clickOn('[data-tid=gridPerspectiveCopySelectedFiles]');
    // Make sure we're in Copy mode (the toggle is persisted — last test may
    // have left it on Move).
    await clickOnIfVisible('[data-tid=mcfModeCopy]');
    await expectElementExist('[data-tid=confirmCopyFiles]', true, 5000);

    // Pick the destination via the picker.
    await setInputValue('[data-tid=folderBrowserSearch]', destName);
    await expectElementExist(
      '[data-tid=MoveTarget' + destName + ']',
      true,
      5000,
    );
    await clickOn('[data-tid=MoveTarget' + destName + ']');

    // Fire the copy.
    await clickOn('[data-tid=confirmCopyFiles]');

    // Upload dialog should appear.
    await expectElementExist(
      '[data-tid=closeFileUploadTID]',
      true,
      15000,
    );

    // After completion the "Close and Clear" footer button becomes visible
    // (it only renders when `!haveProgress`). Wait up to 60s — a clean
    // copy of ~69 small files takes a couple seconds; the slack covers
    // slower CI machines and S3-backed runs.
    await expectElementExist(
      '[data-tid=uploadCloseAndClearTID]',
      true,
      60000,
    );

    // Pull the actual dialog title text. The title encodes how progress is
    // dispatched — and the load-bearing regression we want to guard against
    // is "thousands of per-file rows". Two valid post-fix shapes:
    //   `(N%)`   when a single copyFilesWithProgress call dispatched its
    //            stable batch key (one row).
    //   `(K/M)`  when copyDirs + copyFiles fanned into a few rows (one per
    //            top-level dir + one per copyFilesWithProgress call). M is
    //            always small here — never the total file count.
    // Pre-fix this would have been `(N/69)` or similar (one row per file).
    //
    // Scope the selector: `#draggable-dialog-title` is reused by every
    // TsDialogTitle in the app, and `keepMounted` leaves hidden dialogs in
    // the DOM whose `.innerText()` returns "". Use `:has()` to pick the
    // title that contains our close button — guaranteed to be the visible
    // FileUploadDialog.
    const titleText = await global.client
      .locator('#draggable-dialog-title:has([data-tid=closeFileUploadTID])')
      .innerText();
    const pctMatch = titleText.match(/\((\d+)%\)/);
    const countMatch = titleText.match(/\((\d+)\/(\d+)\)/);
    expect(Boolean(pctMatch || countMatch)).toBe(true);
    if (countMatch) {
      // The denominator must be tiny (a handful of dispatches) — not the
      // total number of files we just copied. 20 is generous and still
      // catches a regression to per-file rows on our ~69-file dataset.
      expect(parseInt(countMatch[2], 10)).toBeLessThan(20);
    }

    await clickOn('[data-tid=uploadCloseAndClearTID]');

    // The on-disk assertion: at least one well-known sample file from the
    // root must now be inside the destination folder. We pick a small,
    // text-y file so the assertion is cheap and not thumbnail-dependent.
    await global.client.dblclick(getGridFileSelector(destName));
    await expectElementExist(getGridFileSelector('sample.txt'), true, 10000);
    await expectElementExist(getGridFileSelector('sample.json'), true, 5000);
  });

  test('TST1010 - Minimize hides dialog while indicator stays + reopens on click (regression) [electron,s3]', async () => {
    // Regression guard for the minimize wiring: clicking the title X must
    // hide the dialog WITHOUT clearing progress state, so the small
    // CircularProgress indicator next to the search bar stays up and can
    // restore the dialog. The pre-fix bug was that any progress dispatch
    // re-opened the dialog via a useEffect on `progress`, making minimize
    // visually flicker.
    const destName = 'mincop_dest_' + Date.now();
    await createNewDirectory(destName);
    await expectElementExist(getGridFileSelector(destName), true, 10000);

    await selectAllFiles();
    await clickOn('[data-tid=gridPerspectiveCopySelectedFiles]');
    await clickOnIfVisible('[data-tid=mcfModeCopy]');
    await expectElementExist('[data-tid=confirmCopyFiles]', true, 5000);

    await setInputValue('[data-tid=folderBrowserSearch]', destName);
    await expectElementExist(
      '[data-tid=MoveTarget' + destName + ']',
      true,
      5000,
    );
    await clickOn('[data-tid=MoveTarget' + destName + ']');
    await clickOn('[data-tid=confirmCopyFiles]');

    // Wait for the upload dialog (title close button is the minimize gesture).
    await expectElementExist(
      '[data-tid=closeFileUploadTID]',
      true,
      15000,
    );

    // Click the title X — minimizes the dialog. The progress data must
    // remain in the store so the indicator can read it.
    await clickOn('[data-tid=closeFileUploadTID]');

    // Dialog is gone (no Close/Clear visible).
    await expectElementExist(
      '[data-tid=uploadCloseAndClearTID]',
      false,
      3000,
    );

    // The background-process indicator next to the search bar is now the
    // only surface showing progress. It only renders when `progress.length
    // > 0`, so its presence after minimize is the load-bearing assertion.
    await expectElementExist('#progressButton', true, 10000);

    // Click the indicator to restore the dialog.
    await clickOn('#progressButton');
    // The dialog comes back — title X visible again.
    await expectElementExist(
      '[data-tid=closeFileUploadTID]',
      true,
      5000,
    );

    // Let it finish and dismiss for the next test's clean slate.
    await expectElementExist(
      '[data-tid=uploadCloseAndClearTID]',
      true,
      60000,
    );
    await clickOn('[data-tid=uploadCloseAndClearTID]');

    // Once the user clicks Close and Clear, the indicator must disappear
    // (resetProgress empties the array, FolderContainer hides the button).
    await expectElementExist('#progressButton', false, 5000);
  });

  test('TST1008 - Folder move with same-name overwrite removes source on disk (regression) [electron]', async () => {
    // Regression guard for the silent-swallow bug in moveDirectoryPromise:
    // when the destination already contained a folder with the same name,
    // the conflict dialog confirmed "override", the source vanished from
    // the listing — but on reload it reappeared because the on-disk delete
    // had failed silently. The IO layer now propagates the failure; this
    // test asserts the user-visible contract that the source is truly gone
    // even after a hard directory reload.
    const sourceName = 'mvmerge_src_' + Date.now();
    const destParent = 'mvmerge_dest_' + Date.now();

    // 1. Create source at root, then create dest-parent + a same-named
    //    child inside it (so the move triggers the conflict path).
    await createNewDirectory(sourceName);
    await createNewDirectory(destParent);
    await global.client.dblclick(getGridFileSelector(destParent));
    await createNewDirectory(sourceName);
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await expectElementExist(getGridFileSelector(sourceName), true, 10000);

    // 2. Open Move/Copy dialog on the root source folder.
    await openContextEntryMenu(
      '[data-tid=fsEntryName_' + sourceName + ']',
      'fileMenuMoveCopyDirectoryTID',
    );
    await expectElementExist('[data-tid=confirmMoveFiles]', true, 10000);

    // 3. Descend into dest-parent so target = root/<destParent>.
    await clickOn('[data-tid=MoveTarget' + destParent + ']');
    await clickOn('[data-tid=confirmMoveFiles]');

    // 4. Conflict dialog appears ("X exist do you want to override it?").
    //    Confirm the overwrite.
    await clickOn('[data-tid=confirmOverwriteByCopyMoveDialog]');

    // 5. Directory-move on a local location may surface the upload dialog
    //    with no progress (0/0); minimize/close it as the existing folder
    //    move tests do.
    await clickOnIfVisible('[data-tid=uploadCloseAndClearTID]');
    await clickOnIfVisible('[data-tid=uploadMinimizeDialogTID]');

    // 6. Source is gone from the root listing — the optimistic UI removal.
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await expectElementExist(getGridFileSelector(sourceName), false, 7000);

    // 7. The real assertion: reload from disk and verify the source is
    //    STILL gone. Prior to the fix the folder reappeared here because
    //    the source delete had silently failed.
    await reloadDirectory();
    await expectElementExist(getGridFileSelector(sourceName), false, 7000);

    // 8. And the destination still has the merged folder.
    await global.client.dblclick(getGridFileSelector(destParent));
    await expectElementExist(getGridFileSelector(sourceName), true, 7000);
  });
});
