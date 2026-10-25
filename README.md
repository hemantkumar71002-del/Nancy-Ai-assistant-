# NANCY AI

NANCY AI is an accessibility-focused assistant designed to help visually impaired users interact with digital systems more independently.

The project combines AI-driven assistance, voice-based interaction, and smart face-recognition features to make daily digital tasks easier and more accessible.

## Overview

This project is designed to support people with visual impairments by enabling:

- voice-based assistance
- recognition-based interactions
- easy access to contact and task information
- user-friendly assistance workflows

## Features

- AI-powered assistance for accessibility use cases
- face recognition support for user identity matching
- backend services for cloud-based sync and verification
- web-based interface for local and hosted deployment
- privacy-aware local storage and owner-based access control

## Project Structure

- `index.html` - frontend interface
- `server.js` - backend service
- `db.js` - database logic
- `package.json` - Node.js dependencies and scripts
- `README.md` - project documentation
- `Nancy_Buttons_ESP32.ino` - embedded hardware-related logic

## Quick Start

### Install dependencies

```bash
npm install
```

### Start the server

```bash
npm start
```

By default, the app runs on:

```text
http://localhost:3000
```

## Environment Variables

Optional configuration:

- `PORT` - server port (default: 3000)
- `DB_PATH` - SQLite database path
- `FACE_MATCH_THRESHOLD` - threshold for face matching

## API Overview

The backend exposes endpoints for face enrollment, matching, listing, syncing, and deletion.

Example endpoints:

- `POST /api/faces/enroll`
- `POST /api/faces/match`
- `GET /api/faces`
- `GET /api/faces/sync`
- `DELETE /api/faces/:name`
- `GET /health`

## Notes

The app uses owner-based access control (`X-Owner-Id`) to separate user data and maintain per-user sync behavior.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request with a clear description of the enhancement or fix.

## Support

For questions, feature requests, or deployment support, please contact the repository owner or open a GitHub issue.
