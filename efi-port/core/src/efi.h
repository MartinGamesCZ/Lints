#ifndef EFI_H
#define EFI_H

#include <stdint.h>

// Taken from: https://github.com/AndreVallestero/minimal-efi/blob/master/main.c
typedef struct EfiTableHeader {
    uint64_t  signature;
    uint32_t  revision;
    uint32_t  headerSize;
    uint32_t  crc32;
    uint32_t  reserved;
} EfiTableHeader;

struct EfiSimpleTextOutputProtocol;
typedef uint64_t (__attribute__((ms_abi)) *EfiTextReset)(struct EfiSimpleTextOutputProtocol* this, uint8_t ExtendedVerification);
typedef uint64_t (__attribute__((ms_abi)) *EfiTextString)(struct EfiSimpleTextOutputProtocol* this, uint16_t* string);
typedef uint64_t (__attribute__((ms_abi)) *EfiTextSetAttribute)(struct EfiSimpleTextOutputProtocol* this, uint64_t Attribute);
typedef uint64_t (__attribute__((ms_abi)) *EfiTextClearScreen)(struct EfiSimpleTextOutputProtocol* this);

typedef struct EfiSimpleTextOutputProtocol {
    EfiTextReset        reset;
    EfiTextString       output_string;
    uint64_t            test_string;
    uint64_t            query_mode;
    uint64_t            set_mode;
    EfiTextSetAttribute set_attribute;
    EfiTextClearScreen  clear_screen;
    uint64_t            set_cursor_position;
    uint64_t            enable_cursor;
    uint64_t            mode;
} EfiSimpleTextOutputProtocol;

typedef struct EfiSystemTable {
    EfiTableHeader               hdr;
    uint16_t*                    firmwareVendor;
    uint32_t                     firmwareRevision;
    void*                        consoleInHandle;
    uint64_t                     conIn;
    void*                        consoleOutHandle;
    EfiSimpleTextOutputProtocol* conOut;
    void*                        standardErrorHandle;
    uint64_t                     stdErr;
    uint64_t                     runtimeServices;
    uint64_t                     bootServices;
    uint64_t                     numberOfTableEntries;
    uint64_t                     configurationTable;
} EfiSystemTable;

#endif
