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
	
	/* Stack grows downward from high memory - place before heap */
	. = ALIGN(4096);
	__stack_bottom = .;
	. = . + 0x100000; /* 1MB stack */
	__stack_top = .;
	
	/* Heap for malloc */
	. = ALIGN(4096);
	__heap_start = .;
	. = . + 0x10000000; /* 256MB heap */
	__heap_end = .;
}