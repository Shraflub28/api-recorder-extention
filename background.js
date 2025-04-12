// Store all recorded API calls
let apiCalls = [];
let isRecording = false;
let filterPattern = '';
let listenersActive = false;

// Listen for service worker activation
chrome.runtime.onStartup.addListener(initializeFromStorage);

// Also initialize on install
chrome.runtime.onInstalled.addListener(initializeFromStorage);

// Initialize on script load (handles when service worker restarts)
initializeFromStorage();

// Function to initialize state from storage
function initializeFromStorage() {
  console.log('Initializing API Recorder from storage');
  
  chrome.storage.local.get(['apiCalls', 'isRecording', 'filterPattern'], (result) => {
    if (result.apiCalls) apiCalls = result.apiCalls;
    if (result.isRecording !== undefined) isRecording = result.isRecording;
    if (result.filterPattern) filterPattern = result.filterPattern;
    
    // Set up listeners if recording is active
    if (isRecording && !listenersActive) {
      console.log('Restarting recording listeners');
      setupWebRequestListeners();
    }
  });
}

// Function to set up web request listeners
function setupWebRequestListeners() {
  if (listenersActive) {
    console.log('Listeners already active, skipping setup');
    return;
  }

  console.log('Setting up web request listeners');
  
  chrome.webRequest.onBeforeRequest.addListener(
    recordRequest,
    { urls: ["<all_urls>"] },
    ["requestBody"]
  );
  
  chrome.webRequest.onBeforeSendHeaders.addListener(
    recordRequestHeaders,
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
  );
  
  chrome.webRequest.onHeadersReceived.addListener(
    recordResponseHeaders,
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
  );
  
  chrome.webRequest.onCompleted.addListener(
    recordResponse,
    { urls: ["<all_urls>"] }
  );
  
  chrome.webRequest.onErrorOccurred.addListener(
    recordError,
    { urls: ["<all_urls>"] }
  );
  
  listenersActive = true;
}

// Function to remove web request listeners
function removeWebRequestListeners() {
  if (!listenersActive) {
    console.log('Listeners not active, skipping removal');
    return;
  }

  console.log('Removing web request listeners');
  
  chrome.webRequest.onBeforeRequest.removeListener(recordRequest);
  chrome.webRequest.onBeforeSendHeaders.removeListener(recordRequestHeaders);
  chrome.webRequest.onHeadersReceived.removeListener(recordResponseHeaders);
  chrome.webRequest.onCompleted.removeListener(recordResponse);
  chrome.webRequest.onErrorOccurred.removeListener(recordError);
  
  listenersActive = false;
}

// Record request data
function recordRequest(details) {
  // Skip if this is a request to a chrome-extension URL
  if (details.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip if not an API request based on filter
  if (filterPattern && !details.url.includes(filterPattern)) {
    return;
  }

  const call = apiCalls.find(call => call.requestId === details.requestId);
  
  if (call) {
    // Update existing call
    call.request.body = details.requestBody ? details.requestBody : null;
  } else {
    // Create new call record
    const newCall = {
      requestId: details.requestId,
      url: details.url,
      method: details.method,
      type: details.type,
      timeStamp: details.timeStamp,
      tabId: details.tabId,
      request: {
        body: details.requestBody ? details.requestBody : null,
        headers: []
      },
      response: {
        status: null,
        statusText: null,
        headers: [],
        body: null
      },
      error: null
    };
    apiCalls.push(newCall);
    
    // Save to storage
    chrome.storage.local.set({ apiCalls });

    // Notify popup about new API call
    notifyPopup();
  }
}

// Record request headers
function recordRequestHeaders(details) {
  // Skip if this is a request to a chrome-extension URL
  if (details.url.startsWith('chrome-extension://')) {
    return;
  }

  if (filterPattern && !details.url.includes(filterPattern)) {
    return;
  }

  const call = apiCalls.find(call => call.requestId === details.requestId);
  
  if (call) {
    call.request.headers = details.requestHeaders;
    chrome.storage.local.set({ apiCalls });
  }
}

// Record response headers
function recordResponseHeaders(details) {
  // Skip if this is a request to a chrome-extension URL
  if (details.url.startsWith('chrome-extension://')) {
    return;
  }

  if (filterPattern && !details.url.includes(filterPattern)) {
    return;
  }

  const call = apiCalls.find(call => call.requestId === details.requestId);
  
  if (call) {
    call.response.headers = details.responseHeaders;
    call.response.status = details.statusCode;
    chrome.storage.local.set({ apiCalls });
  }
}

// Record completed response
function recordResponse(details) {
  // Skip if this is a request to a chrome-extension URL
  if (details.url.startsWith('chrome-extension://')) {
    return;
  }

  if (filterPattern && !details.url.includes(filterPattern)) {
    return;
  }

  const call = apiCalls.find(call => call.requestId === details.requestId);
  
  if (call) {
    call.response.status = details.statusCode;
    call.response.statusText = details.statusLine;
    chrome.storage.local.set({ apiCalls });
    
    // Notify popup about updated API call
    notifyPopup();
  }
}

// Record error
function recordError(details) {
  // Skip if this is a request to a chrome-extension URL
  if (details.url.startsWith('chrome-extension://')) {
    return;
  }

  if (filterPattern && !details.url.includes(filterPattern)) {
    return;
  }

  const call = apiCalls.find(call => call.requestId === details.requestId);
  
  if (call) {
    call.error = details.error;
    chrome.storage.local.set({ apiCalls });
  }
}

// Notify popup about updates
function notifyPopup() {
  chrome.runtime.sendMessage({ 
    action: 'updateApiCalls'
  });
}

// Message handler for communication with popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'getApiCalls':
      sendResponse({ apiCalls });
      break;
    
    case 'startRecording':
      isRecording = true;
      chrome.storage.local.set({ isRecording });
      setupWebRequestListeners();
      keepAlive(); // Start keep-alive timer
      sendResponse({ success: true });
      break;
    
    case 'stopRecording':
      isRecording = false;
      chrome.storage.local.set({ isRecording });
      removeWebRequestListeners();
      sendResponse({ success: true });
      break;
    
    case 'clearApiCalls':
      apiCalls = [];
      chrome.storage.local.set({ apiCalls });
      sendResponse({ success: true });
      break;
    
    case 'setFilterPattern':
      filterPattern = message.pattern;
      chrome.storage.local.set({ filterPattern });
      sendResponse({ success: true });
      break;
    
    case 'getStatus':
      sendResponse({
        isRecording,
        filterPattern,
        callCount: apiCalls.length
      });
      break;
      
    case 'addApiCall':
      // Add manually created API call
      if (message.apiCall) {
        // Generate a unique requestId for the manual call
        const manualRequestId = 'manual-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        
        // Create new call with all required properties
        const newCall = {
          requestId: manualRequestId,
          url: message.apiCall.url,
          method: message.apiCall.method,
          type: 'manual',
          timeStamp: message.apiCall.timeStamp || Date.now(),
          tabId: -1, // Manual requests don't have a tab
          request: {
            body: message.apiCall.request.body || null,
            headers: message.apiCall.request.headers || []
          },
          response: {
            status: message.apiCall.response.status || null,
            statusText: message.apiCall.response.statusText || null,
            headers: message.apiCall.response.headers || [],
            body: message.apiCall.response.body || null
          },
          error: null,
          manual: true // Flag to identify manually added requests
        };
        
        // Add to array
        apiCalls.push(newCall);
        
        // Save to storage
        chrome.storage.local.set({ apiCalls });
        
        // Notify popup
        notifyPopup();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Invalid API call data' });
      }
      break;
  }
  return true; // Keep the message channel open for async response
});

// Handle browser or computer sleep/wake cycles
chrome.runtime.onSuspend.addListener(() => {
  console.log('Browser is suspending, saving state');
  // Chrome automatically persists extension state before suspending
});

chrome.runtime.onSuspendCanceled.addListener(() => {
  console.log('Suspension canceled, reinitializing');
  initializeFromStorage();
});

// Keep service worker alive if recording is on
function setupKeepAlive() {
  // Create an alarm that fires every 20 seconds
  chrome.alarms.create('keepAlive', { periodInMinutes: 0.33 });
  
  // Listen for the alarm
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
      // Check if we're still recording
      chrome.storage.local.get(['isRecording'], (result) => {
        if (result.isRecording) {
          console.log('Keep-alive triggered, recording is active');
          // Perform a minimal operation to keep service worker alive
          chrome.storage.local.get(['apiCalls'], () => {});
        } else {
          // If we're not recording anymore, clear the alarm
          chrome.alarms.clear('keepAlive');
        }
      });
    }
  });
}

// Replace the previous keepAlive function with this more reliable version
function keepAlive() {
  if (isRecording) {
    setupKeepAlive();
  } else {
    // Clear any existing keep-alive alarms
    chrome.alarms.clear('keepAlive');
  }
}

// Start keep-alive if recording is active
chrome.storage.local.get(['isRecording'], (result) => {
  if (result.isRecording) {
    keepAlive();
  }
});

// Add a persistent event listener for tab updates to help keep the service worker alive
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isRecording && changeInfo.status === 'complete') {
    // Log when a tab is fully loaded, no need to do anything else
    console.log('Tab updated while recording:', tabId);
  }
}); 