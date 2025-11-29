#ifndef COMPAT_MATH_H
#define COMPAT_MATH_H

#define HUGE_VAL (__builtin_huge_val())
#define NAN (__builtin_nan(""))
#define INFINITY (__builtin_inf())

double fabs(double x);
double floor(double x);
double ceil(double x);
double fmod(double x, double y);
double pow(double x, double y);
double sqrt(double x);
double sin(double x);
double cos(double x);
double tan(double x);
double asin(double x);
double acos(double x);
double atan(double x);
double atan2(double y, double x);
double exp(double x);
double log(double x);
double log10(double x);
double cbrt(double x);
double log2(double x);
double trunc(double x);


#endif
