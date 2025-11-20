bits 32		;nasm directive
section .text
	;multiboot spec
	align 4
	dd 0x1BADB002			;magic
	dd 0x00				;flags
	dd - (0x1BADB002 + 0x00)	;checksum. m+f+c should be zero

global start
extern kmain	;kmain is defined in the kernel.c file
extern __stack_top

start:
	cli  ; stop interrupts during boot
	mov esp, __stack_top
	
	; Initialize FPU (x87)
	finit  ; Initialize FPU to default state

	call kmain
	; Note: kmain will call sti to enable interrupts after IDT is set up

hang:
	hlt ; halt the CPU
	jmp hang