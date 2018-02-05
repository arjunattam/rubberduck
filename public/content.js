console.log("hello world from content.js");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Do something with the message!
  console.log("received", request.greeting);

  // And respond back to the sender.
  sendResponse("got your message, thanks!");
});
