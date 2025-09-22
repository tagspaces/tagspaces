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
    title: t('ptsWhyTitle'),
    description: (
      <>
        <p>{t('ptsWhySection1')}</p>
        <p>{t('ptsWhySection2')}</p>
      </>
    ),
    pictureURL: ProTeaserImage,
    pictureHeight: 150,
  };
  slidesEN[slidesNames[1]] = {
    title: t('ptsKanbanTitle'),
    description: t('ptsKanban'),
    ctaURL: Links.documentationLinks.kanbanPerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: KanbanImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[2]] = {
    title: t('core:ptsFolderVizTitle'),
    description: (
      <>
        <p>{t('core:ptsFolderViz')}</p>
        <ul style={{ marginTop: -10 }}>
          <li>{t('core:ptsFolderVizTagGraph')}</li>
          <li>{t('core:ptsFolderVizLinksGraph')}</li>
          <li>{t('core:ptsFolderVizFolderTree')}</li>
          <li>{t('core:ptsFolderVizCircularFolderTree')}</li>
          <li>{t('core:ptsFolderVizTreeMap')}</li>
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
    title: t('core:ptsMapiqueTitle'),
    description: (
      <>
        <p>{t('core:ptsMapiqueSection1')}</p>
        <p>{t('core:ptsMapiqueSection2')}</p>
      </>
    ),
    ctaURL: Links.documentationLinks.mapiquePerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: MapImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[4]] = {
    title: t('core:ptsGalleryTitle'),
    description: t('core:ptsGallery'),
    ctaURL: Links.documentationLinks.galleryPerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: GalleryImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[5]] = {
    title: t('core:ptsAITitle'),
    description: (
      <>
        <p>{t('core:ptsAI')}</p>
        <ul style={{ marginTop: -10 }}>
          <li>{t('core:ptsAISection1')}</li>
          <li>{t('core:ptsAISection2')}</li>
          <li>{t('core:ptsAISection3')}</li>
          <li>{t('core:ptsAISection4')}</li>
        </ul>
        <small>{t('core:ptsAINote')}</small>
      </>
    ),
    ctaURL: Links.links.emailContact,
    ctaTitle: t('contactUs'),
    pictureURL: AiToolsImage,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[6]] = {
    title: t('core:ptsAnnotateLinkTitle'),
    description: t('core:ptsAnnotateLink'),
    items: [
      <>{t('core:ptsAnnotateLinkSection1')}</>,
      <>{t('core:ptsAnnotateLinkSection2')}</>,
      <>{t('core:ptsAnnotateLinkSection3')}</>,
      <>{t('core:ptsAnnotateLinkSection4')}</>,
      <>{t('core:ptsAnnotateLinkSection5')}</>,
    ],
    ctaURL: Links.links.productProFileFolderMeta,
    ctaTitle: t('showMeMore'),
    pictureURL: EntryDescription,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[7]] = {
    title: t('core:ptsRevisionsTitle'),
    description: (
      <>
        <p>{t('core:ptsRevisionsTitleSection1')}</p>
        <p>{t('core:ptsRevisionsTitleSection2')}</p>
      </>
    ),
    ctaURL: Links.documentationLinks.revisions,
    ctaTitle: t('showMeMore'),
    pictureURL: RevisionsAutosave,
    pictureShadow: true,
    pictureHeight: 400,
  };
  slidesEN[slidesNames[8]] = {
    title: t('core:ptsCustomBackgroundTitle'),
    description: t('core:ptsCustomBackground'),
    ctaURL: Links.links.productProFolderColor,
    ctaTitle: t('showMeMore'),
    pictureURL: CustomFolderColor,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[9]] = {
    title: 'TagSpaces Pro Web',
    description: t('core:ptsProWeb'),
    items: [
      <>{t('core:ptsProWebSection1')}</>,
      <>{t('core:ptsProWebSection2')}</>,
      <>{t('core:ptsProWebSection3')}</>,
      <>{t('core:ptsProWebSection4')}</>,
      <>{t('core:ptsProWebSection5')}</>,
      <>{t('core:ptsProWebSection6')}</>,
    ],
    ctaURL: Links.links.emailContact,
    ctaTitle: t('contactUs'),
    pictureURL: EnterpriseImage,
    pictureHeight: 200,
  };
  return slidesEN;
}
