/*
 * link.ld
 */

OUTPUT_FORMAT(elf32-i386)
ENTRY(start)
SECTIONS
{
	. = 0x100000;
	
	.text : {
		*(.text)
		*(.text.*)
		*(.rodata)
		*(.rodata.*)
	}
	
	.data : {
		*(.data)
		*(.data.*)
	}
	
	.bss : {
		*(.bss)
		*(.bss.*)
		*(COMMON)
	}
	
	/* Heap for malloc */
	. = ALIGN(4096);
	__heap_start = .;
	. = . + 0x100000; /* 1MB heap */
	__heap_end = .;
	
	/* Stack grows downward from high memory */
	. = ALIGN(4096);
	__stack_bottom = .;
	. = . + 0x10000; /* 64KB stack */
	__stack_top = .;
}