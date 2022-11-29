import Links from '-/links';
import ProTeaserImage from '-/assets/images/pro-teaser.svg';
import i18n from '-/services/i18n';
import KanbanImage from '-/assets/images/kanban-perspective.jpg';
import GalleryImage from '-/assets/images/gallery-perspective.jpg';
import MapImage from '-/assets/images/mapique-perspective.jpg';
import EntryDescription from '-/assets/images/entry-description.jpg';
import SearchImage from '-/assets/images/search-undraw.svg';
import CustomFolderColor from '-/assets/images/custom-folder-color.jpg';
import EnterpriseImage from '-/assets/images/world-undraw.svg';
import React from 'react';

export function getProTeaserSlideIndex(slideName: string): number {
  if (!slideName) {
    return -1;
  }
  return Object.keys(getProTeaserSlides()).findIndex(key => key === slideName);
}

export function getProTeaserSlides() {
  const slidesEN = [];
  slidesEN['general'] = {
    title: 'Why TagSpaces Pro ?',
    description: (
      <>
        The TagSpaces project is entirely <b>subscriber-supported</b>. We do not
        make money through advertising or any form of data sharing, so buying a
        Pro subscription will support the further development of our core
        product TagSpaces Lite and our browser extensions, which are all freely
        available.
        <br />
        <br />
        On top of that you will get <b>a lot of useful features</b>, extended
        search functionalities, alternative perspectives for your files, geo
        tagging functionality. Some of these features are briefly presented on
        the next slides.
      </>
    ),
    ctaURL: Links.links.productsOverview,
    ctaTitle: 'Compare TagSpaces Lite vs. Pro',
    pictureURL: ProTeaserImage,
    pictureHeight: 150
  };
  slidesEN['kanban'] = {
    title: 'Kanban Perspectives',
    description: (
      <>
        This perspective can turn every folder into a Kanban board, where
        columns represents the sub folders of the current folder. Every file
        from the sub folders is shown as a tile and can be moved with drag and
        drop between the columns. The columns itself can be moved with drag and
        drop too. There is a built-in <b>Trello import</b>, where a Trello JSON
        export can be imported in the current folder.
      </>
    ),
    ctaURL: Links.documentationLinks.kanbanPerspective,
    ctaTitle: i18n.t('showMeMore'),
    pictureURL: KanbanImage,
    pictureShadow: true,
    pictureHeight: 300
  };
  slidesEN['gallery'] = {
    title: 'Gallery Perspectives',
    description: (
      <>
        This perspective is optimized for displaying folders with photos and
        other images. It has an integrated <b>presentation mode</b>, so by just
        clicking the play button, the images start to change automatically one
        after another. With the expand button you can start the presentation in{' '}
        <b>full screen</b>, so you can enjoy your photos in a distraction-free
        way.
      </>
    ),
    ctaURL: Links.documentationLinks.galleryPerspective,
    ctaTitle: i18n.t('showMeMore'),
    pictureURL: GalleryImage,
    pictureShadow: true,
    pictureHeight: 300
  };
  slidesEN['mapique'] = {
    title: 'Digital Map & Geo tagging',
    description: (
      <>
        The Mapique perspective displays files and folders tagged with geo-tags
        on a digital map. The perspective integrates an ability to{' '}
        <b>extract geo coordinates</b> from EXIF/IPTC data embedded in JPEG
        files. By default TagSpaces uses OpenStreetMap for the map, but other
        compatible map tile servers can be used instead.
        <br />
        In the PRO version, you can add tags containing geolocation data to any
        file or folder. This can be useful for example for planing and
        documenting trips or just to <b>privately annotate maps</b>.
      </>
    ),
    ctaURL: Links.documentationLinks.mapiquePerspective,
    ctaTitle: i18n.t('showMeMore'),
    pictureURL: MapImage,
    pictureShadow: true,
    pictureHeight: 300
  };
  slidesEN['annotation'] = {
    title: 'Annotate and link your files and folders',
    description: (
      <>
        In TagSpaces Pro you can add text description to every kind of file or
        folder.
      </>
    ),
    items: [
      <>
        The description text can be in <b>Markdown</b> format.
      </>,
      <>
        This will allow so you have basic text formatting such as <b>bold</b> or{' '}
        <i>italic</i>.
      </>,
      <>
        You can easily create plain or numbered (<b>to-do</b>) lists.
      </>,
      <>
        <b>Create links</b> to other documents, folder, locations or web pages
      </>,
      <>
        You can also set a <b>custom thumbnail</b> for every file or folder,
        allowing you to emphasize visually its content.
      </>
    ],
    ctaURL: Links.links.productProFileFolderMeta,
    ctaTitle: i18n.t('showMeMore'),
    pictureURL: EntryDescription,
    pictureShadow: true,
    pictureHeight: 300
  };
  slidesEN['search'] = {
    title: 'Extended Search',
    description: (
      <>
        The search is essential part of TagSpaces, which is significantly
        extended in the PRO version.
      </>
    ),
    items: [
      <>
        <b>Stored search queries</b> – save common or complex queries for later
        use
      </>,
      <>
        <b>Full text search</b> on TXT, Markdown and HTML files
      </>,
      <>
        <b>Global search</b> – searching all local locations at once
      </>,
      <>
        <b>Filter by file type</b> – documents, notes, audio or video files,
        archives, bookmarks, ebooks, ...
      </>,
      <>Filter for files, folders or untagged files</>,
      <>Filter by size and date</>
    ],
    ctaURL: Links.links.productProAdvancedSearch,
    ctaTitle: i18n.t('showMeMore'),
    pictureURL: SearchImage,
    pictureHeight: 150
  };
  slidesEN['folderColor'] = {
    title: 'Folders with custom backgrounds',
    description: (
      <>
        In the Pro version you can set a background color to any folder. The
        color is visible also in the parent folder. Once it is opened the whole
        background area is having the specified folder color. This can be useful
        if you have common sub-folders structure, where for example the
        sub-folder <i>Archive</i> can marked <i>yellow</i> for easy recognition.
      </>
    ),
    ctaURL: Links.links.productProFolderColor,
    ctaTitle: i18n.t('showMeMore'),
    pictureURL: CustomFolderColor,
    pictureShadow: true,
    pictureHeight: 300
  };
  slidesEN['enterprise'] = {
    title: 'TagSpaces Web Pro & Enterprise',
    description: (
      <>
        TagSpaces is offered also as a web application running in your web
        browser.
      </>
    ),
    items: [
      <>
        <b>On-prem web</b> version of TagSpaces Pro for <b>self-hosting</b>
      </>,
      <>
        <b>PWA</b> mode optimized for use on <b>mobile devices</b>
      </>,
      <>
        <b>White label</b> packages, with custom colors and logo
      </>,
      <>
        Easy deployable on the AWS cloud stack, providing user management and
        MFA/2FA by utilizing Cognito.
      </>,
      <>
        Development of custom <b>file viewers</b> or <b>perspectives</b>
      </>,
      <>Premium technical support</>
    ],
    ctaURL: Links.links.emailContact,
    ctaTitle: i18n.t('contactUs'),
    pictureURL: EnterpriseImage,
    pictureHeight: 200
  };
  return slidesEN;
  // slidesEN['objectstorage'] = {
  //   title: 'Connect AWS S3 or MinIO object storage',
  //   items: [
  //     <>
  //       TagSpaces Pro supports connecting{' '}
  //       <b>Amazon S3 compliant storage providers</b> as locations. Such storage is
  //       offered by Amazon AWS, Wasabi and many others. You can also host an object
  //       storage <b>privately</b> (e.g. on your NAS) with the help of open source
  //       projects like MinIO.
  //     </>,
  //     <>
  //       This allows you to <b>work collaboratively</b> on the same files with
  //       family members or co-workers.
  //     </>,
  //     <>
  //       By doing so, you are getting a Cloud based{' '}
  //       <b>full-fledged file organizer and browser</b>, so you do not have to
  //       download files in order to preview, edit or annotate them. On top of that
  //       you can <b>stream audio and video</b> files from the Cloud location.
  //     </>
  //   ],
  //   ctaURL: Links.links.productProObjectStore,
  //   ctaTitle: i18n.t('showMeMore'),
  //   pictureURL: CloudImage,
  //   pictureShadow: true,
  //   pictureHeight: 300
  // };
}
