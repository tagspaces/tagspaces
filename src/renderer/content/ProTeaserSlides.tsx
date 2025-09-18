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
    title: 'FolderViz Perspective in TagSpaces Pro',
    description: (
      <>
        <p>
          FolderViz displays the contents of the current folder or search
          results as a graphical tree. It currently supports the following
          views:
        </p>
        <ul style={{ marginTop: -10 }}>
          <li>
            <b>Tag Graph</b> – Shows all used tags with the tagged entries in a
            given location.
          </li>
          <li>
            <b>Links Graph</b> – Shows links between files and folder and their
            links to external website.
          </li>
          <li>
            <b>Folder Tree</b> – Visualizes the location of files from the
            search results.
          </li>
          <li>
            <b>Circular Folder Tree</b> – Helps you identify folders with a
            large number of files.
          </li>
          <li>
            <b>Treemap</b> – Assists in identifying large files.
          </li>
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
    title: 'Mapique Perspective in TagSpaces Pro',
    description: (
      <>
        <p>
          The Mapique Perspective displays files and folders tagged with
          geo-tags on a digital map. It can also automatically extract
          geo-coordinates from EXIF/IPTC data stored in JPEG files.
        </p>
        <p>
          Users can tag files and folders with geolocation data (geo-tagging).
          This feature is especially useful for trip planning or for adding
          private annotations to maps.
        </p>
      </>
    ),
    ctaURL: Links.documentationLinks.mapiquePerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: MapImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[4]] = {
    title: 'Gallery Perspectives in TagSpaces Pro',
    description: (
      <>
        This perspective is optimized for displaying folders that contain photos
        and other images. It includes a presentation mode, allowing you to click
        the play button and view the images in sequence. The presentation can
        also be started in full-screen mode for an immersive, distraction-free
        viewing experience.
      </>
    ),
    ctaURL: Links.documentationLinks.galleryPerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: GalleryImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[5]] = {
    title: 'Automate tasks with local AI models',
    description: (
      <>
        <p>
          TagSpaces Pro can connect to Ollama as an external local AI service.
          This will allow you to use features like:
        </p>
        <ul style={{ marginTop: -10 }}>
          <li>
            <b>Content summarization</b> – for text, markdown, html and pdf
            files.
          </li>
          <li>
            <b>Generating image describing</b> – for JPG, PNG and GIF files.
          </li>
          <li>
            <b>Extraction of tags</b> – for text, markdown, html, pdf and
            various image formats.
          </li>
          <li>
            <b>Batch processing</b> – apply the above for many files at once.
          </li>
        </ul>
        <small>
          <b>Note: </b>TagSpaces does not have a build-in AI functionality, it
          relays entirely on the external LLM models.
        </small>
      </>
    ),
    ctaURL: Links.links.emailContact,
    ctaTitle: t('contactUs'),
    pictureURL: AiToolsImage,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[6]] = {
    title: 'Annotate and link your files and folders',
    description: (
      <>
        In the PRO version, you can add a text description to any type of file
        or folder.
      </>
    ),
    items: [
      <>
        The description text supports <b>Markdown</b> formatting.
      </>,
      <>
        This enables basic text styling, such as <b>bold</b> or <i>italic</i>.
      </>,
      <>
        You can easily create plain or numbered (<b>to-do</b>) lists.
      </>,
      <>
        <b>Create links</b> to other documents, folders, locations, or web
        pages.
      </>,
      <>
        You can also set a <b>custom thumbnail</b> for each file or folder,
        allowing you to visually highlight its content.
      </>,
    ],
    ctaURL: Links.links.productProFileFolderMeta,
    ctaTitle: t('showMeMore'),
    pictureURL: EntryDescription,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[7]] = {
    title: 'File revisions and auto-save for text files',
    description: (
      <>
        <p>
          A key feature of document management systems is the ability to create{' '}
          <b>revisions</b> of edited files. Once enabled, a full copy of the
          current file (e.g., TXT, MD, HTML, or JSON) is created with each save,
          allowing you to track changes over time.
        </p>
        <p>
          The <b>auto-save</b> feature can be activated individually for each
          editable file. When enabled, the application will automatically save
          any changes you make, ensuring that your progress is never lost.
        </p>
      </>
    ),
    ctaURL: Links.documentationLinks.revisions,
    ctaTitle: t('showMeMore'),
    pictureURL: RevisionsAutosave,
    pictureShadow: true,
    pictureHeight: 400,
  };
  // slidesEN[slidesNames['search]] = {
  //   title: 'Extended Search',
  //   description: (
  //     <>
  //       The search functionality is significantly enhanced in the PRO version.
  //     </>
  //   ),
  //   items: [
  //     <>
  //       <b>Stored search queries</b> – save frequently used or complex queries
  //       for future use.
  //     </>,
  //     <>
  //       <b>Full-text search</b> across text, markdown, and HTML files.
  //     </>,
  //     <>
  //       <b>Global search</b> – search across all local locations in one step.
  //     </>,
  //     <>
  //       <b>Filter by file type</b> – documents, notes, audio or video files,
  //       archives, bookmarks, ebooks, and more.
  //     </>,
  //     <>Filter by files, folders, or untagged files.</>,
  //     <>Filter by size and date.</>,
  //   ],
  //   ctaURL: Links.links.productProAdvancedSearch,
  //   ctaTitle: t('showMeMore'),
  //   pictureURL: SearchImage,
  //   pictureHeight: 150,
  // };
  slidesEN[slidesNames[8]] = {
    title: 'Folders with custom backgrounds',
    description: (
      <>
        <p>
          In the PRO version, you can assign a background color to any folder,
          which is visible even when viewing its parent folder. Once the folder
          is opened, the entire background area adopts the chosen color. This
          feature is especially useful for distinguishing common sub-folder
          structures. For example, an 'Archive' folder could be highlighted in
          yellow, making it easy to spot.
        </p>
      </>
    ),
    ctaURL: Links.links.productProFolderColor,
    ctaTitle: t('showMeMore'),
    pictureURL: CustomFolderColor,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[9]] = {
    title: 'TagSpaces Pro Web',
    description: (
      <>
        TagSpaces is also available as a web application that runs in your web
        browser on your IT infrastructure.
      </>
    ),
    items: [
      <>
        <b>On-prem web</b> version of TagSpaces Pro for <b>self-hosting</b>.
      </>,
      <>
        <b>PWA</b> mode optimized for <b>mobile devices</b>.
      </>,
      <>
        <b>White label</b> packages featuring custom colors and logos.
      </>,
      <>
        Easily deployable using <b>Docker</b> containers.
      </>,
      <>Premium technical support.</>,
      <>
        We offer development of custom <b>file viewers</b> and{' '}
        <b>perspectives</b>, as well as tailored installations on the{' '}
        <b>AWS cloud stack</b>, complete with user management and <b>MFA/2FA</b>
        .
      </>,
    ],
    ctaURL: Links.links.emailContact,
    ctaTitle: t('contactUs'),
    pictureURL: EnterpriseImage,
    pictureHeight: 200,
  };
  return slidesEN;
}
