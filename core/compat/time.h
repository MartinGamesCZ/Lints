#ifndef COMPAT_TIME_H
#define COMPAT_TIME_H

#ifndef MDE_CPU_X64
#define MDE_CPU_X64
#endif
#include <Base.h>
#include_next <time.h>

double difftime(time_t time1, time_t time0);


#endif
