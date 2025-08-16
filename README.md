# PowerPoint Editor

## Overview
The PowerPoint Editor is a web application designed to provide a user-friendly interface for creating and editing presentations, similar to traditional PowerPoint software. It allows users to manage slides, format text, and insert images seamlessly.

## Features
- **Slide Management**: Add, delete, and rearrange slides with ease.
- **Rich Text Editing**: Format text, change fonts, and apply styles.
- **Image Insertion**: Easily insert images into slides.
- **Responsive Design**: Optimized for various screen sizes, ensuring a smooth experience on both desktop and mobile devices.

## Project Structure
```
PowerPoint-Editor
├── src
│   ├── components
│   │   ├── Editor
│   │   ├── Sidebar
│   │   ├── Toolbar
│   │   └── Slide
│   ├── store
│   │   ├── store.ts
│   │   └── slices
│   │       ├── slidesSlice.ts
│   │       └── uiSlice.ts
│   ├── pages
│   │   └── index.tsx
│   ├── styles
│   │   └── main.css
│   └── types
│       └── index.ts
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
To get started with the PowerPoint Editor, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd PowerPoint-Editor
npm install
```

## Usage
To run the application in development mode, use the following command:

```bash
npm start
```

This will start the development server and open the application in your default web browser.

## Contributing
Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.