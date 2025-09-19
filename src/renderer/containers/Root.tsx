/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
import AppConfig from '-/AppConfig';
import { FileUploadDialogContextProvider } from '-/components/dialogs/hooks/FileUploadDialogContextProvider';
import App from '-/containers/App';
import DialogsRoot from '-/containers/DialogsRoot';
import MainPage from '-/containers/MainPage';
import TsAuth from '-/containers/TsAuth';
import { BrowserHistoryContextProvider } from '-/hooks/BrowserHistoryContextProvider';
import { ChatContextProvider } from '-/hooks/ChatProvider';
import { CurrentLocationContextProvider } from '-/hooks/CurrentLocationContextProvider';
import { DirectoryContentContextProvider } from '-/hooks/DirectoryContentContextProvider';
import { EditedEntryContextProvider } from '-/hooks/EditedEntryContextProvider';
import { EditedEntryMetaContextProvider } from '-/hooks/EditedEntryMetaContextProvider';
import { EditedTagLibraryContextProvider } from '-/hooks/EditedTagLibraryContextProvider';
import { EntryPropsTabsContextProvider } from '-/hooks/EntryPropsTabsContextProvider';
import { ExtensionsContextProvider } from '-/hooks/ExtensionsContextProvider';
import { FSWatcherContextProvider } from '-/hooks/FSWatcherContextProvider';
import { FileUploadContextProvider } from '-/hooks/FileUploadContextProvider';
import { HistoryContextProvider } from '-/hooks/HistoryContextProvider';
import { IOActionsContextProvider } from '-/hooks/IOActionsContextProvider';
import { LocationIndexContextProvider } from '-/hooks/LocationIndexContextProvider';
import { NotificationContextProvider } from '-/hooks/NotificationContextProvider';
import { OpenedEntryContextProvider } from '-/hooks/OpenedEntryContextProvider';
import { PanelsContextProvider } from '-/hooks/PanelsContextProvider';
import { PerspectiveActionsContextProvider } from '-/hooks/PerspectiveActionsContextProvider';
import { PlatformFacadeContextProvider } from '-/hooks/PlatformFacadeContextProvider';
import { SavedSearchesContextProvider } from '-/hooks/SavedSearchesContextProvider';
import { SearchQueryContextProvider } from '-/hooks/SearchQueryContextProvider';
import { SelectedEntryContextProvider } from '-/hooks/SelectedEntryContextProvider';
import { TagGroupsLocationContextProvider } from '-/hooks/TagGroupsLocationContextProvider';
import { TaggingActionsContextProvider } from '-/hooks/TaggingActionsContextProvider';
import { UserContextProvider } from '-/hooks/UserContextProvider';
import { Pro } from '-/pro';
import i18nInit from '-/services/i18nInit';
import React, { useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider as ReduxProvider } from 'react-redux';
import { Store } from 'redux';
import { PersistGate } from 'redux-persist/integration/react';
import { actions as AppActions } from '../reducers/app';

type RootType = {
  store: Store<{}>;
  persistor: any;
};

/**
 * Compose an array of providers (components that accept children) around children.
 */
function composeProviders(
  providers: React.ComponentType<{ children?: React.ReactNode }>[],
  children: React.ReactNode,
) {
  return providers.reduceRight<React.ReactNode>((acc, Provider) => {
    return <Provider>{acc}</Provider>;
  }, children);
}

/* Few small wrappers where provider needs props */
const DndWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>{children}</DndProvider>
);

/* The stack of Pro-only feature providers (WorkSpaces removed from here). */
const ProFeatureStack: React.FC = () => (
  <Pro.contextProviders.BookmarksContextProvider>
    <Pro.contextProviders.KanBanImportDialogContextProvider>
      <Pro.contextProviders.ThumbDialogContextProvider>
        <Pro.contextProviders.BgndDialogContextProvider>
          <Pro.contextProviders.AiTemplatesContextProvider>
            <Pro.contextProviders.FileTemplatesContextProvider>
              <Pro.contextProviders.WorkSpacesContextProvider>
                <ChatContextProvider>
                  <DialogsRoot>
                    <MainPage />
                  </DialogsRoot>
                </ChatContextProvider>
              </Pro.contextProviders.WorkSpacesContextProvider>
            </Pro.contextProviders.FileTemplatesContextProvider>
          </Pro.contextProviders.AiTemplatesContextProvider>
        </Pro.contextProviders.BgndDialogContextProvider>
      </Pro.contextProviders.ThumbDialogContextProvider>
    </Pro.contextProviders.KanBanImportDialogContextProvider>
  </Pro.contextProviders.BookmarksContextProvider>
);

/* Non-pro fallback content */
const NonProInner: React.FC = () => (
  <ChatContextProvider>
    <DialogsRoot>
      <MainPage />
    </DialogsRoot>
  </ChatContextProvider>
);

/* Providers that are shared and can be composed programmatically */
const SHARED_PROVIDERS = [
  NotificationContextProvider,
  CurrentLocationContextProvider,
  EditedEntryContextProvider,
  EditedEntryMetaContextProvider,
  PerspectiveActionsContextProvider,
  SelectedEntryContextProvider,
  DirectoryContentContextProvider,
  FSWatcherContextProvider,
  PlatformFacadeContextProvider,
  LocationIndexContextProvider,
  IOActionsContextProvider,
  EntryPropsTabsContextProvider,
  OpenedEntryContextProvider,
  TagGroupsLocationContextProvider,
  EditedTagLibraryContextProvider,
  TaggingActionsContextProvider,
  DndWrapper, // wrapper that passes backend prop
  ExtensionsContextProvider,
  PanelsContextProvider,
  UserContextProvider,
  SavedSearchesContextProvider,
  SearchQueryContextProvider,
  BrowserHistoryContextProvider,
  FileUploadContextProvider,
  FileUploadDialogContextProvider,
  HistoryContextProvider,
] as React.ComponentType<any>[];

export default function Root({ store, persistor }: RootType) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Safe read of language setting; fall back to 'en' if anything is missing
    try {
      const language: string =
        (store.getState() as any).settings?.interfaceLanguage ?? 'en';
      i18nInit(language)
        .then(() => setInitialized(true))
        .catch(() => setInitialized(true));
    } catch (err) {
      // if anything goes wrong, still allow app to render
      setInitialized(true);
    }
    // we intentionally run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * IMPORTANT: this hook must run on every render — even while `initialized` is false —
   * otherwise hook order will change between renders and React will throw.
   *
   * If `Pro` can change at runtime, include it in deps: [Pro] (but usually it's static).
   */
  const appInner = useMemo(() => {
    const inner = Pro ? <ProFeatureStack /> : <NonProInner />;
    return composeProviders(SHARED_PROVIDERS, inner);
  }, []); // keep empty if Pro is static; add [Pro] if Pro can change during runtime

  if (!initialized) {
    return <span />;
  }

  let appContent = <App>{appInner}</App>;

  if (AppConfig.isWeb) {
    appContent = <TsAuth>{appContent}</TsAuth>;
  }

  return (
    <ReduxProvider
      // @ts-ignore
      store={store}
    >
      {/**
       * PersistGate delays the rendering of the app's UI until the persisted state has been retrieved
       * and saved to redux.
       * The `loading` prop can be `null` or any react instance to show during loading (e.g. a splash screen),
       * for example `loading={<SplashScreen />}`.
       * @see https://github.com/rt2zz/redux-persist/blob/master/docs/PersistGate.md
       */}
      <PersistGate
        // loading={<LoadingScreen />}
        onBeforeLift={() => {
          // eslint-disable-next-line react/prop-types
          if (!AppConfig.isAmplify) {
            // || store.app.user !== undefined
            // @ts-ignore
            store.dispatch(AppActions.initApp());
          }
        }}
        // @ts-ignore
        persistor={persistor}
      >
        {appContent}
      </PersistGate>
    </ReduxProvider>
  );
}
