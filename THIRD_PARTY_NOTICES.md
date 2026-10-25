# Third-Party Notices

This project contains custom code authored for this repository and is published under the MIT License in the repository's `LICENSE` file.

This repository also includes third-party libraries, scripts, model packages, and CDN assets used to provide the functionality of the app. Those third-party components remain the property of their respective owners and are subject to their own licenses and terms.

This file is provided for transparency and attribution. It is not a substitute for the original licenses published by the package authors.

## Included third-party components

### Runtime / backend dependencies

- Express
  - Package: `express`
  - Source: npm
  - License: See upstream package license in the package metadata / package source
  - Purpose: HTTP server and API routing

- CORS
  - Package: `cors`
  - Source: npm
  - License: See upstream package license in the package metadata / package source
  - Purpose: Cross-origin request support

- better-sqlite3
  - Package: `better-sqlite3`
  - Source: npm
  - License: See upstream package license in the package metadata / package source
  - Purpose: Embedded SQLite database access

### Frontend / AI / vision components

- TensorFlow.js
  - Package: `@tensorflow/tfjs`
  - Source: jsDelivr CDN
  - License: See upstream package license in the package metadata / package source
  - Purpose: On-device ML / tensor processing

- COCO-SSD
  - Package: `@tensorflow-models/coco-ssd`
  - Source: jsDelivr CDN
  - License: See upstream package license in the package metadata / package source
  - Purpose: Object detection

- Pose Detection
  - Package: `@tensorflow-models/pose-detection`
  - Source: jsDelivr CDN
  - License: See upstream package license in the package metadata / package source
  - Purpose: Body pose estimation

- Tesseract.js
  - Package: `tesseract.js`
  - Source: jsDelivr CDN
  - License: See upstream package license in the package metadata / package source
  - Purpose: OCR / text extraction

- face-api.js fork
  - Package: `@vladmandic/face-api`
  - Source: jsDelivr CDN
  - License: See upstream package license in the package metadata / package source
  - Purpose: Face detection / landmarking / recognition

- MediaPipe camera utils
  - Package: `@mediapipe/camera_utils`
  - Source: jsDelivr CDN
  - License: See upstream package license in the package metadata / package source
  - Purpose: Camera initialization helpers

- MediaPipe drawing utils
  - Package: `@mediapipe/drawing_utils`
  - Source: jsDelivr CDN
  - License: See upstream package license in the package metadata / package source
  - Purpose: Drawing overlays for vision features

- MediaPipe Hands
  - Package: `@mediapipe/hands`
  - Source: jsDelivr CDN
  - License: See upstream package license in the package metadata / package source
  - Purpose: Hand tracking / landmark detection

- ONNX Runtime Web
  - Package: `onnxruntime-web`
  - Source: jsDelivr CDN
  - License: See upstream package license in the package metadata / package source
  - Purpose: Browserside ML runtime for advanced model execution

## Asset and branding notice

The repository also includes image assets such as icon files. If those assets were created by the repository owner, they are covered by the repository's custom copyright ownership. If any asset was sourced externally, its original license terms must be reviewed separately before redistribution or commercial reuse.

## Important notice

This is not legal advice.

Before publishing, commercializing, or distributing the project, confirm:

- the repository's own custom code is licensed as intended
- all third-party packages used in the project are acceptable under your distribution model
- any copied sample code, tutorials, design assets, or external images are either original or properly licensed

## Repository policy statement

For this repository, the custom code authored here is intended to be shared under the MIT License, while third-party dependency licenses remain governed by their original maintainers and package terms.

The repository owner is responsible for keeping this notice up to date as dependencies or assets change.
