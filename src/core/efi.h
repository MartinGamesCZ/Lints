#ifndef EFI_H
#define EFI_H
#define NULL ((void*)0)

// EFI definitions
typedef uint64_t EFI_STATUS;
typedef void* EFI_HANDLE;
#define EFI_SUCCESS 0

typedef struct {
    uint64_t signature;
    uint32_t revision;
    uint32_t headerSize;
    uint32_t crc32;
    uint32_t reserved;
} EFI_TABLE_HEADER;

struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL;
typedef EFI_STATUS (*EFI_TEXT_STRING)(
    struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *This,
    uint16_t *String
);

typedef EFI_STATUS (*EFI_TEXT_CLEAR_SCREEN)(
    struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *This
);

typedef struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL {
    void *reset;
    EFI_TEXT_STRING OutputString;
    void *testString;
    void *queryMode;
    void *setMode;
    void *setAttribute;
    EFI_TEXT_CLEAR_SCREEN ClearScreen;
    void *setCursorPosition;
    void *enableCursor;
    void *mode;
} EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL;

typedef struct EFI_SYSTEM_TABLE {
    EFI_TABLE_HEADER hdr;
    uint16_t *firmwareVendor;
    uint32_t firmwareRevision;
    void *consoleInHandle;
    void *conIn;
    void *consoleOutHandle;
    EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *ConOut;
    void *standardErrorHandle;
    void *stdErr;
    void *runtimeServices;
    void *bootServices;
    uint64_t numberOfTableEntries;
    void *configurationTable;
} EFI_SYSTEM_TABLE;
#endif
