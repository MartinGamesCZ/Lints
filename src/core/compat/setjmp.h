//---------------------------------------------------------------
//
//  !!! AI GENERATE SLOP, PLEASE FIX !!!
//
//---------------------------------------------------------------

#ifndef _SETJMP_H
#define _SETJMP_H

#include <stdint.h>

// x86_64 jmp_buf: rbx, rbp, r12, r13, r14, r15, rsp, rip
typedef uint64_t jmp_buf[8];

int setjmp(jmp_buf env);
void longjmp(jmp_buf env, int val);

#endif
