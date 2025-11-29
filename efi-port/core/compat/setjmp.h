#ifndef COMPAT_SETJMP_H
#define COMPAT_SETJMP_H

typedef void *jmp_buf[5];

#define setjmp(env)   __builtin_setjmp(env)
#define longjmp(env, val) __builtin_longjmp(env, val)

#endif
