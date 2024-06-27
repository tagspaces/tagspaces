export default function keyBindings(isMacLike) {
  return [
    {
      name: 'selectAll',
      command: (isMacLike ? 'command' : 'ctrl') + '+a',
    },
    {
      name: 'closeViewer',
      command: (isMacLike ? 'command' : 'ctrl') + '+w',
    },
    {
      name: 'saveDocument',
      command: (isMacLike ? 'command' : 'ctrl') + '+s',
    },
    {
      name: 'reloadDocument',
      command: (isMacLike ? 'command' : 'ctrl') + '+r',
    },
    {
      name: 'editDocument',
      command: (isMacLike ? 'command' : 'ctrl') + '+e',
    },
    {
      name: 'deleteDocument',
      command: isMacLike ? 'f8' : 'del',
    },
    {
      name: 'copyMoveSelectedEntries',
      command: 'f6',
    },
    {
      name: 'showLocationManager',
      command: (isMacLike ? 'command' : 'ctrl') + '+1',
    },
    {
      name: 'showTagLibrary',
      command: (isMacLike ? 'command' : 'ctrl') + '+2',
    },
    {
      name: 'showSearch',
      command: (isMacLike ? 'command' : 'ctrl') + '+3',
    },
    {
      name: 'toggleShowHiddenEntries',
      command: (isMacLike ? 'command' : 'ctrl') + '+h',
    },
    {
      name: 'addRemoveTags',
      command: (isMacLike ? 'command' : 'ctrl') + '+t',
    },
    {
      name: 'nextDocument',
      command: 'down',
    },
    {
      name: 'prevDocument',
      command: 'up',
    },
    {
      name: 'Escape',
      command: 'escape',
    },
    {
      name: 'showHelp',
      command: 'f1',
    },
    // {
    //   name: 'reloadApplication',
    //   command: 'r a'
    // },
    {
      name: 'toggleFullScreen',
      command: isMacLike ? 'command+f11' : 'f11',
    },
    {
      name: 'openInFullWidth',
      command: 'f10',
    },
    {
      name: 'openSearch',
      command: (isMacLike ? 'command' : 'ctrl') + '+k',
    },
    {
      name: 'renameFile',
      command: 'f2',
    },
    {
      name: 'duplicateFile',
      command: (isMacLike ? 'option' : 'alt') + '+d',
    },
    {
      name: 'openEntry',
      command: 'enter',
    },
    {
      name: 'openEntryDetails',
      command: (isMacLike ? 'command' : 'ctrl') + '+o',
    },
    {
      name: 'openFileExternally',
      command: (isMacLike ? 'command' : 'ctrl') + '+enter',
    },
    {
      name: 'openParentDirectory',
      command: 'backspace',
    },
    {
      name: 'zoomIn',
      command: (isMacLike ? 'command' : 'ctrl') + '+shift+',
    },
    {
      name: 'zoomOut',
      command: (isMacLike ? 'command' : 'ctrl') + '+-',
    },
  ];
}
