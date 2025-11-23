__oskrnl.console_log("> ");

var input = "";
var pid = "";

__oskrnl.input_onKeyPress(__oskrnl_procd_pid, function (key) {
  if (pid != "" && __oskrnl.app_proc_running(pid)) return;

  if (key == "Backspace") input = input.slice(0, -1);
  else if (key == "Enter") {
    process();
    return;
  } else input += key.toLowerCase();

  __oskrnl.console_update("> " + input);
});

function process() {
  var app = input.split(" ")[0];
  var args = input.split(" ").slice(1);
  pid = __oskrnl.app_launcher_run(app, args.join(" "));
  __oskrnl.app_proc_addExitListener(pid, function () {
    input = "";
    __oskrnl.console_log("> ");
  });

  if (!__oskrnl.app_proc_running(pid)) {
    input = "";
    __oskrnl.console_log("> ");
  }
}
