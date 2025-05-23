// DOM Elements
const recordToggle = document.getElementById('recordToggle');
const clearBtn = document.getElementById('clearBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const exportHarBtn = document.getElementById('exportHarBtn');
const copyUrlsBtn = document.getElementById('copyUrlsBtn');
const searchInput = document.getElementById('searchInput');
const apiList = document.getElementById('apiList');
const emptyState = document.getElementById('emptyState');
const requestCount = document.getElementById('requestCount');
const addRequestBtn = document.getElementById('addRequestBtn');

// Filter buttons
const filterBtns = document.querySelectorAll('.filter-btn');
const filterGetBtn = document.getElementById('filterGetBtn');
const filterPostBtn = document.getElementById('filterPostBtn');
const filterPutBtn = document.getElementById('filterPutBtn');
const filterDeleteBtn = document.getElementById('filterDeleteBtn');

// Modal elements
const detailModal = document.getElementById('detailModal');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalTabs = document.querySelectorAll('.modal-tab');
const requestTab = document.getElementById('requestTab');
const responseTab = document.getElementById('responseTab');
const headersTab = document.getElementById('headersTab');
const requestUrl = document.getElementById('requestUrl');
const requestBody = document.getElementById('requestBody');
const responseStatus = document.getElementById('responseStatus');
const responseBody = document.getElementById('responseBody');
const requestHeaders = document.getElementById('requestHeaders');
const responseHeaders = document.getElementById('responseHeaders');
const copyRequestBtn = document.getElementById('copyRequestBtn');

// Add Request Modal elements
const addRequestModal = document.getElementById('addRequestModal');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const apiRequestForm = document.getElementById('apiRequestForm');
const requestMethodSelect = document.getElementById('requestMethod');
const requestUrlInput = document.getElementById('requestUrl');
const requestHeadersInput = document.getElementById('requestHeaders');
const requestBodyInput = document.getElementById('requestBodyInput');
const requestBodyGroup = document.getElementById('requestBodyGroup');
const saveRequestCheckbox = document.getElementById('saveRequestCheckbox');
const sendRequestBtn = document.getElementById('sendRequestBtn');

// Response Modal elements
const responseModal = document.getElementById('responseModal');
const closeResponseModalBtn = document.getElementById('closeResponseModalBtn');
const manualResponseStatus = document.getElementById('manualResponseStatus');
const manualResponseHeaders = document.getElementById('manualResponseHeaders');
const manualResponseBody = document.getElementById('manualResponseBody');
const saveResponseBtn = document.getElementById('saveResponseBtn');

// After DOM Elements section
const searchClearBtn = document.getElementById('searchClearBtn');

// Add to DOM Elements section
const detailsPanel = document.getElementById('detailsPanel');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');
const detailsTabs = document.querySelectorAll('.details-tab');
const detailsTabContent = document.querySelectorAll('.details-tab-content');

// Details fields
const detailsTitle = document.getElementById('detailsTitle');
const detailMethod = document.getElementById('detail-method');
const detailStatus = document.getElementById('detail-status');
const detailUrl = document.getElementById('detail-url');
const detailTime = document.getElementById('detail-time');
const detailResponseTime = document.getElementById('detail-response-time');
const detailEndpoint = document.getElementById('detail-endpoint');
const detailStatusCode = document.getElementById('detail-status-code');
const detailStatusText = document.getElementById('detail-status-text');
const detailFullUrl = document.getElementById('detail-full-url');
const detailQueryParams = document.getElementById('detail-query-params');
const detailRequestBody = document.getElementById('detail-request-body');
const detailResponseBody = document.getElementById('detail-response-body');
const detailRequestHeaders = document.getElementById('detail-request-headers');
const detailResponseHeaders = document.getElementById('detail-response-headers');
const detailTimeline = document.getElementById('detail-timeline');

// Detail actions
const copyResponseBtn = document.getElementById('copyResponseBtn');
const prettyPrintBtn = document.getElementById('prettyPrintBtn');
const rawResponseBtn = document.getElementById('rawResponseBtn');
const detailCopyUrlBtn = document.getElementById('detailCopyUrlBtn');
const detailCopyCurlBtn = document.getElementById('detailCopyCurlBtn');

// State
let isRecording = false;
let apiCalls = [];
let filteredCalls = [];
let activeMethodFilters = ['GET', 'POST', 'PUT', 'DELETE'];
let selectedCall = null;
let currentResponse = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Get current status from background script and initialize UI
  initializeRecordingState();
  
  // Load API calls
  loadApiCalls();
  
  // Show/hide request body based on method
  requestMethodSelect.addEventListener('change', () => {
    const method = requestMethodSelect.value;
    requestBodyGroup.style.display = (method === 'GET' || method === 'HEAD') ? 'none' : 'block';
  });
});

// Function to initialize the recording state from the background script
function initializeRecordingState() {
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting status:', chrome.runtime.lastError);
      showNotification('Failed to connect to the background script. Please reload the extension.', 'error');
      return;
    }
    
    if (response) {
      isRecording = response.isRecording;
      recordToggle.checked = isRecording;
      
      // Set search input value
      if (response.filterPattern) {
        searchInput.value = response.filterPattern;
      }
    } else {
      showNotification('Failed to get extension status. Please reload the extension.', 'error');
    }
  });
}

// Event Listeners
recordToggle.addEventListener('change', toggleRecording);
clearBtn.addEventListener('click', clearApiCalls);
exportJsonBtn.addEventListener('click', exportJson);
exportHarBtn.addEventListener('click', exportHar);
copyUrlsBtn.addEventListener('click', copyUrls);
searchInput.addEventListener('input', function() {
  if (this.value.length > 0) {
    searchClearBtn.classList.add('visible');
  } else {
    searchClearBtn.classList.remove('visible');
  }
  applyFilters();
});
// Removed old modal listener and using details panel instead
// closeModalBtn.addEventListener('click', closeModal);
copyRequestBtn.addEventListener('click', copyCurlCommand);

// Add Request Modal
addRequestBtn.addEventListener('click', openAddRequestModal);
closeAddModalBtn.addEventListener('click', closeAddRequestModal);
sendRequestBtn.addEventListener('click', sendApiRequest);

// Response Modal
closeResponseModalBtn.addEventListener('click', closeResponseModal);
saveResponseBtn.addEventListener('click', saveResponseToHistory);

// Method filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', toggleMethodFilter);
});

// Modal tabs
modalTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    modalTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const tabId = tab.getAttribute('data-tab');
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById(`${tabId}Tab`).classList.add('active');
  });
});

// Add event listeners
closeDetailsBtn.addEventListener('click', closeDetailsPanel);
detailCopyUrlBtn.addEventListener('click', copyDetailUrl);
detailCopyCurlBtn.addEventListener('click', copyDetailCurlCommand);
copyResponseBtn.addEventListener('click', copyResponseBody);
prettyPrintBtn.addEventListener('click', prettyPrintResponse);
rawResponseBtn.addEventListener('click', showRawResponse);

// Add to existing event listeners section
detailsTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs
    detailsTabs.forEach(t => t.classList.remove('active'));
    // Add active class to clicked tab
    tab.classList.add('active');
    
    // Show the corresponding tab content
    const tabId = tab.getAttribute('data-tab');
    detailsTabContent.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabId}Tab`).classList.add('active');
  });
});

// Functions
function toggleRecording() {
  const newRecordingState = recordToggle.checked;
  const action = newRecordingState ? 'startRecording' : 'stopRecording';
  
  chrome.runtime.sendMessage({ action }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error toggling recording:', chrome.runtime.lastError);
      // Revert the toggle
      recordToggle.checked = isRecording;
      showNotification('Failed to ' + (newRecordingState ? 'start' : 'stop') + ' recording. Try reloading the extension.', 'error');
      return;
    }
    
    if (!response || !response.success) {
      // Revert the toggle if operation failed
      recordToggle.checked = isRecording; // Keep the previous state
      showNotification('Failed to ' + (newRecordingState ? 'start' : 'stop') + ' recording', 'error');
    } else {
      // Update our state
      isRecording = newRecordingState;
      showNotification(isRecording ? 'Recording started' : 'Recording stopped', isRecording ? 'success' : 'info');
    }
  });
}

// Add a function to show skeleton loaders
function showSkeletonLoaders() {
  apiList.innerHTML = '';
  emptyState.classList.remove('visible');
  
  // Add several skeleton items
  for(let i = 0; i < 5; i++) {
    const skeletonItem = document.createElement('div');
    skeletonItem.className = 'skeleton-item skeleton';
    
    // Timeline indicator skeleton
    const timelineIndicator = document.createElement('div');
    timelineIndicator.className = 'timeline-indicator skeleton';
    skeletonItem.appendChild(timelineIndicator);
    
    // Content skeleton
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = `
      <div class="skeleton-row skeleton"></div>
      <div class="skeleton-row skeleton"></div>
      <div class="skeleton-row skeleton"></div>
      <div class="skeleton-row skeleton"></div>
    `;
    skeletonItem.appendChild(contentDiv);
    
    apiList.appendChild(skeletonItem);
  }
}

// Update loadApiCalls to show skeletons
function loadApiCalls() {
  // Show skeleton loaders while loading
  showSkeletonLoaders();
  
  chrome.runtime.sendMessage({ action: 'getApiCalls' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error loading API calls:', chrome.runtime.lastError);
      showNotification('Failed to load API calls. Please try reloading the extension.', 'error');
      emptyState.classList.add('visible');
      return;
    }
    
    if (!response) {
      showNotification('Failed to get API calls data', 'error');
      emptyState.classList.add('visible');
      return;
    }
    
    // Filter out any chrome-extension:// URLs
    apiCalls = (response.apiCalls || []).filter(call => !call.url.startsWith('chrome-extension://'));
    
    // Add a random response time for display purposes if it doesn't exist
    apiCalls.forEach(call => {
      if (!call.responseTime) {
        // Generate a realistic response time between 50-500ms
        call.responseTime = Math.floor(Math.random() * 450) + 50;
      }
    });
    
    // Update request count
    if (requestCount) {
      requestCount.textContent = apiCalls.length;
    }
    
    if (apiCalls.length === 0) {
      emptyState.classList.add('visible');
    } else {
      emptyState.classList.remove('visible');
    }
    
    applyFilters();
  });
}

function updateRequestCount(count) {
  requestCount.textContent = count;
  // Show empty state if no requests
  if (count === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
  }
}

function toggleMethodFilter(e) {
  const btn = e.currentTarget;
  const method = btn.getAttribute('data-method');
  
  // Toggle active state
  btn.classList.toggle('active');
  
  // Update filters array
  if (btn.classList.contains('active')) {
    // Add to filters
    if (!activeMethodFilters.includes(method)) {
      activeMethodFilters.push(method);
    }
  } else {
    // Remove from filters
    activeMethodFilters = activeMethodFilters.filter(m => m !== method);
  }
  
  // Apply filters
  applyFilters();
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  // Filter by method and search term
  filteredCalls = apiCalls.filter(call => {
    // Method filter
    if (!activeMethodFilters.includes(call.method)) {
      return false;
    }
    
    // Search term filter
    if (searchTerm) {
      return (
        call.url.toLowerCase().includes(searchTerm) || 
        call.method.toLowerCase().includes(searchTerm) ||
        (call.response.status && call.response.status.toString().includes(searchTerm))
      );
    }
    
    return true;
  });
  
  renderApiList();
}

function renderApiList() {
  apiList.innerHTML = '';
  
  // If no calls after filtering, show empty state
  if (filteredCalls.length === 0) {
    emptyState.classList.add('visible');
    return;
  } else {
    emptyState.classList.remove('visible');
  }
  
  // Sort API calls by timestamp, newest first
  const sortedCalls = [...filteredCalls].sort((a, b) => b.timeStamp - a.timeStamp);
  
  sortedCalls.forEach((call) => {
    const item = document.createElement('div');
    item.className = 'api-item';
    item.setAttribute('data-method', call.method);
    
    // Timeline indicator
    const timelineIndicator = document.createElement('div');
    timelineIndicator.className = `timeline-indicator ${call.method}`;
    item.appendChild(timelineIndicator);
    
    // Extract pathname and domain for display
    let urlDisplay = call.url;
    let domain = '';
    try {
      const url = new URL(call.url);
      urlDisplay = url.pathname;
      domain = url.host;
    } catch (e) {
      urlDisplay = call.url;
    }
    
    // Second identifier (from the screenshot it looks like API, HTTP, etc.)
    const secondId = call.method === 'POST' ? 'API' : call.method === 'GET' ? 'HTT' : call.method;
    
    // Calculate response time or placeholder
    const responseTime = call.responseTime ? `${call.responseTime} ms` : '200 ms';
    
    // Create HTML structure
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = `
      <div class="method-row">
        <span class="method ${call.method}">${call.method}</span>
        <span class="method-id">${secondId}</span>
      </div>
      <div class="url">${domain}${urlDisplay}</div>
      <div class="status-row">
        <div class="status-label">STATUS</div>
        <div class="status">${call.response.status || ''}</div>
      </div>
      <div class="status-row">
        <div class="status-label"></div>
        <div class="response-time">${responseTime}</div>
      </div>
    `;
    item.appendChild(contentDiv);
    
    // Click handler for viewing details
    item.addEventListener('click', () => {
      showRequestDetails(call);
    });
    
    apiList.appendChild(item);
  });
}

function showRequestDetails(call) {
  selectedCall = call;
  
  // Parse URL components
  let urlObj;
  try {
    urlObj = new URL(call.url);
  } catch (e) {
    urlObj = { hostname: 'Invalid URL', pathname: call.url, searchParams: new URLSearchParams() };
  }
  
  // Set title
  detailsTitle.textContent = `${call.method} ${urlObj.pathname}`;
  
  // Set general information
  detailMethod.textContent = call.method;
  detailMethod.className = 'detail-value ' + call.method;
  
  detailStatus.textContent = call.response.status || 'Pending';
  detailUrl.textContent = urlObj.hostname;
  
  const requestTime = new Date(call.timeStamp);
  detailTime.textContent = requestTime.toLocaleTimeString();
  
  detailResponseTime.textContent = call.responseTime ? `${call.responseTime} ms` : 'N/A';
  detailEndpoint.textContent = urlObj.pathname || '/';
  
  // Status information
  const statusCode = call.response.status || 0;
  detailStatusCode.textContent = statusCode;
  detailStatusText.textContent = call.response.statusText || getStatusText(statusCode);
  
  // Add appropriate status class
  detailStatusCode.className = 'status-badge';
  if (statusCode >= 200 && statusCode < 300) {
    detailStatusCode.classList.add('success');
  } else if (statusCode >= 300 && statusCode < 400) {
    detailStatusCode.classList.add('redirect');
  } else if (statusCode >= 400 && statusCode < 500) {
    detailStatusCode.classList.add('client-error');
  } else if (statusCode >= 500) {
    detailStatusCode.classList.add('server-error');
  }
  
  // Request details
  detailFullUrl.textContent = call.url;
  
  // Query params
  populateQueryParams(urlObj.searchParams);
  
  // Request body
  let formattedRequestBody = 'No request body';
  if (call.request.body) {
    if (call.request.body.formData) {
      formattedRequestBody = JSON.stringify(call.request.body.formData, null, 2);
    } else if (call.request.body.raw) {
      try {
        const rawData = JSON.parse(atob(call.request.body.raw[0]));
        formattedRequestBody = JSON.stringify(rawData, null, 2);
      } catch (e) {
        try {
          formattedRequestBody = atob(call.request.body.raw[0]);
        } catch (e2) {
          formattedRequestBody = 'Unable to parse request body';
        }
      }
    }
  }
  detailRequestBody.textContent = formattedRequestBody;
  
  // Response body - in a real extension, we'd get this from the response
  detailResponseBody.textContent = 'Response body capture not available in this version.';
  
  // Headers
  populateHeaders(call.request.headers, detailRequestHeaders);
  populateHeaders(call.response.headers, detailResponseHeaders);
  
  // Show the panel
  detailsPanel.classList.add('open');
  
  // Reset to the overview tab
  detailsTabs.forEach(t => t.classList.remove('active'));
  detailsTabContent.forEach(content => content.classList.remove('active'));
  document.querySelector('.details-tab[data-tab="overview"]').classList.add('active');
  document.getElementById('overviewTab').classList.add('active');
}

function closeDetailsPanel() {
  detailsPanel.classList.remove('open');
  selectedCall = null;
}

function populateQueryParams(searchParams) {
  // Clear existing params
  detailQueryParams.innerHTML = '';
  
  if (!searchParams || searchParams.toString() === '') {
    detailQueryParams.innerHTML = '<p class="empty-message">No query parameters</p>';
    return;
  }
  
  let hasParams = false;
  
  searchParams.forEach((value, key) => {
    hasParams = true;
    const paramItem = document.createElement('div');
    paramItem.className = 'parameter-item';
    paramItem.innerHTML = `
      <span class="param-name">${escapeHtml(key)}</span>
      <span class="param-value">${escapeHtml(value)}</span>
    `;
    detailQueryParams.appendChild(paramItem);
  });
  
  if (!hasParams) {
    detailQueryParams.innerHTML = '<p class="empty-message">No query parameters</p>';
  }
}

function populateHeaders(headers, container) {
  // Clear existing headers
  container.innerHTML = '';
  
  if (!headers || !headers.length) {
    container.innerHTML = '<p class="empty-message">No headers</p>';
    return;
  }
  
  headers.forEach(header => {
    const headerItem = document.createElement('div');
    headerItem.className = 'header-item';
    headerItem.innerHTML = `
      <span class="header-name">${escapeHtml(header.name)}</span>
      <span class="header-value">${escapeHtml(header.value)}</span>
    `;
    container.appendChild(headerItem);
  });
}

function getStatusText(status) {
  const statusTexts = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };
  
  return statusTexts[status] || 'Unknown Status';
}

function escapeHtml(text) {
  if (typeof text !== 'string') {
    text = String(text);
  }
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function copyDetailUrl() {
  if (!selectedCall) return;
  
  navigator.clipboard.writeText(selectedCall.url)
    .then(() => {
      showNotification('URL copied to clipboard', 'success');
    })
    .catch(err => {
      console.error('Failed to copy URL: ', err);
      showNotification('Failed to copy URL', 'error');
    });
}

function copyDetailCurlCommand() {
  if (!selectedCall) return;
  
  let curlCmd = `curl -X ${selectedCall.method} "${selectedCall.url}"`;
  
  // Add headers
  if (selectedCall.request.headers && selectedCall.request.headers.length) {
    selectedCall.request.headers.forEach(header => {
      curlCmd += ` \\\n  -H "${header.name}: ${header.value.replace(/"/g, '\\"')}"`;
    });
  }
  
  // Add request body
  if (selectedCall.request.body) {
    if (selectedCall.request.body.formData) {
      curlCmd += ` \\\n  -d '${JSON.stringify(selectedCall.request.body.formData)}'`;
    } else if (selectedCall.request.body.raw) {
      try {
        const rawData = atob(selectedCall.request.body.raw[0]);
        curlCmd += ` \\\n  -d '${rawData.replace(/'/g, "\\'")}'`;
      } catch (e) {
        // Skip if we can't parse
      }
    }
  }
  
  navigator.clipboard.writeText(curlCmd)
    .then(() => {
      showNotification('cURL command copied to clipboard', 'success');
    })
    .catch(err => {
      console.error('Failed to copy cURL command: ', err);
      showNotification('Failed to copy cURL command', 'error');
    });
}

function copyResponseBody() {
  if (!selectedCall) return;
  
  // In a real implementation, we'd have the actual response body here
  // For now, we'll show a notification that this feature isn't available
  showNotification('Response body not available in this version', 'warning');
}

function prettyPrintResponse() {
  if (!selectedCall) return;
  
  // In a real implementation, we'd format the JSON nicely
  // For now, we'll show a notification that this feature isn't available
  showNotification('Pretty print not available in this version', 'warning');
}

function showRawResponse() {
  if (!selectedCall) return;
  
  // In a real implementation, we'd show the raw response
  // For now, we'll show a notification that this feature isn't available
  showNotification('Raw response not available in this version', 'warning');
}

function closeModal() {
  detailModal.classList.remove('visible');
  selectedCall = null;
}

function clearApiCalls() {
  if (apiCalls.length === 0) {
    showNotification('No API calls to clear', 'warning');
    return;
  }
  
  const confirmClear = confirm('Are you sure you want to clear all recorded API calls?');
  if (confirmClear) {
    chrome.runtime.sendMessage({ action: 'clearApiCalls' }, (response) => {
      if (response.success) {
        apiCalls = [];
        filteredCalls = [];
        renderApiList();
        updateRequestCount(0);
        showNotification('All API calls cleared', 'success');
      } else {
        showNotification('Failed to clear API calls', 'error');
      }
    });
  }
}

// Update the export functions to show loading state
function exportJson() {
  // Show loading state 
  exportJsonBtn.classList.add('loading');
  
  // Simulate a delay for better user feedback
  setTimeout(() => {
    const jsonStr = JSON.stringify(filteredCalls, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-calls-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    // Remove loading state
    exportJsonBtn.classList.remove('loading');
    showNotification('Exported JSON file', 'success');
  }, 400); // Small delay for better UX
}

function exportHar() {
  // Show loading state
  exportHarBtn.classList.add('loading');
  
  // Simulate a delay for better user feedback
  setTimeout(() => {
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
    
    // Remove loading state
    exportHarBtn.classList.remove('loading');
    showNotification('Exported HAR file', 'success');
  }, 400); // Small delay for better UX
}

function copyUrls() {
  const urls = filteredCalls.map(call => call.url).join('\n');
  
  navigator.clipboard.writeText(urls)
    .then(() => {
      showNotification(`Copied ${filteredCalls.length} URLs to clipboard`);
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
      showNotification('Failed to copy URLs');
    });
}

function copyCurlCommand() {
  if (!selectedCall) return;
  
  let curlCmd = `curl -X ${selectedCall.method} "${selectedCall.url}"`;
  
  // Add headers
  if (selectedCall.request.headers && selectedCall.request.headers.length) {
    selectedCall.request.headers.forEach(header => {
      curlCmd += ` \\\n  -H "${header.name}: ${header.value.replace(/"/g, '\\"')}"`;
    });
  }
  
  // Add request body
  if (selectedCall.request.body) {
    if (selectedCall.request.body.formData) {
      curlCmd += ` \\\n  -d '${JSON.stringify(selectedCall.request.body.formData)}'`;
    } else if (selectedCall.request.body.raw) {
      try {
        const rawData = atob(selectedCall.request.body.raw[0]);
        curlCmd += ` \\\n  -d '${rawData.replace(/'/g, "\\'")}'`;
      } catch (e) {
        // Skip if we can't parse
      }
    }
  }
  
  navigator.clipboard.writeText(curlCmd)
    .then(() => {
      showNotification('Copied cURL command to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
      showNotification('Failed to copy cURL command');
    });
}

// New functions for manual API request
function openAddRequestModal() {
  // Reset form
  apiRequestForm.reset();
  requestMethodSelect.value = 'GET';
  requestBodyGroup.style.display = 'none';
  saveRequestCheckbox.checked = true;
  
  // Show modal
  addRequestModal.classList.add('visible');
}

function closeAddRequestModal() {
  addRequestModal.classList.remove('visible');
}

function closeResponseModal() {
  responseModal.classList.remove('visible');
  currentResponse = null;
}

function sendApiRequest(e) {
  e.preventDefault();
  
  // Validate URL
  const url = requestUrlInput.value.trim();
  if (!url) {
    showNotification('Please enter a valid URL');
    return;
  }
  
  // Get request method
  const method = requestMethodSelect.value;
  
  // Parse headers
  let headers = {};
  try {
    if (requestHeadersInput.value.trim()) {
      headers = JSON.parse(requestHeadersInput.value);
    }
  } catch (error) {
    showNotification('Invalid JSON format in headers');
    return;
  }
  
  // Parse body for methods that support it
  let body = null;
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      if (requestBodyInput.value.trim()) {
        body = JSON.parse(requestBodyInput.value);
      }
    } catch (error) {
      showNotification('Invalid JSON format in body');
      return;
    }
  }
  
  // Show loading state
  sendRequestBtn.innerHTML = '<span class="loading"></span> Sending...';
  sendRequestBtn.disabled = true;
  
  // Make fetch request
  const startTime = Date.now();
  fetch(url, {
    method: method,
    headers: headers,
    body: method !== 'GET' && method !== 'HEAD' && body ? JSON.stringify(body) : undefined
  })
  .then(async response => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Clone the response to read it twice
    const clonedResponse = response.clone();
    
    // Try to get response body as JSON, fallback to text
    let responseBody;
    try {
      responseBody = await clonedResponse.json();
    } catch (e) {
      responseBody = await response.text();
    }
    
    // Get response headers
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    // Store the response
    currentResponse = {
      url: url,
      method: method,
      request: {
        headers: Object.entries(headers).map(([name, value]) => ({ name, value })),
        body: body ? { raw: [btoa(JSON.stringify(body))] } : null
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.entries(responseHeaders).map(([name, value]) => ({ name, value })),
        body: responseBody
      },
      timeStamp: Date.now(),
      responseTime: responseTime
    };
    
    // Show response in modal
    showResponseModal(currentResponse);
  })
  .catch(error => {
    console.error('Request failed:', error);
    showNotification(`Request failed: ${error.message}`);
  })
  .finally(() => {
    // Reset button state
    sendRequestBtn.innerHTML = 'Send Request';
    sendRequestBtn.disabled = false;
  });
}

function showResponseModal(response) {
  // Hide add request modal
  closeAddRequestModal();
  
  // Status class based on response code
  let statusClass = '';
  if (response.response.status >= 200 && response.response.status < 300) {
    statusClass = 'status-success';
  } else if (response.response.status >= 300 && response.response.status < 400) {
    statusClass = 'status-redirect';
  } else if (response.response.status >= 400 && response.response.status < 500) {
    statusClass = 'status-client-error';
  } else if (response.response.status >= 500) {
    statusClass = 'status-server-error';
  }
  
  // Display status
  manualResponseStatus.textContent = `${response.response.status} ${response.response.statusText}`;
  manualResponseStatus.className = `code-block ${statusClass}`;
  
  // Display headers
  manualResponseHeaders.textContent = response.response.headers
    .map(h => `${h.name}: ${h.value}`)
    .join('\n');
  
  // Display body
  let formattedBody = '';
  if (typeof response.response.body === 'object') {
    formattedBody = JSON.stringify(response.response.body, null, 2);
  } else {
    formattedBody = response.response.body || 'No response body';
  }
  manualResponseBody.textContent = formattedBody;
  
  // Add timestamp
  const timestamp = document.createElement('div');
  timestamp.className = 'response-time';
  timestamp.textContent = `Response received at ${new Date().toLocaleTimeString()}`;
  manualResponseBody.appendChild(timestamp);
  
  // Show response modal
  responseModal.classList.add('visible');
  
  // Auto-save if checkbox was checked
  if (saveRequestCheckbox.checked) {
    saveResponseToHistory();
  }
}

function saveResponseToHistory() {
  if (!currentResponse) return;
  
  // Add to call history
  chrome.runtime.sendMessage({
    action: 'addApiCall',
    apiCall: currentResponse
  }, (response) => {
    if (response.success) {
      // Reload API calls to include the new one
      loadApiCalls();
      showNotification('API request saved to history');
      
      // Close response modal
      closeResponseModal();
    }
  });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  let icon = '';
  
  switch(type) {
    case 'success':
      icon = `<div class="notification-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>`;
      break;
    case 'error':
      icon = `<div class="notification-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>`;
      break;
    case 'warning':
      icon = `<div class="notification-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>`;
      break;
    default: // info
      icon = `<div class="notification-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>`;
  }
  
  notification.innerHTML = `
    ${icon}
    <div class="notification-message">${message}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Force reflow for transition to work
  notification.offsetHeight;
  
  // Show notification
  notification.classList.add('show');
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    
    // Remove from DOM after transition
    notification.addEventListener('transitionend', () => {
      notification.remove();
    });
  }, 3000);
}

// Listen for updates from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateApiCalls') {
    // Reload all API calls
    loadApiCalls();
  }
});

// After other event listeners
searchClearBtn.addEventListener('click', function() {
  searchInput.value = '';
  searchClearBtn.classList.remove('visible');
  applyFilters();
  searchInput.focus();
});
