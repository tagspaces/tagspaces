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
      command: 'del',
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
    /* {
    name: 'propertiesDocument',
    command: 'alt+enter',
  }, */
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
      command: 'Escape',
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
      command: 'f11',
    },
    // {
    //   name: 'openDevTools',
    //   command: 'f10'
    // },
    {
      name: 'openSearch',
      command: (isMacLike ? 'command' : 'ctrl') + '+f',
    },
    {
      name: 'renameFile',
      command: 'f2',
    },
    {
      name: 'openEntry',
      command: 'alt+enter',
    },
    {
      name: 'openParentDirectory',
      command: 'backspace',
    },
    {
      name: 'openFileExternally',
      command: (isMacLike ? 'command' : 'ctrl') + '+enter',
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
