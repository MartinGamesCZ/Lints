__oskrnl.console_log("> ");

var input = "";
var inputActive = true;

__oskrnl.input_onKeyPress(function (key) {
  if (!inputActive) return;

  if (key == "Backspace") input = input.slice(0, -1);
  else if (key == "Enter") {
    inputActive = false;
    process();
    return;
  } else input += key.toLowerCase();

  __oskrnl.console_update("> " + input);
});

function process() {
  var app = input.split(" ")[0];
  var args = input.split(" ").slice(1);
  __oskrnl.app_launcher_run(app, args.join(" "));
}
