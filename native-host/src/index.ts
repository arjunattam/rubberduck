const nativeMessage = require("chrome-native-messaging");

const input = new nativeMessage.Input();
const output = new nativeMessage.Output();

const transform = new nativeMessage.Transform(function(
  msg: any,
  push: any,
  done: any
) {
  // var reply = getReplyFor(msg);
  var reply = msg;

  push(reply);
  done();
});

process.stdin
  .pipe(input)
  .pipe(transform)
  .pipe(output)
  .pipe(process.stdout);
