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
