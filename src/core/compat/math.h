//---------------------------------------------------------------
//
//  !!! AI GENERATE SLOP, PLEASE FIX !!!
//
//---------------------------------------------------------------

#ifndef _MATH_H
#define _MATH_H

#define NAN (__builtin_nan(""))
#define INFINITY (__builtin_inf())
#define signbit(x) __builtin_signbit(x)

double floor(double x);
double ceil(double x);
double fabs(double x);
double modf(double x, double *iptr);
double fmod(double x, double y);
double sqrt(double x);
double pow(double x, double y);
double log(double x);
double exp(double x);
double sin(double x);
double cos(double x);
double tan(double x);
int isnan(double x);
int isinf(double x);
int isfinite(double x);
double trunc(double x);
double fmin(double x, double y);
double fmax(double x, double y);
double hypot(double x, double y);
double acos(double x);
double asin(double x);
double atan(double x);
double atan2(double y, double x);
double cbrt(double x);
double cosh(double x);
double expm1(double x);
double log1p(double x);
double log2(double x);
double log10(double x);
double sinh(double x);
double tanh(double x);
double asinh(double x);
double acosh(double x);
double atanh(double x);
double round(double x);
long int lrint(double x);

#endif
