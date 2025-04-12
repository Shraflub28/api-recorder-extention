# API Recorder Chrome Extension

A Chrome extension that records and monitors API calls made from web pages. This extension allows you to:

- Record HTTP requests and responses
- View request and response headers
- Inspect request payloads
- Filter requests by URL pattern
- Export recorded API calls to JSON

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The API Recorder extension should now be installed and visible in your Chrome toolbar

## Usage

### Recording API Calls

1. Click the API Recorder icon in your Chrome toolbar to open the extension popup
2. Click the "Start Recording" button to begin capturing API calls
3. Navigate to any website or web application where you want to monitor API calls
4. API calls will be automatically captured and displayed in the extension popup
5. Click "Stop Recording" to pause the recording

### Filtering API Calls

1. Enter a URL pattern in the filter input field (e.g., "api/v1" or "graphql")
2. Click the "Apply Filter" button
3. Only API calls that match the filter pattern will be captured

### Viewing API Call Details

1. Click on any API call in the list to view its details
2. The detail panel shows information about the request and response
3. Use the tabs to navigate between different views:
   - **Overview**: Summary of the API call
   - **Request**: Request payload data
   - **Response**: Response data (note: full response body capture requires additional configuration)
   - **Headers**: Request and response headers

### Managing Recorded API Calls

- Click "Clear Logs" to delete all recorded API calls
- Click "Export JSON" to download the recorded API calls as a JSON file

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

## License

This project is licensed under the MIT License - see the LICENSE file for details. 