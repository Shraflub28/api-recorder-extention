// DOM Elements
const recordToggle = document.getElementById('recordToggle');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const exportHarBtn = document.getElementById('exportHarBtn');
const searchInput = document.getElementById('searchInput');
const apiList = document.getElementById('apiList');

// State
let isRecording = false;
let apiCalls = [];
let filteredCalls = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Get current status from background script
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    isRecording = response.isRecording;
    recordToggle.checked = isRecording;
    
    // Set search input value
    if (response.filterPattern) {
      searchInput.value = response.filterPattern;
    }
  });
  
  // Load API calls
  loadApiCalls();
});

// Event Listeners
recordToggle.addEventListener('change', toggleRecording);
exportJsonBtn.addEventListener('click', exportJson);
exportHarBtn.addEventListener('click', exportHar);
searchInput.addEventListener('input', filterApiCalls);

// Functions
function toggleRecording() {
  isRecording = recordToggle.checked;
  
  const action = isRecording ? 'startRecording' : 'stopRecording';
  chrome.runtime.sendMessage({ action }, (response) => {
    if (!response.success) {
      // Revert the toggle if operation failed
      recordToggle.checked = !isRecording;
      isRecording = !isRecording;
    }
  });
}

function loadApiCalls() {
  chrome.runtime.sendMessage({ action: 'getApiCalls' }, (response) => {
    // Filter out any chrome-extension:// URLs
    apiCalls = (response.apiCalls || []).filter(call => !call.url.startsWith('chrome-extension://'));
    filteredCalls = [...apiCalls];
    renderApiList();
  });
}

function filterApiCalls() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    filteredCalls = [...apiCalls];
  } else {
    filteredCalls = apiCalls.filter(call => 
      call.url.toLowerCase().includes(searchTerm) || 
      call.method.toLowerCase().includes(searchTerm) ||
      (call.response.status && call.response.status.toString().includes(searchTerm))
    );
  }
  
  renderApiList();
}

function renderApiList() {
  apiList.innerHTML = '';
  
  filteredCalls.forEach((call) => {
    const item = document.createElement('div');
    item.className = 'api-item';
    
    // Extract pathname for display
    let urlDisplay;
    try {
      const url = new URL(call.url);
      urlDisplay = url.pathname;
    } catch (e) {
      urlDisplay = call.url;
    }
    
    // Create element for request body preview
    let bodyPreview = '';
    if (call.request.body) {
      if (call.request.body.formData) {
        const formData = call.request.body.formData;
        bodyPreview = `{ "${Object.keys(formData)[0]}": "${Object.values(formData)[0]}" ... }`;
      } else if (call.request.body.raw) {
        try {
          const rawData = JSON.parse(atob(call.request.body.raw[0]));
          const keys = Object.keys(rawData);
          if (keys.length > 0) {
            bodyPreview = `{ "${keys[0]}": "${rawData[keys[0]]}" ... }`;
          }
        } catch (e) {
          // If we can't parse it, just show a placeholder
          bodyPreview = '{ ... }';
        }
      }
    } else if (call.response.status >= 200 && call.response.status < 300) {
      // For successful GET requests, show a sample of what might be in the response
      bodyPreview = call.method === 'GET' ? '{ id: 1 ... }' : '';
    }
    
    // Main content
    item.innerHTML = `
      <div style="width: 100%;">
        <div style="display: flex; width: 100%;">
          <div class="method ${call.method}">${call.method}</div>
          <div class="url">${urlDisplay}</div>
          <div class="status">${call.response.status || ''}</div>
        </div>
        ${bodyPreview ? `<div class="payload">${bodyPreview}</div>` : ''}
      </div>
    `;
    
    // Click handler for viewing details
    item.addEventListener('click', () => {
      showRequestDetails(call);
    });
    
    apiList.appendChild(item);
  });
}

function showRequestDetails(call) {
  // For now we'll just show alert with basic info
  // In a real implementation, we would show a detailed view
  alert(`
    URL: ${call.url}
    Method: ${call.method}
    Status: ${call.response.status || 'N/A'}
    Time: ${new Date(call.timeStamp).toLocaleString()}
  `);
}

function exportJson() {
  const jsonStr = JSON.stringify(filteredCalls, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `api-calls-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

function exportHar() {
  // Convert API calls to HAR format
  const harObj = {
    log: {
      version: '1.2',
      creator: {
        name: 'API Recorder',
        version: '1.0'
      },
      entries: filteredCalls.map(call => {
        return {
          startedDateTime: new Date(call.timeStamp).toISOString(),
          time: 0, // We don't have this information
          request: {
            method: call.method,
            url: call.url,
            httpVersion: 'HTTP/1.1',
            cookies: [],
            headers: call.request.headers || [],
            queryString: [],
            postData: call.request.body ? {
              mimeType: 'application/json',
              text: JSON.stringify(call.request.body)
            } : undefined,
            headersSize: -1,
            bodySize: -1
          },
          response: {
            status: call.response.status || 0,
            statusText: call.response.statusText || '',
            httpVersion: 'HTTP/1.1',
            cookies: [],
            headers: call.response.headers || [],
            content: {
              size: -1,
              mimeType: 'application/json'
            },
            redirectURL: '',
            headersSize: -1,
            bodySize: -1
          },
          cache: {},
          timings: {
            send: 0,
            wait: 0,
            receive: 0
          }
        };
      })
    }
  };
  
  const jsonStr = JSON.stringify(harObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `api-calls-${new Date().toISOString().slice(0, 10)}.har`;
  a.click();
  
  URL.revokeObjectURL(url);
}

// Listen for updates from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateApiCalls') {
    // Reload all API calls
    loadApiCalls();
  }
});
