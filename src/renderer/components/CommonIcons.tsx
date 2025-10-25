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

import ExportIcon from '@mui/icons-material/ExitToApp';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import MarkdownRawIcon from '@mui/icons-material/SimCardDownloadOutlined';
import SvgIcon from '@mui/material/SvgIcon';

export const ParentFolderIcon = (props) => (
  <KeyboardReturnIcon sx={{ transform: 'rotate(90deg)' }} {...props} />
);

export const MarkdownFileIcon = (props) => (
  <MarkdownRawIcon sx={{ transform: 'scaleX(-1)' }} />
);

export { default as WorkspacesIcon } from '@mui/icons-material/WorkspacesOutline';

export const NavigateToFolderIcon = (props) => <KeyboardReturnIcon />;

export { default as InfoTooltipIcon } from '@mui/icons-material/InfoOutlined';

export { default as FolderIcon } from '@mui/icons-material/FolderOpenOutlined';

export { default as FolderOutlineIcon } from '@mui/icons-material/FolderOpen';

export { default as FileIcon } from '@mui/icons-material/InsertDriveFileOutlined';

export { default as GoBackIcon } from '@mui/icons-material/ArrowBack';

export { default as GoForwardIcon } from '@mui/icons-material/ArrowForward';

export { default as HelpIcon } from '@mui/icons-material/HelpOutlineOutlined';

export { default as InfoIcon } from '@mui/icons-material/InfoOutlined';

export { default as EntryPropertiesIcon } from '@mui/icons-material/InfoOutlined';

export { default as RemoveIcon } from '@mui/icons-material/RemoveCircleOutlineOutlined';

export { default as RemoveTagIcon } from '@mui/icons-material/Close';

export { default as HistoryIcon } from '@mui/icons-material/History';

export { default as SettingsIcon } from '@mui/icons-material/Settings';

export { default as PerspectiveSettingsIcon } from '@mui/icons-material/DisplaySettings';

export { default as CreateFileIcon } from '@mui/icons-material/AddCircleOutlineOutlined';

export { default as AddIcon } from '@mui/icons-material/AddCircleOutlineOutlined';

export { default as LocalLocationIcon } from '@mui/icons-material/WorkOutline';

export { default as CloudLocationIcon } from '@mui/icons-material/CloudQueue';

export { default as OpenLinkIcon } from '@mui/icons-material/Link';

export { default as KeyShortcutsIcon } from '@mui/icons-material/KeyboardOutlined';

export { default as CancelIcon } from '@mui/icons-material/Undo';

export { default as CloseEditIcon } from '@mui/icons-material/DisabledByDefault';

export { default as OpenNewWindowIcon } from '@mui/icons-material/OpenInBrowser';

export { default as ReloadIcon } from '@mui/icons-material/Refresh';

export { default as DeleteIcon } from '@mui/icons-material/DeleteOutlined';

export { default as LinkIcon } from '@mui/icons-material/Link';

export { default as ExpandIcon } from '@mui/icons-material/ExpandMore';

export { default as EditIcon } from '@mui/icons-material/Edit';

export { default as UntaggedIcon } from '@mui/icons-material/LabelOffOutlined';

export { default as BookmarkIcon } from '@mui/icons-material/BookmarkBorder';

export { default as BookIcon } from '@mui/icons-material/MenuBook';

export { default as EmailIcon } from '@mui/icons-material/MailOutline';

export { default as DateIcon } from '@mui/icons-material/DateRange';

export { default as PictureIcon } from '@mui/icons-material/PanoramaOutlined';

export { default as CopyPictureIcon } from '@mui/icons-material/CollectionsOutlined';

export { default as ChangeBackgroundIcon } from '@mui/icons-material/ImagesearchRollerOutlined';

export { default as DocumentIcon } from '@mui/icons-material/PictureAsPdfOutlined';

export { default as NoteIcon } from '@mui/icons-material/NoteOutlined';

export { default as AudioIcon } from '@mui/icons-material/MusicVideo';

export { default as VideoIcon } from '@mui/icons-material/OndemandVideo';

export { default as ArchiveIcon } from '@mui/icons-material/ArchiveOutlined';

export { default as SearchIcon } from '@mui/icons-material/Search';

export { default as CloseIcon } from '@mui/icons-material/CancelOutlined';

export { default as CloseDialogIcon } from '@mui/icons-material/Close';

export { default as ArrowBackIcon } from '@mui/icons-material/ArrowBackIos';

export { default as SelectedIcon } from '@mui/icons-material/CheckCircle';

export { default as CheckIcon } from '@mui/icons-material/Check';

export { default as UnSelectedIcon } from '@mui/icons-material/RadioButtonUnchecked';

export { default as MoreMenuIcon } from '@mui/icons-material/MoreVert';

export { default as RevisionIcon } from '@mui/icons-material/Restore';

export { default as DescriptionIcon } from '@mui/icons-material/Subject';

export { default as EditDescriptionIcon } from '@mui/icons-material/EditNote';

export { default as AudioRecordIcon } from '@mui/icons-material/KeyboardVoice';

export { default as NewFileIcon } from '@mui/icons-material/InsertDriveFileOutlined';

export { default as NewFolderIcon } from '@mui/icons-material/CreateNewFolderOutlined';

export { default as AddExistingFileIcon } from '@mui/icons-material/ExitToApp';

export { default as RecordIcon } from '@mui/icons-material/FiberManualRecord';

export { default as StopIcon } from '@mui/icons-material/Stop';

export { default as PauseIcon } from '@mui/icons-material/Pause';

export { default as SaveIcon } from '@mui/icons-material/Save';

export { default as DownloadIcon } from '@mui/icons-material/DownloadForOfflineOutlined';

export { default as TagIcon } from '@mui/icons-material/LocalOfferOutlined';

export { default as IDIcon } from '@mui/icons-material/Abc';

export { default as AudioFileIcon } from '@mui/icons-material/AudioFileOutlined';

export { default as HTMLFileIcon } from '@mui/icons-material/DescriptionOutlined';

export { default as LinkFileIcon } from '@mui/icons-material/FileOpenOutlined';

export { default as TemplateFileIcon } from '@mui/icons-material/TaskOutlined'; // TaskOutlined InsertPageBreakOutlined

export { default as AccountIcon } from '@mui/icons-material/AccountCircle';

export { default as PreviewIcon } from '@mui/icons-material/Preview';

export { default as RestoreIcon } from '@mui/icons-material/SettingsBackupRestore';

import ExpandCircleDownOutlined from '@mui/icons-material/ExpandCircleDownOutlined';

export const PrevDocumentIcon = (props) => (
  <ExpandCircleDownOutlined sx={{ transform: 'rotate(180deg)' }} {...props} />
);

export { default as NextDocumentIcon } from '@mui/icons-material/ExpandCircleDownOutlined';

export { default as ThemingIcon } from '@mui/icons-material/InvertColors';

export { default as TagLibraryIcon } from '@mui/icons-material/LocalOfferOutlined';

export { default as RecentThingsIcon } from '@mui/icons-material/BookmarksOutlined';

export { default as AIIcon } from '@mui/icons-material/AutoFixHighOutlined'; // AutoAwesome AutoFixHigh

export { default as ExtensionIcon } from '@mui/icons-material/Extension';

export { default as KeyboardIcon } from '@mui/icons-material/Keyboard';

export { default as OptionsIcon } from '@mui/icons-material/FactCheck';

export { default as AdvancedSettingsIcon } from '@mui/icons-material/DisplaySettings';

export { default as ArrowUpIcon } from '@mui/icons-material/ArrowCircleUpOutlined';

export { default as ArrowDownIcon } from '@mui/icons-material/ArrowCircleDownOutlined';

export { default as SmallArrowUpIcon } from '@mui/icons-material/KeyboardArrowDown';

export { default as SmallArrowDownIcon } from '@mui/icons-material/KeyboardArrowDown';

export { default as SmallArrowRightIcon } from '@mui/icons-material/KeyboardArrowRight';

export { default as ExportImportIcon } from '@mui/icons-material/SwapHoriz';

export { default as ExportIcon } from '@mui/icons-material/ExitToApp';

export const ImportIcon = (props) => (
  <ExportIcon sx={{ transform: 'rotate(180deg)' }} {...props} />
);

export { default as SortingIcon } from '@mui/icons-material/SwapVerticalCircleOutlined';

export { default as ShareIcon } from '@mui/icons-material/Share';

export { default as CopyMoveIcon } from '@mui/icons-material/FileCopyOutlined';

export { default as DragOffIcon } from '@mui/icons-material/CopyAll';

export { default as DragOnIcon } from '@mui/icons-material/CopyAllTwoTone';

export { default as ImportTagsIcon } from '@mui/icons-material/FindInPageOutlined';

export { default as RenameIcon } from '@mui/icons-material/DriveFileRenameOutlineOutlined';

export { default as OpenEntryNativelyIcon } from '@mui/icons-material/Launch';

export { default as OpenFolderIcon } from '@mui/icons-material/SubdirectoryArrowLeft';

export { default as OpenFileIcon } from '@mui/icons-material/SubdirectoryArrowRight';

export { default as DuplicateFile } from '@mui/icons-material/DifferenceOutlined';

export { default as DefaultLocationIcon } from '@mui/icons-material/HighlightOutlined';

export { default as MoreInfoIcon } from '@mui/icons-material/OfflineBoltOutlined';

export { default as ArrowLeftIcon } from '@mui/icons-material/ArrowCircleLeftOutlined';

export { default as ArrowRightIcon } from '@mui/icons-material/ArrowCircleRightOutlined';

export { default as PlayIcon } from '@mui/icons-material/PlayCircleFilledWhiteOutlined';

export { default as FullScreenIcon } from '@mui/icons-material/ScreenshotMonitor'; // ZoomOutMap

export { default as FullWidthIcon } from '@mui/icons-material/SettingsEthernet';

export { default as ColorPaletteIcon } from '@mui/icons-material/ColorLensOutlined';

export { default as ClearColorIcon } from '@mui/icons-material/FormatColorResetOutlined';

export { default as SetColorIcon } from '@mui/icons-material/WaterDropOutlined';

export { default as QrCodeIcon } from '@mui/icons-material/QrCode2Outlined';

export { default as EntryBookmarkAddIcon } from '@mui/icons-material/BookmarkAddTwoTone';

export { default as EntryBookmarkIcon } from '@mui/icons-material/BookmarkTwoTone';

export { default as EncryptedIcon } from '@mui/icons-material/HttpsOutlined';

export { default as SizeIcon } from '@mui/icons-material/BubbleChartOutlined';

export { default as CalendarIcon } from '@mui/icons-material/CalendarMonthOutlined';

export { default as UpdateIndexIcon } from '@mui/icons-material/Rotate90DegreesCcw';

export { default as FolderVisibilityOffIcon } from '@mui/icons-material/SnippetFolderOutlined';

export { default as FolderVisibilityOnIcon } from '@mui/icons-material/SnippetFolderTwoTone';

export { default as ToggleSubfoldersIcon } from '@mui/icons-material/RuleFolderOutlined';

export { default as GeoPinIcon } from '@mui/icons-material/AddLocationOutlined';

export { default as GeoTagIcon } from '@mui/icons-material/GpsFixedOutlined';

export { default as AboutIcon } from '@mui/icons-material/BlurOn';

export { default as IssueIcon } from '@mui/icons-material/BugReportOutlined';

export { default as CancelSubscriptionIcon } from '@mui/icons-material/EventBusyOutlined';

export { default as OnboardingIcon } from '@mui/icons-material/ExploreOutlined';

export { default as ProTeaserIcon } from '@mui/icons-material/FlightTakeoff';

export { default as ForumIcon } from '@mui/icons-material/ForumOutlined';

export { default as NewFeatureIcon } from '@mui/icons-material/GestureOutlined';

export { default as ChangeLogIcon } from '@mui/icons-material/MenuBookOutlined';

export { default as WebClipperIcon } from '@mui/icons-material/Transform';

export { default as TranslationIcon } from '@mui/icons-material/Translate';

export { default as XIcon } from '@mui/icons-material/X';

export { default as ChatIcon } from '@mui/icons-material/Chat';

export { default as ZoomInIcon } from '@mui/icons-material/ControlPoint';

export { default as ZoomOutIcon } from '@mui/icons-material/RemoveCircleOutline';

export { default as ZoomLevelIcon } from '@mui/icons-material/Loupe';

export { default as PinGroupingOffIcon } from '@mui/icons-material/Grain'; // ScatterPlotOutlined

export { default as PinGroupingOnIcon } from '@mui/icons-material/ScatterPlotTwoTone';

export { default as CopyToClipboardIcon } from '@mui/icons-material/ContentCopy';

export const MastodonIcon = (props) => (
  <SvgIcon>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 22.767835,5.656102 C 22.437586,3.2278293 20.298066,1.3141865 17.761829,0.94337338 17.333936,0.88071441 15.712708,0.6526794 11.957146,0.6526794 h -0.02804 c -3.7565788,0 -4.5625276,0.22803501 -4.9904209,0.29069398 C 4.4730526,1.3039152 2.2213928,3.0234214 1.6750926,5.4804304 1.412329,6.6904556 1.384287,8.0319662 1.4331009,9.2625334 c 0.069586,1.7647076 0.083087,3.5263166 0.2451076,5.2838396 0.1120088,1.167433 0.3074058,2.325564 0.5847276,3.465704 0.5192949,2.105736 2.6214069,3.858102 4.6809295,4.573042 2.2050327,0.745568 4.5763474,0.869316 6.8484844,0.357457 0.249933,-0.05751 0.49714,-0.1243 0.741539,-0.200299 0.551497,-0.173585 1.198551,-0.367742 1.674222,-0.70877 0.0065,-0.0048 0.01188,-0.01095 0.01564,-0.01808 0.0037,-0.0071 0.0059,-0.01497 0.0061,-0.02301 v -1.703052 c -1.17e-4,-0.0075 -0.0019,-0.0149 -0.0052,-0.02161 -0.0034,-0.0067 -0.0082,-0.01264 -0.01422,-0.01724 -0.006,-0.0047 -0.01292,-0.0079 -0.02031,-0.0095 -0.0074,-0.0016 -0.01509,-0.0016 -0.02249,8.7e-5 -1.455727,0.343925 -2.947469,0.516322 -4.444136,0.513599 -2.5757007,0 -3.2684481,-1.208983 -3.466836,-1.712323 -0.1594451,-0.434993 -0.2607103,-0.88873 -0.3011869,-1.349711 -3.946e-4,-0.0077 0.00105,-0.01547 0.00419,-0.02257 0.00315,-0.0071 0.00801,-0.01333 0.01405,-0.01823 0.0061,-0.0049 0.01324,-0.0083 0.020884,-0.01 0.00763,-0.0017 0.015584,-0.0015 0.023181,4.27e-4 1.4314771,0.341579 2.8988799,0.513976 4.3714409,0.513599 0.354153,0 0.707263,0 1.061445,-0.0092 1.481021,-0.04109 3.042012,-0.116071 4.499159,-0.397527 0.03636,-0.0071 0.0727,-0.01335 0.103873,-0.0226 2.298387,-0.436556 4.485657,-1.806809 4.707919,-5.276656 0.0083,-0.136613 0.02909,-1.430866 0.02909,-1.572609 10e-4,-0.481756 0.156838,-3.4174307 -0.02286,-5.2211683 z m -3.537443,8.658129 H 16.813616 V 8.4592788 c 0,-1.232625 -0.519307,-1.8612513 -1.575565,-1.8612513 -1.161144,0 -1.742746,0.7436835 -1.742746,2.2125359 v 3.2048176 h -2.40226 V 8.8105634 c 0,-1.4688524 -0.582643,-2.2125359 -1.7437891,-2.2125359 -1.05003,0 -1.5745237,0.6286263 -1.5755664,1.8612513 V 14.314231 H 5.3589707 V 8.2815796 c 0,-1.232625 0.318167,-2.2118695 0.9544715,-2.9377629 0.656384,-0.7241546 1.5173843,-1.0959818 2.5861022,-1.0959818 1.2369456,0 2.1716836,0.4704268 2.7948336,1.4103244 l 0.601362,0.9984252 0.602375,-0.9984252 c 0.623151,-0.9398976 1.557891,-1.4103244 2.792776,-1.4103244 1.067674,0 1.928646,0.3718272 2.587115,1.0959818 0.636334,0.7251983 0.954472,1.7044428 0.954472,2.9377629 z"
        fill="inherit"
        id="path148"
        style={{ strokeWidth: 0.289743 }}
      />
    </svg>
  </SvgIcon>
);

export const MainMenuIcon = (props) => (
  <SvgIcon>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m 17.949153,3.2288136 c 2.38594,0.00262 4.319493,1.9987321 4.322034,4.4618644 v 8.923729 c -0.0025,2.463133 -1.936094,4.459242 -4.322034,4.461865 H 5.8474576 C 3.4615172,21.073649 1.5279643,19.07754 1.5254237,16.614407 V 7.690678 C 1.5279646,5.2275457 3.4615175,3.2314368 5.8474576,3.2288136 H 17.949153 M 3.2542373,16.614407 c 0,1.47539 1.1640678,2.677119 2.5932203,2.677119 H 9.3050847 V 5.0135594 H 5.8474576 c -1.4291525,0 -2.5932203,1.2017288 -2.5932203,2.6771186 v 8.923729 M 20.542373,7.690678 c 0,-1.4753898 -1.164068,-2.6771186 -2.59322,-2.6771186 H 11.033898 V 19.291526 h 6.915255 c 1.429152,0 2.59322,-1.201729 2.59322,-2.677119 z M 7.5762712,11.260169 c -5e-7,-0.492844 -0.3870084,-0.892372 -0.8644068,-0.892372 H 5.8474576 c -1.1536045,0.0011 -1.1536045,1.785844 0,1.784745 h 0.8644068 c 0.4773987,0 0.8644069,-0.399529 0.8644068,-0.892373 m 0,3.569492 c -5e-7,-0.492844 -0.3870084,-0.892372 -0.8644068,-0.892372 H 5.8474576 c -1.1536045,0.0011 -1.1536045,1.785844 0,1.784745 h 0.8644068 c 0.4773987,0 0.8644069,-0.399529 0.8644068,-0.892373 M 4.9830508,7.690678 c 0,0.4928439 0.3870081,0.8923729 0.8644068,0.8923729 h 0.8644068 c 1.1525419,0 1.1525419,-1.7847458 0,-1.7847458 H 5.8474576 c -0.4773987,0 -0.8644068,0.399529 -0.8644068,0.8923729"></path>
    </svg>
  </SvgIcon>
);

export const OllamaIcon = (props) => (
  <SvgIcon>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      fillRule="evenodd"
      viewBox="0 0 646 854"
    >
      <path d="M140.629.24c-7.969 1.287-17.532 5.456-24.275 10.605-20.413 15.51-36.229 48.428-42.91 89.438-2.514 15.509-4.23 37.026-4.23 53.455 0 19.371 2.268 44.136 5.517 61.239.736 3.801 1.103 7.173.797 7.418-.245.245-3.25 2.697-6.62 5.394-11.525 9.195-24.705 23.356-33.778 36.291-17.41 24.704-28.688 52.78-33.409 83.185-1.839 12.015-2.33 36.29-.858 48.305 3.25 27.708 11.586 51.125 25.87 72.581l4.658 6.927-1.349 2.268c-9.563 16.061-17.716 39.294-21.516 61.607-3.004 17.655-3.372 22.375-3.372 46.037 0 23.847.307 28.567 3.127 45.057 3.371 19.739 10.237 40.642 17.9 54.558 2.513 4.536 8.643 13.976 9.378 14.467.246.122-.49 2.39-1.655 5.026-8.827 19.31-16.367 44.995-19.493 66.635-2.207 14.834-2.514 19.616-2.514 35.248 0 19.922 1.104 29.608 5.272 45.485l.613 2.329h52.535l-1.716-3.249c-10.605-19.616-11.586-56.029-2.452-92.38 4.168-16.797 8.888-29.118 17.716-46.099l5.272-10.298v-6.314c0-5.885-.123-6.559-2.023-10.421-1.472-2.943-3.433-5.456-6.927-8.889-5.947-5.762-10.238-11.831-13.67-19.31-15.08-32.735-18.023-81.346-7.418-122.786 4.414-17.287 11.709-32.673 19.371-41.071 5.21-5.763 7.908-12.199 7.908-18.881 0-6.927-2.452-12.628-7.97-18.574-15.815-16.919-25.562-37.517-29.056-61.485-4.965-34.145 4.046-71.355 24.52-100.84 20.046-28.935 48.183-47.509 79.631-52.474 7.049-1.165 20.229-.981 27.585.368 8.031 1.41 13.057.98 18.207-1.472 6.375-3.003 9.563-6.743 13.302-15.325 3.31-7.662 5.885-11.831 12.812-20.474 8.337-10.36 16.367-17.41 29.24-25.931 14.713-9.624 31.448-16.612 48.122-19.984 6.068-1.226 8.888-1.41 20.229-1.41s14.161.184 20.229 1.41c24.459 4.966 48.735 17.594 68.106 35.493 4.168 3.862 14.16 16.245 17.348 21.395 1.226 2.022 3.372 6.314 4.72 9.501 3.739 8.582 6.927 12.322 13.302 15.325 4.966 2.391 10.176 2.882 17.9 1.594 12.199-2.084 21.578-1.9 33.532.552 40.704 8.214 76.136 41.746 91.829 86.68 13.67 39.416 9.808 80.672-10.544 112.18-3.433 5.334-6.866 9.625-11.831 14.897-10.728 11.463-10.728 25.685-.061 37.455 17.532 19.187 28.505 66.389 25.194 108.012-2.206 27.463-9.256 52.045-18.942 65.96-1.716 2.452-5.271 6.62-7.969 9.195-3.494 3.433-5.455 5.946-6.927 8.889-1.9 3.862-2.023 4.536-2.023 10.421v6.314l5.272 10.298c8.828 16.981 13.548 29.302 17.716 46.099 9.012 35.861 8.215 71.538-2.084 91.829-.858 1.716-1.594 3.31-1.594 3.494 0 .184 11.709.306 26.053.306h25.992l.674-2.636c.368-1.409.981-3.555 1.287-4.781.675-2.697 2.023-10.666 3.127-18.329 1.042-7.724 1.042-36.168 0-44.75-3.923-31.141-10.483-55.845-21.21-79.201-1.165-2.636-1.901-4.904-1.656-5.026.307-.184 2.023-2.636 3.862-5.395 13.364-20.229 21.578-45.669 25.747-79.262 1.103-9.257 1.103-49.041 0-57.93-2.943-22.926-6.498-38.497-12.383-54.251-2.452-6.559-8.95-20.413-11.708-24.888l-1.349-2.268 4.659-6.927c14.283-21.456 22.62-44.873 25.869-72.581 1.471-12.015.981-36.29-.858-48.305-4.782-30.467-16-58.42-33.409-83.185-9.073-12.935-22.253-27.096-33.777-36.291-3.372-2.697-6.376-5.149-6.621-5.394-.306-.245.062-3.617.797-7.418 7.418-38.681 7.172-86.924-.613-124.625-6.743-32.857-19.003-58.971-34.819-74.051C523.209 4.286 510.336-.864 494.888.117c-35.432 2.085-63.998 42.85-75.278 107.093-1.839 10.36-3.432 22.498-3.432 25.808 0 1.287-.246 2.329-.552 2.329-.307 0-2.697-1.226-5.272-2.758-27.34-16.184-57.746-24.827-87.354-24.827-29.608 0-60.014 8.643-87.354 24.827-2.575 1.532-4.965 2.758-5.272 2.758-.306 0-.552-1.042-.552-2.329 0-3.433-1.655-15.938-3.432-25.808-10.238-57.684-33.716-95.875-64.918-105.499C157.181.424 144.982-.434 140.629.24zm10.422 49.899c8.827 6.988 18.635 26.972 24.275 49.347 1.042 4.046 2.145 8.705 2.452 10.421.245 1.656.919 5.395 1.471 8.276 2.391 12.996 3.494 27.034 3.617 44.137l.061 16.858-4.23 6.252-4.229 6.314h-9.87c-11.524 0-22.988 1.472-33.961 4.414-3.923.981-7.724 1.962-8.459 2.146-1.165.245-1.349-.123-2.023-5.15-3.617-27.279-3.433-57.5.552-82.634 4.413-28.014 14.712-53.393 24.765-60.871 2.391-1.778 2.82-1.717 5.579.49zm349.538-.43c6.069 4.476 12.751 16.368 17.716 31.57 9.992 30.406 12.812 72.152 7.54 111.875-.674 5.027-.858 5.395-2.023 5.15-.735-.184-4.536-1.165-8.459-2.146-10.973-2.942-22.437-4.414-33.961-4.414h-9.87l-4.229-6.314-4.23-6.252.061-16.858c.123-23.785 2.33-42.359 7.601-63.018 5.579-22.19 15.448-42.175 24.214-49.163 2.759-2.207 3.188-2.268 5.64-.43z"></path>
      <path d="M313.498 358.237c-13.303 1.288-16.919 1.778-23.295 3.066-10.36 2.145-24.214 6.927-33.838 11.647-33.47 16.367-56.519 43.646-63.569 75.216-1.41 6.253-1.594 8.337-1.594 18.881 0 10.421.184 12.689 1.533 18.635 9.379 41.256 47.385 71.723 96.549 77.301 10.666 1.165 56.765 1.165 67.431 0 39.478-4.475 73.439-25.869 88.703-55.907 4.045-8.03 6.007-13.241 7.846-21.394 1.349-5.946 1.533-8.214 1.533-18.635 0-10.544-.184-12.628-1.594-18.881-10.238-45.853-54.742-81.959-109.3-88.825-7.111-.858-25.746-1.594-30.405-1.104zm22.926 33.348c18.207 1.962 36.536 8.46 51.248 18.268 7.908 5.272 19.065 16.306 23.846 23.54 5.885 8.949 9.256 18.083 10.789 29.179.674 5.088.307 8.95-1.533 17.164-2.881 12.26-11.831 25.072-23.907 34.022-5.64 4.107-17.348 10.054-24.52 12.383-13.609 4.352-22.498 5.149-54.252 4.904-20.719-.184-24.398-.368-30.344-1.471-20.29-3.801-36.351-11.893-47.998-24.214-9.441-9.931-13.732-19.003-16.061-33.654-1.042-6.805.919-18.084 4.904-27.586 4.843-11.586 17.348-25.991 29.731-34.267 14.344-9.563 33.225-16.367 50.573-18.206 6.682-.736 20.842-.736 27.524-.062z"></path>
      <path d="M299.584 436.336c-4.659 2.513-7.908 8.888-6.927 13.608 1.103 5.088 5.578 10.238 12.566 14.468 3.74 2.268 3.985 2.574 4.169 4.842.122 1.349-.368 5.211-1.042 8.644-.736 3.371-1.288 6.927-1.288 7.908.062 2.636 2.514 6.927 5.088 9.011 2.269 1.839 2.698 1.9 9.073 2.084 5.824.184 7.05.061 9.379-1.042 6.008-2.943 7.54-8.337 5.333-18.697-1.839-8.643-1.471-9.992 3.127-12.628 4.842-2.82 9.992-7.785 11.524-11.157 2.943-6.436.245-13.731-6.253-17.103-1.593-.797-3.555-1.164-6.436-1.164-4.475 0-7.356 1.042-12.628 4.413l-3.004 1.901-1.9-1.165c-7.785-4.598-9.195-5.149-13.916-5.088-3.371 0-5.21.306-6.865 1.165zM150.744 365.165c-10.85 3.433-18.942 11.402-23.11 22.743-2.023 5.395-3.004 13.916-2.146 18.513 2.023 10.973 11.034 20.965 21.272 23.724 12.873 3.371 22.497 1.164 31.018-7.295 4.965-4.843 7.663-9.073 10.36-15.939 1.961-4.842 2.084-5.7 2.084-12.566l.061-7.356-2.574-5.272c-4.108-8.337-11.525-14.529-20.107-16.797-4.843-1.226-12.628-1.164-16.858.245zM478.153 364.982c-8.398 2.268-15.877 8.52-19.862 16.735l-2.574 5.272.061 7.356c0 6.866.123 7.724 2.084 12.566 2.698 6.866 5.395 11.096 10.36 15.939 8.521 8.459 18.145 10.666 31.019 7.295 7.417-1.962 14.834-8.215 18.39-15.51 3.065-6.191 3.8-10.666 2.82-17.716-2.268-16.122-11.709-27.83-25.747-31.937-4.107-1.226-12.076-1.226-16.551 0z"></path>
    </svg>
  </SvgIcon>
);
