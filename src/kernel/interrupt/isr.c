#include "isr.h"
#include "idt.h"

/* Port I/O functions */
static inline void outb(u16 port, u8 val)
{
  __asm__ volatile("outb %0, %1" : : "a"(val), "Nd"(port));
}

static inline u8 inb(u16 port)
{
  u8 ret;
  __asm__ volatile("inb %1, %0" : "=a"(ret) : "Nd"(port));
  return ret;
}

/* PIC (Programmable Interrupt Controller) constants */
#define PIC1_COMMAND 0x20
#define PIC1_DATA 0x21
#define PIC2_COMMAND 0xA0
#define PIC2_DATA 0xA1
#define PIC_EOI 0x20

/* Array to store custom IRQ handlers */
static irq_handler_t irq_handlers[16] = {0};

/* Can't do this with a loop because we need the address
 * of the function names */
void isr_install()
{
  set_idt_gate(0, (u32)isr0);
  set_idt_gate(1, (u32)isr1);
  set_idt_gate(2, (u32)isr2);
  set_idt_gate(3, (u32)isr3);
  set_idt_gate(4, (u32)isr4);
  set_idt_gate(5, (u32)isr5);
  set_idt_gate(6, (u32)isr6);
  set_idt_gate(7, (u32)isr7);
  set_idt_gate(8, (u32)isr8);
  set_idt_gate(9, (u32)isr9);
  set_idt_gate(10, (u32)isr10);
  set_idt_gate(11, (u32)isr11);
  set_idt_gate(12, (u32)isr12);
  set_idt_gate(13, (u32)isr13);
  set_idt_gate(14, (u32)isr14);
  set_idt_gate(15, (u32)isr15);
  set_idt_gate(16, (u32)isr16);
  set_idt_gate(17, (u32)isr17);
  set_idt_gate(18, (u32)isr18);
  set_idt_gate(19, (u32)isr19);
  set_idt_gate(20, (u32)isr20);
  set_idt_gate(21, (u32)isr21);
  set_idt_gate(22, (u32)isr22);
  set_idt_gate(23, (u32)isr23);
  set_idt_gate(24, (u32)isr24);
  set_idt_gate(25, (u32)isr25);
  set_idt_gate(26, (u32)isr26);
  set_idt_gate(27, (u32)isr27);
  set_idt_gate(28, (u32)isr28);
  set_idt_gate(29, (u32)isr29);
  set_idt_gate(30, (u32)isr30);
  set_idt_gate(31, (u32)isr31);

  set_idt(); // Load with ASM
}

/* Remap the PIC to avoid conflicts with CPU exceptions */
static void pic_remap(void)
{
  // Start initialization
  outb(PIC1_COMMAND, 0x11);
  outb(PIC2_COMMAND, 0x11);

  // Set vector offsets (IRQs 0-7 -> interrupts 32-39, IRQs 8-15 -> interrupts 40-47)
  outb(PIC1_DATA, 0x20);
  outb(PIC2_DATA, 0x28);

  // Tell master PIC there's a slave PIC at IRQ2
  outb(PIC1_DATA, 0x04);
  // Tell slave PIC its cascade identity
  outb(PIC2_DATA, 0x02);

  // Set to 8086 mode
  outb(PIC1_DATA, 0x01);
  outb(PIC2_DATA, 0x01);

  // Mask all interrupts initially
  outb(PIC1_DATA, 0xFF);
  outb(PIC2_DATA, 0xFF);
}

/* Install IRQ handlers */
void irq_install()
{
  // Remap the PIC
  pic_remap();

  // Install IRQ handlers (32-47)
  set_idt_gate(32, (u32)irq0);
  set_idt_gate(33, (u32)irq1);
  set_idt_gate(34, (u32)irq2);
  set_idt_gate(35, (u32)irq3);
  set_idt_gate(36, (u32)irq4);
  set_idt_gate(37, (u32)irq5);
  set_idt_gate(38, (u32)irq6);
  set_idt_gate(39, (u32)irq7);
  set_idt_gate(40, (u32)irq8);
  set_idt_gate(41, (u32)irq9);
  set_idt_gate(42, (u32)irq10);
  set_idt_gate(43, (u32)irq11);
  set_idt_gate(44, (u32)irq12);
  set_idt_gate(45, (u32)irq13);
  set_idt_gate(46, (u32)irq14);
  set_idt_gate(47, (u32)irq15);

  set_idt(); // Reload IDT
}

/* To print the message which defines every exception */
char *exception_messages[] = {
    "Division By Zero",
    "Debug",
    "Non Maskable Interrupt",
    "Breakpoint",
    "Into Detected Overflow",
    "Out of Bounds",
    "Invalid Opcode",
    "No Coprocessor",

    "Double Fault",
    "Coprocessor Segment Overrun",
    "Bad TSS",
    "Segment Not Present",
    "Stack Fault",
    "General Protection Fault",
    "Page Fault",
    "Unknown Interrupt",

    "Coprocessor Fault",
    "Alignment Check",
    "Machine Check",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",

    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved",
    "Reserved"};

void isr_handler(registers_t *r)
{
  // Write exception to VGA memory
  char *vidmem = (char *)0xb8000;
  const char *msg = "EXCEPTION: ";
  int i = 0;

  // Clear first line
  for (i = 0; i < 80 * 2; i++)
  {
    vidmem[i] = 0;
  }

  // Write message
  i = 0;
  while (msg[i])
  {
    vidmem[i * 2] = msg[i];
    vidmem[i * 2 + 1] = 0x4F; // White on red
    i++;
  }

  // Write exception number
  vidmem[i * 2] = '0' + (r->int_no / 10);
  vidmem[i * 2 + 1] = 0x4F;
  i++;
  vidmem[i * 2] = '0' + (r->int_no % 10);
  vidmem[i * 2 + 1] = 0x4F;
  i++;

  // Write error code
  vidmem[i * 2] = ' ';
  vidmem[i * 2 + 1] = 0x4F;
  i++;
  vidmem[i * 2] = 'E';
  vidmem[i * 2 + 1] = 0x4F;
  i++;
  vidmem[i * 2] = 'R';
  vidmem[i * 2 + 1] = 0x4F;
  i++;
  vidmem[i * 2] = 'R';
  vidmem[i * 2 + 1] = 0x4F;
  i++;
  vidmem[i * 2] = ':';
  vidmem[i * 2 + 1] = 0x4F;
  i++;

  // Write error code in hex
  u32 err = r->err_code;
  for (int j = 7; j >= 0; j--)
  {
    u8 nibble = (err >> (j * 4)) & 0xF;
    vidmem[i * 2] = nibble < 10 ? '0' + nibble : 'A' + (nibble - 10);
    vidmem[i * 2 + 1] = 0x4F;
    i++;
  }

  // Write EIP
  i++;
  vidmem[i * 2] = 'E';
  vidmem[i * 2 + 1] = 0x4F;
  i++;
  vidmem[i * 2] = 'I';
  vidmem[i * 2 + 1] = 0x4F;
  i++;
  vidmem[i * 2] = 'P';
  vidmem[i * 2 + 1] = 0x4F;
  i++;
  vidmem[i * 2] = ':';
  vidmem[i * 2 + 1] = 0x4F;
  i++;

  // Write EIP in hex
  u32 eip = r->eip;
  for (int j = 7; j >= 0; j--)
  {
    u8 nibble = (eip >> (j * 4)) & 0xF;
    vidmem[i * 2] = nibble < 10 ? '0' + nibble : 'A' + (nibble - 10);
    vidmem[i * 2 + 1] = 0x4F;
    i++;
  }

  // Halt
  __asm__ volatile("cli; hlt");
  while (1)
    ;
}

/* IRQ handler */
void irq_handler(registers_t *r)
{
  // Calculate IRQ number (interrupts 32-47 map to IRQ 0-15)
  u8 irq_no = r->int_no - 32;

  // Handle spurious IRQ7 (from master PIC)
  if (irq_no == 7)
  {
    // Read In-Service Register (ISR)
    outb(PIC1_COMMAND, 0x0B);
    u8 isr = inb(PIC1_COMMAND);
    if (!(isr & 0x80))
    {
      // Spurious interrupt, don't send EOI
      return;
    }
  }

  // Handle spurious IRQ15 (from slave PIC)
  if (irq_no == 15)
  {
    // Read In-Service Register (ISR) of slave PIC
    outb(PIC2_COMMAND, 0x0B);
    u8 isr = inb(PIC2_COMMAND);
    if (!(isr & 0x80))
    {
      // Spurious interrupt from slave, send EOI to master only
      outb(PIC1_COMMAND, PIC_EOI);
      return;
    }
  }

  // Call custom handler if registered
  if (irq_handlers[irq_no] != 0)
  {
    irq_handlers[irq_no](r);
  }

  // Send EOI to PIC
  if (r->int_no >= 40)
  {
    // IRQ came from slave PIC, send EOI to both
    outb(PIC2_COMMAND, PIC_EOI);
  }
  outb(PIC1_COMMAND, PIC_EOI);
}

/* Register a custom IRQ handler */
void irq_register_handler(u8 irq, irq_handler_t handler)
{
  if (irq < 16)
  {
    irq_handlers[irq] = handler;

    // Unmask the IRQ on the PIC
    u16 port;
    u8 value;

    if (irq < 8)
    {
      port = PIC1_DATA;
    }
    else
    {
      port = PIC2_DATA;
      irq -= 8;
    }

    value = inb(port) & ~(1 << irq);
    outb(port, value);
  }
}