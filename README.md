# API Recorder Chrome Extension

A Chrome extension that records and monitors API calls made from web pages. This extension allows you to:

- Record HTTP requests and responses
- View request and response headers
- Inspect request payloads
- Filter requests by URL pattern
- Export recorded API calls to JSON and HAR formats
- Copy cURL commands for API requests

## Installation

### From GitHub

1. Clone or download this repository
   ```
   git clone https://github.com/Shraflub28/api-recorder-extention.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The API Recorder extension should now be installed and visible in your Chrome toolbar

## Local Development

### Setting Up Your Development Environment

1. **Clone the repository**
   ```
   git clone https://github.com/Shraflub28/api-recorder-extention.git
   cd api-recorder-extention
   ```

2. **Making changes**
   - You can edit the files using any code editor such as VS Code, Sublime Text, or Cursor
   - Main files:
     - `popup.html`: The extension's UI structure
     - `popup.css`: Styles for the UI
     - `popup.js`: The interactive functionality
     - `background.js`: Background script that captures API requests
     - `manifest.json`: Extension configuration

3. **Testing your changes**
   - After making changes, go to `chrome://extensions/`
   - Find the API Recorder extension and click the refresh icon
   - Click on the extension icon to test your changes
   - If you modified the background script, you may need to reload the extension entirely

### Loading the Extension Locally

1. Open Chrome and go to `chrome://extensions/`
2. Turn on "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked"
4. Navigate to the directory where you cloned or downloaded the repository
5. Select the folder and click "Open"
6. The extension should now appear in your extensions list and in the toolbar

### Debugging the Extension

1. **Debugging the popup**
   - Right-click on the extension icon and select "Inspect popup"
   - This opens Chrome DevTools connected to the popup
   - You can view console logs, set breakpoints, and inspect elements

2. **Debugging the background script**
   - On the `chrome://extensions/` page, find the API Recorder extension
   - Click on "background page" under "Inspect views"
   - This opens DevTools connected to the background script
   - You can see console logs and debug the API interception logic

## Usage

### Recording API Calls

1. Click the API Recorder icon in your Chrome toolbar to open the extension popup
2. Toggle the recording switch to begin capturing API calls
3. Navigate to any website or web application where you want to monitor API calls
4. API calls will be automatically captured and displayed in the extension popup
5. Toggle the recording switch again to stop recording

### Filtering API Calls

1. Use the search bar to filter requests by URL, method, or status code
2. Click on the method filter buttons (GET, POST, PUT, DELETE) to show/hide specific HTTP methods
3. The request count will update to show how many requests match your filters

### Viewing API Call Details

1. Click on any API call in the list to view its details
2. The detail panel shows comprehensive information about the request and response
3. Use the tabs to navigate between different views:
   - **Overview**: Summary of the API call including method, URL, and status
   - **Request**: Request URL, query parameters, and request body
   - **Response**: Response data and status information
   - **Headers**: Request and response headers
   - **Timing**: Request timing information (when available)

### Managing Recorded API Calls

- Click the clear button to delete all recorded API calls
- Click "Export JSON" to download the recorded API calls as a JSON file
- Click "Export HAR" to download in HTTP Archive format (compatible with other tools)
- Click "Copy URLs" to copy the URLs of all filtered requests to your clipboard
- Click "Copy as cURL" in the details view to get a cURL command for the selected request

### Creating Custom API Requests

1. Click the "+" button in the header
2. Fill in the request details (URL, method, headers, and body)
3. Click "Send Request" to execute the request
4. View the response and optionally save it to your request history

## Limitations

- Response body capture is not available by default. To capture response bodies, additional content script injection would be required.
- The extension can only record API calls from pages after the extension is activated.
- Some browser-initiated requests may not be fully captured.

## Permissions

This extension requires the following permissions:

- `webRequest`: To monitor and intercept web requests
- `webRequestBlocking`: To intercept requests synchronously
- `storage`: To store captured API calls
- `tabs`: To access tab information
- `<all_urls>`: To capture requests from all websites

## Contributing

Contributions are welcome! Feel free to submit pull requests or create issues for bugs and feature requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 