__oskrnl.input_onKeyPress(__oskrnl_procd_pid, function (key) {
  if (key == __oskrnl.app_proc_getArgs(__oskrnl_procd_pid)[0].toUpperCase()) {
    __oskrnl.app_proc_exit(__oskrnl_procd_pid);
    return;
  }
});
