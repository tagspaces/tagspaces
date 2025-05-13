![TagSpaces Logo](https://www.tagspaces.org/img/tagspaces-logo.svg)

[![GitHub All Releases](https://img.shields.io/github/downloads/tagspaces/tagspaces/total.svg)](https://github.com/tagspaces/tagspaces/releases)
[![Gurubase](https://img.shields.io/badge/Gurubase-Ask%20TagSpaces%20Guru-006BFF)](https://gurubase.io/g/tagspaces)

# TagSpaces

**TagSpaces** is a free and open-source platform for organizing, tagging, and managing your local files. It runs completely offline, with no need for cloud services, internet connection, or vendor lock-in. Available for **Windows**, **Linux**, and **macOS**, it also includes a [browser extension](https://github.com/tagspaces/browser-extensions) (Web Clipper) for Firefox, Edge, and Chrome to capture online content as local files.

![TagSpaces with the Markdown Editor](https://www.tagspaces.org/content/v6/tagspaces-lite-demo.avif)

## 🌐 Learn More

- 🌍 [Website](https://www.tagspaces.org/)
- 📰 [Blog](https://www.tagspaces.org/blog/)
- 📚 [Documentation](https://docs.tagspaces.org/)
- 💬 [Community Forum](https://tagspaces.discourse.group/)
- 🐛 [GitHub Issues](https://github.com/tagspaces/tagspaces/issues)

---

## 📦 Downloads

Grab the latest release from the [GitHub Releases Page](https://github.com/tagspaces/tagspaces/releases).  
Check out the full [changelog](https://www.tagspaces.org/whatsnew/) for recent updates.

---

## 🚀 Features at a Glance

- **File & Folder Management** – Browse, organize, and manage local files in a powerful interface.
- **Tagging System** – Add tags directly into filenames or use sidecar files for metadata storage.
- **Flexible Search** – Filter and find files by name or tags using fuzzy search.
- **Offline First** – 100% offline, serverless, and privacy-focused.
- **Cross-platform** – Runs seamlessly on Windows, Linux, and macOS.
- **Note Taking** – Create notes in TXT, Markdown, or HTML.
- **To-Do Support** – Manage task lists using the built-in HTML editor.
- **Media Player** – Play common audio and video formats directly within the app.
- **Web Clipper** – Save web pages or screenshots locally using our browser extension.

---

## 👩‍💻 Developer Guide

### 🛠️ Technologies

- **Javascript Framework:** [React.js](https://reactjs.org/)
- **User Interface Styling:** [MUI](https://mui.com/)
- **Desktop App Framework:** [Electron](https://electron.atom.io/)
- **Boilerplate:** [Electron React Boilerplate](https://github.com/chentsulin/electron-react-boilerplate)

### 📁 Project Structure

```text
src/
  renderer/         # Core application logic
  main/             # Electron main process
  locales/          # Language translation files
  node_modules/     # TagSpaces extension modules

cordova/            # Deprecated Android build
dll/                # Live reload support for development
docker/             # Docker container setup
internals/          # Flow and ESLint configurations
resources/          # Images and build resources
scripts/            # NPM task-related scripts
test/               # Unit and E2E tests
web/                # Assets for web version
```

### ▶️ Running from Source

#### Prerequisites

Install the following tools:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Git](http://git-scm.org/)

#### Setup Steps

    git clone https://github.com/tagspaces/tagspaces.git
    cd tagspaces
    git checkout develop  # or 'master' for stable release
    npm install

#### Set Up Local Web Service

Create a .env file in release/app/ with a custom key to avoid conflicts:

The desktop version of the application uses a web service which is running locally as a separate process. The web service is responsible for the search index creation and the generation of the thumbnails for most of the images formats. A key is required in order for the main application to communicate with the web server. It should be generated from webpack script in the `.env` file located in `release/app` folder. This is an example for an .env file.

    KEY=a_custom_key

> Having a custom key, ensures that another instance of TagSpaces will not communicate with the web service of the initial instance, since it is always running on the same port.

#### Build & Start

    npm run build
    npm run start

#### Start in Development Mode

    npm run dev

This will start a development server in background, which watches for changes in background and refreshes the application automatically once you have done some changes in the source code.

### 🧪 Testing

Run unit and integration tests:

```bash
npm run test-unit
npm run test-playwright
npm run test-playwright-web

```

### 💻 Packaging the Desktop App

Build native apps for each platform:

```bash
npm run package-win
npm run package-linux
npm run package-mac
npm run package-mac-arm64
```

The commands will create packages for Windows, Linux, Mac OS and Mac OS with the M1 processor respectively.

> ⚠️ Run npm run build before packaging.

### 📱 Android Build (Deprecated)

```bash
npm run version-meta
npm run prepare-cordova
npm run package-android
```

### 🌐 Web Version

Start the web version locally:

    npm run run-web

### 🔌 Extend with Custom Viewers & Editors

TagSpaces supports extension modules for opening and editing different file types. Learn more on our [Extensions Page](https://www.tagspaces.org/extensions/).

### 🤝 Contributing

We welcome contributions! Please review and sign the [Contributor License Agreement (CLA)](https://www.tagspaces.org/contribute/) before submitting PRs.

## 🌍 Localization

TagSpaces is available in over 20 languages. Help us translate the app by joining our team on [Transifex](https://www.transifex.com/tagspaces/tagspaces/).

## 💡 Ideas & Suggestions

Have an idea or a feature request? Share it on our [community forum](https://tagspaces.discourse.group/c/feature-requests/6) and join the discussion.

## 🐞 Support & Bug Reports

If you encounter a bug or need help, [open an issue](https://github.com/tagspaces/tagspaces/issues) on GitHub.

## ⚠️ Known Limitations

TagSpaces is not optimized for locations with more than 100,000 files.

## 📡 Feeds

- [Blog RSS Feed](http://www.tagspaces.org/blog/rss.xml)
- [GitHub Commits (master)](https://github.com/tagspaces/tagspaces/commits/master.atom)

## 📄 License

TagSpaces is dual-licensed under the [AGPL](LICENSE.txt) (GNU Affero General Public License) v3 for open-source projects and a commercial license for vendors or resellers. Contact us if you're interested in using TagSpaces under different terms.
