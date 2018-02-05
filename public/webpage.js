console.log("hello world");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Do something with the message!
  alert(request.greeting);

  // And respond back to the sender.
  sendResponse("got your message, thanks!");
});
