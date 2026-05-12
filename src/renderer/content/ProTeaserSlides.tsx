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

import AiToolsImage from '-/assets/images/ai-tools.jpg';
import CalendarImage from '-/assets/images/calendar-perspective.avif';
import CustomFolderColor from '-/assets/images/custom-folder-color.jpg';
import EntryDescription from '-/assets/images/entry-description.jpg';
import FolderVizImage from '-/assets/images/folderviz-perspective.jpg';
import GalleryImage from '-/assets/images/gallery-perspective.jpg';
import KanbanImage from '-/assets/images/kanban-perspective.jpg';
import MapImage from '-/assets/images/mapique-perspective.jpg';
import ProTeaserImage from '-/assets/images/pro-teaser.svg';
import RevisionsAutosave from '-/assets/images/revisions-autosave.png';
import EnterpriseImage from '-/assets/images/world-undraw.svg';
import { PerspectiveIDs } from '-/perspectives';
import Links from 'assets/links';

export const slidesNames = [
  'general',
  PerspectiveIDs.KANBAN,
  PerspectiveIDs.FOLDERVIZ,
  PerspectiveIDs.CALENDAR,
  PerspectiveIDs.MAPIQUE,
  PerspectiveIDs.GALLERY,
  'ai',
  'annotation',
  'revisions',
  // 'search',
  'folderColor',
  'enterprise',
];

export function getProTeaserSlides(t) {
  const slidesEN = [];
  slidesEN[slidesNames[0]] = {
    title: t('peri:ptsWhyTitle'),
    description: (
      <>
        <p>{t('peri:ptsWhySection1')}</p>
        <p>{t('peri:ptsWhySection2')}</p>
      </>
    ),
    pictureURL: ProTeaserImage,
    pictureHeight: 150,
  };
  slidesEN[slidesNames[1]] = {
    title: t('peri:ptsKanbanTitle'),
    description: t('peri:ptsKanban'),
    ctaURL: Links.documentationLinks.kanbanPerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: KanbanImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[2]] = {
    title: t('peri:ptsFolderVizTitle'),
    description: (
      <>
        <p>{t('peri:ptsFolderViz')}</p>
        <ul style={{ marginTop: -10 }}>
          <li>{t('peri:ptsFolderVizTagGraph')}</li>
          <li>{t('peri:ptsFolderVizLinksGraph')}</li>
          <li>{t('peri:ptsFolderVizFolderTree')}</li>
          <li>{t('peri:ptsFolderVizCircularFolderTree')}</li>
          <li>{t('peri:ptsFolderVizTreeMap')}</li>
        </ul>
      </>
    ),
    ctaURL: Links.documentationLinks.foldervizPerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: FolderVizImage,
    pictureShadow: true,
    pictureHeight: 350,
  };
  slidesEN[slidesNames[3]] = {
    title: t('peri:ptsCalendarTitle'),
    description: (
      <>
        <ul style={{ marginTop: 0 }}>
          <li>{t('peri:ptsCalendarSection1')}</li>
          <li>{t('peri:ptsCalendarSection2')}</li>
          <li>{t('peri:ptsCalendarSection3')}</li>
          <li>{t('peri:ptsCalendarSection4')}</li>
        </ul>
      </>
    ),
    ctaURL: Links.documentationLinks.calendarPerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: CalendarImage,
    pictureShadow: true,
    pictureHeight: 350,
  };
  slidesEN[slidesNames[4]] = {
    title: t('peri:ptsMapiqueTitle'),
    description: (
      <>
        <p>{t('peri:ptsMapiqueSection1')}</p>
        <p>{t('peri:ptsMapiqueSection2')}</p>
      </>
    ),
    ctaURL: Links.documentationLinks.mapiquePerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: MapImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[5]] = {
    title: t('peri:ptsGalleryTitle'),
    description: t('peri:ptsGallery'),
    ctaURL: Links.documentationLinks.galleryPerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: GalleryImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[6]] = {
    title: t('peri:ptsAITitle'),
    description: (
      <>
        <p>{t('peri:ptsAI')}</p>
        <ul style={{ marginTop: -10 }}>
          <li>{t('peri:ptsAISection1')}</li>
          <li>{t('peri:ptsAISection2')}</li>
          <li>{t('peri:ptsAISection3')}</li>
          <li>{t('peri:ptsAISection4')}</li>
        </ul>
        <small>{t('peri:ptsAINote')}</small>
      </>
    ),
    ctaURL: Links.links.emailContact,
    ctaTitle: t('contactUs'),
    pictureURL: AiToolsImage,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[7]] = {
    title: t('peri:ptsAnnotateLinkTitle'),
    description: t('peri:ptsAnnotateLink'),
    items: [
      <>{t('peri:ptsAnnotateLinkSection1')}</>,
      <>{t('peri:ptsAnnotateLinkSection2')}</>,
      <>{t('peri:ptsAnnotateLinkSection3')}</>,
      <>{t('peri:ptsAnnotateLinkSection4')}</>,
      <>{t('peri:ptsAnnotateLinkSection5')}</>,
    ],
    ctaURL: Links.links.productProFileFolderMeta,
    ctaTitle: t('showMeMore'),
    pictureURL: EntryDescription,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[8]] = {
    title: t('peri:ptsRevisionsTitle'),
    description: (
      <>
        <p>{t('peri:ptsRevisionsTitleSection1')}</p>
        <p>{t('peri:ptsRevisionsTitleSection2')}</p>
      </>
    ),
    ctaURL: Links.documentationLinks.revisions,
    ctaTitle: t('showMeMore'),
    pictureURL: RevisionsAutosave,
    pictureShadow: true,
    pictureHeight: 400,
  };
  slidesEN[slidesNames[9]] = {
    title: t('peri:ptsCustomBackgroundTitle'),
    description: t('peri:ptsCustomBackground'),
    ctaURL: Links.links.productProFolderColor,
    ctaTitle: t('showMeMore'),
    pictureURL: CustomFolderColor,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[10]] = {
    title: 'TagSpaces Pro Web',
    description: t('peri:ptsProWeb'),
    items: [
      <>{t('peri:ptsProWebSection1')}</>,
      <>{t('peri:ptsProWebSection2')}</>,
      <>{t('peri:ptsProWebSection3')}</>,
      <>{t('peri:ptsProWebSection4')}</>,
      <>{t('peri:ptsProWebSection5')}</>,
      <>{t('peri:ptsProWebSection6')}</>,
    ],
    ctaURL: Links.links.emailContact,
    ctaTitle: t('contactUs'),
    pictureURL: EnterpriseImage,
    pictureHeight: 200,
  };
  return slidesEN;
}
