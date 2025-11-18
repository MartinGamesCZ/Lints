/*
 * Minimal system stubs for freestanding picolibc
 */

#include <sys/types.h>
#include <sys/time.h>
#include <errno.h>

/* Exit function - halt the system */
void _exit(int status)
{
  (void)status;
  /* Halt the CPU */
  while (1)
  {
    __asm__ volatile("hlt");
  }
}

/* Get time of day - not supported in freestanding */
int gettimeofday(struct timeval *tv, void *tz)
{
  (void)tz;
  if (tv)
  {
    tv->tv_sec = 0;
    tv->tv_usec = 0;
  }
  return 0;
}

/* Sbrk - memory allocation (picolibc uses __heap_start and __heap_end from linker script) */
/* No need to implement sbrk as picolibc uses the linker symbols directly */
