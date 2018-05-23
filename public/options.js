// Saves options to chrome.storage
function save_options() {
  chrome.storage.sync.set(
    {
      hasHoverDebug: document.getElementById("debug").checked,
      hasMenuApp: document.getElementById("menu").checked,
      defaultPort: document.getElementById("port").value
    },
    function() {
      // Update status to let user know options were saved.
      var status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(function() {
        status.textContent = "";
      }, 750);
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get(
    {
      // Default values
      hasHoverDebug: false,
      hasMenuApp: false,
      defaultPort: 8000
    },
    function(items) {
      document.getElementById("debug").checked = items.hasHoverDebug;
      document.getElementById("menu").checked = items.hasMenuApp;
      document.getElementById("port").value = items.defaultPort;
    }
  );
}
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
