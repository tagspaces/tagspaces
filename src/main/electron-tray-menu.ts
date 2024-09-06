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

import { app, Menu, nativeImage, Tray } from 'electron';

let tray;

const icon1x =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAABFdJREFUOI2N02tM1XUYB/Dv8/v9/4dzwCMplabOWNpmZqLLvCaXIQIKooydmJesF/Yml2vzTZsrXa+cZW65pmaAt1COdls0y9Yh3SQNSIxA9Jy4iMgB5CJyOHB+v9/TC8GhGev78tmzz/bs2ZcwRphZEpFm5lmVVTWlzTdb42zbihjDAIhHtrQ2yul0xC1cMHef9T+waZd/v/r94YJTz92912+ISIzsEAAiQGmtnoiNteKnTx3/WJCZxTAWd+VKXWnh0dMzBgYGlTPKIW3bZmMMhBAgAIaZtVbscjpgWRb+BQ5jhplj6ur83xUc9c7t6+tXRLA2b8zFKwteAgCEQmG4XE78eO4Cn/KWUuz48TAAxCMYEREzs+UPNJ0+XORd2tXVq4wx1sYN65CSvBhKadReCyBmXDTc7hi43THCsLl//2iQmWnXrl0EgBubb534otCb0dbWobTWVr4nC+krXgUA7D9wHO/t2IMTxd8CALTSD11ojWBer1fs3LlTt7YGDx34vNjT1Hwrwsx2Tk4a1mSl4lL7HTQORTA7fhquxk3ApElP3X+MoAeYGAHLysqkx+NRHXe69hw8VLzlhr9RMbOdvjIR+XmrEQwN4N2KagQjCtvmvYiijCQ43eMAAAMDYQgSYGYoo1j4fD4rJSVF9fb27SgsOrO95q/ripmt5MRFeGNTLtgYTHS5kDFjFmwA++sD+LglCCElKqtqUHq2DA6HbYQQiHW7NQFAOBzeevDwyU8vllcpZsgli+fTtq2bATBAAhjoBDX+jANRSdj3Zy0GLUL2UAT803l0hgZ0jCtKbt6wzr98+cJU2dfX/1bBkdOfXSyvMg6HLRYvnEdb334dRASAQEQY/OZNDP76IZZOiMYzCdnw11yHPHceEaW0I8ohN61f25CUuCiNiJqsnp67Hn+gCUIIzQx7fKwbUggYY4ZRwBmfgFDTL8Dl3Uho6cHMyikYMlrDsuWG/Ozm5KRFaUTUwMxS7t370amZM6cnNDTcfKGruyfiDzTJtmAHFrw8F0IQjGbUt8zBpPinca05iN2XpiA8pLSQQq5/bU1LWuqyFUTkH6kqASBmpubmW0cKj3618Vp9IALAnp8wG9u3b8EfJdWo+rIaExOnwtdajp6ufi1Jy3xP1u3M9KRUIqpjZouIFABIZhZer5eWLVty5mTxsbi2YOeStmCHagt2UP2Nv2nOs8/jdns7zjVeQHhoSBO09OStbl+dmZxGRLWjMQCwhntLJSUlcvLkJ9+5093bfez41++X/1alamsDMqIU3XOFYPqh2RiZl5vZmbUqZSUR1TyKPWjKcH+Nz+ez4ibEfhAKhXqczqi9vrJy3RhoESBio1nmrk3vyslekUFE1Y/DHoCjUF1RUWFHR0d/opTqdjmjCn44W2aElDI3J70nd+3KTCKq/C/sIXAEBRCpqGDbsqiImbukFGcYuJeXm76KiC6PhY0ZZrYAQCmVGQ5H0kbPxso/qONEyQ6APi8AAAAASUVORK5CYII=';
const icon1xMac =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAJcAAACXAETPAk3AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAgJJREFUOI2Vkrtrk2EUxn/nTdqkRO1XSGtbBIuKlHpBcfJSKNYiiJNOooP/gKCTf4OI4GVzcHDoqIsXxMnLIBQXQSIUFI3NBZt+iaXJlzZ5H4e20cbW4gPvdM7vvM+5GJsoN1sftnjzwLpB2ZT9C86X6iM4/wpIb5ByOb4RXCxHu7z8SyCNkZGYWY2ZsR/RD7BugcL8fJ9v6DkwiPEutpicWFigMTTEkpk1c+XapMEFANcOfwnDgEbHC2Av6MMi9TNmWDKIssUwetaev8ZBoaCUJ3oqdEgwHV/yp5OdySNL8fo+g4w3fWov0HKQzapLieiJwTHgq7zGe3tTPzy6Z+i2jLcDQdfVUknbTBxszQNAUkehXHsEdhYoxpyN9nUnpwFyc7VRc9xHDJu5SeSHtPxJVjAak+TyleihYefBQic3vr0nmVmBL5rxWDG7YRDgdQJjD5CLOTvZH3R9dt8qlW4nG1k2pEig3w36DMasNXQLkcbYChTVdOOrDt3OIAg7lRgD3gADWPP1zFz1uCTn5K7JcxfTPLAbmDW5icF0ojXM1iVOS4kt5fok6BxQNbiCcVOiBzBDZW86NRik3v+5hTWnLKmjWI4eCC4Bi2AfQYeBCs5PDHSnptrX+JckWS6s3smHNa28n8VS9eimYLvy5er1fFhbyIe1sf+GV/W9VN2xWc4vimTtCS8tVrsAAAAASUVORK5CYII=';
const icon2xBlack =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAACXBIWXMAAACjAAAAowHwx5rOAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAA7BJREFUWIW12FuIV1UUx/HPmZku5jzYxBh0pRJTUbIaqOyCgSlSCE0EhlDQHaZ86GLQ00BBLwWBEVEUVE9BF6XHLk+RQXShyLBCopK0MC2nHG2a3cM55unM2ft//vM/c2Ax8P/v9VvfWXvttdf5CyFo29CP1xFaszmAzPBSq5BzBPps65Btg+KJOYFsExRb5gySkBVBenqyLLsbz8nrs+75Gn81lFuKU2Z82kImRzElno2X0deF3ie1Oj1CrsVkAvItDNR0hUW4HPPnHBSrMJGAfAcnVXyW47PSmkk8PGegWIkDCcgdGKz4LMCPlXXTxd87WwfFYuxNQH6BU2v87omsn8auTqB9uniyLDu72NLTI0u+w9oQwoGa75bEZLEoy7KBVOzGoFmWLSwgz4ks+QnXhRD2lnxOKH3/TcQvYHcIYSoJ0HC7F/j/IajaL1ha8enHG/J7fwBD+NnMbQ8Y67lG5c33gwTkQVxS47e1tGYb5uFS7Cx9fhTjyHoCxcl4LwH5J66s8RuvWbsDpxXZvQhrMNRzHy0EtyUgj2Bdjd9lCZ8vcWYi5hVivTni0IdXEwGncHMi4P34J+K7BytqfEaKMqqPGQm0NQE5jTsa1PYoDkc0fsNVlQtkfyLm7roAjyccAh5q2Cn6cG0iS4dxEy6UvkB+wHlV8c0dIMcbQm7BdnnHWCHvsbESim93/g8sCSEoi9/meF+rs2caQm4s1edHGMb58oafSkLV9mHZf7qlekrNlK9oMFNitZlj37e4QN6aPmwI+SuWV7Stl7eamNObKjNlBHJIfKLaI++d8/F+B8j9WFmjb3sHx3dVRrYE7I3iJ/0QbikyHIt1ECMRbSfitQ6wH2O4IezqRGZTZ2ACV0d1C/F+PN8B9iuc1QB0WPqkxyCvSeqWAmTq7+iyfY/FCcgxeTNfhTPweQPISazvmICaYJs7bNE+XFzjt8nxtjSBdfLZ9Y+E1hFc36ikIpm5FX8nAhzCmtL6G+QjWxViZ0LjKDY0gYyCFsE3iJ/gY1s2Kr8qm2xx2aawsSlkErR0gn/vEPB2LMSnXUBu6gayI2gBOyJ/1YgFnsaDGJQeso+tvatbyEagBewyM9/Jq/aY9OUxa8jGoAXsudjVZS2WIcdmC9kVaAHbTS2W7YFeILsGLWAH5e/3TSEf7RVyVqAF7Dy83QByvA3IWYMWsP14MQH5VFuQPYEWsBmerIF8uk3InkFLwI+UIF9Q+uWjLWvlN3zIsuw++Xh3b2hLtPT8C4ZroHYM10GpAAAAAElFTkSuQmCC';
const icon2xWhite =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAACXBIWXMAAACjAAAAowHwx5rOAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAA+FJREFUWIW1mV2IVVUUx/93ZjLTCDM0sDIqKY2G7AMq+0ChlCh8GAkCwUj7xPKhD4ueBgp6KRA0iKSggsAHw/BxqCfJIEoxMjKRKCU11KwpR7vdXw9rTnPuae919pm75w+HuXPOXmv/zt5rr732vS1AU6B+SdskrcrlsC+Xo5JakrYqI6Q0NaBvSXo0t9PcoK9LejqzT0l5QTdKejmjvy61Mi2mJyS9LYvPkL6T9Feir0WSZvzvLtDrNQS0iet9oK+Bv69CTnqd+uWSPpKlo5B2SFonqVO615K0QNLtkmYm99TDSC4BRp2RHAHOr9jcAOwptRkDXkwZ0clCLgZOOZC7gQsrNrOAnyvtOuN/H5sK0GuBow7kPuDigN2TkfYd4Ps60KYxeoWkEUmXRp4flMXtqcCzhRGbImYHvI6bgM6VQc6PPD8s6T5JR0v3zit9PhCxQ9IhSW2398TpnkX3IqjqOLCoYtMPbAfeAwaA2cAvgWkHWF839SmQM4BdDuRvwM0Bu82lNjuAC4BbgP2l++eAYaDVK+h04FMH8k/gzoDdcKDtbuASbHRvBO7FRjkp4XuQA+MjEdNZYEXA7jbH5hvgMqfPO4jk5phBH/Ch02EbeMixfxb4J2J7BBgM2NyKhVFQsY42xwywBbDOsS2uIeBMxMdJ4K5S28XACafPQ6EOXnMMAF5IgCxmZRnxUToDrAKuw99AfgKuqjrfUAM5nAi5EfgEyxiDwOGIv7bzIoy/wEKgK48+wkReC2lLIuTDTMTnF8Ac4GrggOM7pGPA9YXfcjx5NeUHpNWUS7GKqKwfgGuw1PR5IuSvWKX1n28B92OpJqaPsVRVBzmbeEV1BMudM4HPaiBPYIury3+fpKckTXN22YskTXf3YdNJSWsljQWezZO0S9JKWWET02lJKyTtDe3104BtNW/5JRZrKTG61BlZbw2MAnfH/BYf+oF3amC/BS5PAJ2Dv9JjkPd4fsv/tAjv0WX9iBXOMYfrsWS+BJgH7E2AHMPWiTsAoZsb8KfoGHBTwG41E2lpFKsD5gO/O77OAg/UQcZABawB/nY6+AOrfor2D2IlWxViP3GdA1amQHqgGncS26vBpmwIy68pU1xWG9sYkiDrQIsVfLqmw7XAXODrBpCrm0CmgAorv447HXeA57HjsVdkF20fbwqZCipsz62eyat6FStEskM2ARVwJXb+now6dB/gphRUNIvFsp7rBXIyoMJicaQB5Cu9Qk4WVNjRd2cC5HAOyF5AhdUH7zqQb+aC7BVUWH3wRgByU07IHKDF9VIJcivd33xkuXJ9hy9Jz0galBXi2X9l+xc7opIKau8a2gAAAABJRU5ErkJggg==';

export default function buildTrayMenu(
  mainPageProps: any,
  i18n,
  isMacLike,
  globalShortcutsEnabled,
) {
  // const cKey = isMacLike ? '  -  ⌘' : '  -  Ctrl';
  // const sKey = isMacLike ? '⇧' : 'Shift';
  // const pKey = isMacLike ? ' ' : ' + ';

  function openNextFile() {
    mainPageProps.openNextFile();
  }

  function openPrevFile() {
    mainPageProps.openPrevFile();
  }

  function playResumePlayback() {
    mainPageProps.resumePlayback();
  }

  function quitApp() {
    app.quit();
  }

  const trayMenuTemplate = [
    {
      label: i18n.t('newWindow'),
      click: () => mainPageProps.createNewWindowInstance(),
    },
    {
      type: 'separator',
    },
    {
      label: i18n.t('showTagSpaces'),
      accelerator: globalShortcutsEnabled ? 'CmdOrCtrl+Shift+w' : undefined,
      click: mainPageProps.showTagSpaces,
    },
    {
      label: i18n.t('showSearch'),
      accelerator: globalShortcutsEnabled ? 'CmdOrCtrl+Shift+f' : undefined,
      click: mainPageProps.openSearch,
    },
    {
      type: 'separator',
    },
    {
      label: i18n.t('newFileNote'),
      accelerator: globalShortcutsEnabled ? 'CmdOrCtrl+Shift+n' : undefined,
      click: mainPageProps.toggleNewFileDialog,
    },
    {
      type: 'separator',
    },
    {
      label: i18n.t('openNextFileTooltip'),
      accelerator: globalShortcutsEnabled ? 'CmdOrCtrl+Shift+d' : undefined,
      click: openNextFile,
    },
    {
      label: i18n.t('openPrevFileTooltip'),
      accelerator: globalShortcutsEnabled ? 'CmdOrCtrl+Shift+a' : undefined,
      click: openPrevFile,
    },
    {
      type: 'separator',
    },
    {
      label: i18n.t('pauseResumePlayback'),
      accelerator: globalShortcutsEnabled ? 'CmdOrCtrl+Shift+p' : undefined,
      click: playResumePlayback,
    },
    {
      type: 'separator',
    },
    {
      label: i18n.t('quitTagSpaces'),
      accelerator: 'CmdOrCtrl+q',
      click: quitApp,
    },
  ];

  if (!tray) {
    let icon;
    if (isMacLike) {
      icon = nativeImage.createFromDataURL(icon1xMac);
      icon.addRepresentation({
        scaleFactor: 2.0,
        dataURL: icon2xBlack,
      });
      icon.setTemplateImage(true);
    } else {
      icon = nativeImage.createFromDataURL(icon1x);
    }
    tray = new Tray(icon);
  }

  // @ts-ignore
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray?.setToolTip('TagSpaces');
  tray?.setContextMenu(contextMenu);
}
