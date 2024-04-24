# Audiobook Library

Audiobook Library is a web application that allows users to manage and listen to their audiobook collection. It provides features such as downloading audiobooks from YouTube, playing audiobooks in the browser, and saving playback progress for each audiobook.

## Features

- Download audiobooks from YouTube by providing the video URL
- Play audiobooks directly in the web browser
- Control playback with rewind and fast forward buttons
- Track playback progress using a progress bar
- Save and resume playback progress for each audiobook
- Automatically update the audiobook list after downloading a new audiobook

## Prerequisites

Before running the Audiobook Library application, make sure you have the following installed:

- Node.js (version 12 or above)
- npm (Node Package Manager)

## Setup

1. Clone the repository or download the source code:

   ```bash
   git clone https://github.com/your-username/audiobook-library.git
   ```

2. Navigate to the project directory:

   ```bash
   cd audiobook-library
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

## Running the Application

1. Start the server:

   ```bash
   npm start
   ```

   The server will start running on `http://localhost:3000`.

2. Open a web browser and visit `http://localhost:3000` to access the Audiobook Library application.

## Usage

1. On the Audiobook Library page, you will see an input field labeled "Enter YouTube URL".

2. Paste the YouTube video URL of the audiobook you want to download into the input field.

3. Click the "Download Audiobook" button to start the download process. The audiobook will be extracted from the YouTube video and saved on the server.

4. Once the download is complete, the audiobook will appear in the audiobook list below.

5. Click on an audiobook in the list to start playing it in the browser.

6. Use the playback controls to rewind, fast forward, and track the progress of the audiobook.

7. The playback progress for each audiobook will be automatically saved, so you can resume from where you left off even if you close the browser or switch to another audiobook.

## File Structure

The project has the following file structure:

```
audiobook-library/
  ├── audiobooks/
  ├── node_modules/
  ├── index.html
  ├── style.css
  ├── script.js
  ├── server.js
  ├── package.json
  ├── audiobooks.json
  └── playback-times.json
```

- `audiobooks/`: Directory where the downloaded audiobook files are stored.
- `node_modules/`: Directory containing the installed Node.js dependencies.
- `index.html`: The main HTML file that represents the structure of the Audiobook Library page.
- `style.css`: CSS file that contains the styles for the Audiobook Library page.
- `script.js`: JavaScript file that handles the client-side functionality of the application.
- `server.js`: Node.js server file that handles the server-side logic and API endpoints.
- `package.json`: Configuration file for the Node.js project, specifying dependencies and scripts.
- `audiobooks.json`: JSON file that stores the list of available audiobooks.
- `playback-times.json`: JSON file that stores the playback progress for each audiobook.

## Dependencies

The Audiobook Library application relies on the following dependencies:

- Express.js: Web framework for Node.js used to create the server and handle API endpoints.
- ytdl-core: Library for downloading YouTube videos and extracting audio.

These dependencies are automatically installed when running `npm install`.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [ytdl-core](https://github.com/fent/node-ytdl-core)

Feel free to contribute to the project by submitting pull requests or reporting issues on the GitHub repository.
