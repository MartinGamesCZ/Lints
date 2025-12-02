//---------------------------------------------------------------
//
//  !!! AI GENERATE SLOP, PLEASE FIX !!!
//
//---------------------------------------------------------------

#ifndef _TIME_H
#define _TIME_H

#include <stddef.h>

typedef long time_t;

struct tm {
    int tm_sec;
    int tm_min;
    int tm_hour;
    int tm_mday;
    int tm_mon;
    int tm_year;
    int tm_wday;
    int tm_yday;
    int tm_isdst;
};

time_t time(time_t *t);
struct tm *gmtime(const time_t *timep);
struct tm *localtime(const time_t *timep);
time_t mktime(struct tm *tm);

#endif
