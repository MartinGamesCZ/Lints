#ifndef EFI_H
#define EFI_H

#include <stdint.h>

#define NULL ((void*)0)

// Basic Types
typedef uint64_t UINT64;
typedef uint32_t UINT32;
typedef uint16_t UINT16;
typedef uint8_t  UINT8;
typedef uintptr_t UINTN;
typedef intptr_t  INTN;
typedef void     VOID;

typedef uint64_t EFI_STATUS;
typedef void* EFI_HANDLE;

#define EFI_SUCCESS 0
#define EFI_ERROR(status) (((INTN)(status)) < 0)

typedef struct {
    UINT32  Data1;
    UINT16  Data2;
    UINT16  Data3;
    UINT8   Data4[8];
} EFI_GUID;

typedef struct {
    uint64_t signature;
    uint32_t revision;
    uint32_t headerSize;
    uint32_t crc32;
    uint32_t reserved;
} EFI_TABLE_HEADER;

// Simple Text Output Protocol
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

// Boot Services
typedef struct {
    EFI_TABLE_HEADER Hdr;
    void *RaiseTPL;
    void *RestoreTPL;
    void *AllocatePages;
    void *FreePages;
    void *GetMemoryMap;
    void *AllocatePool;
    void *FreePool;
    void *CreateEvent;
    void *SetTimer;
    void *WaitForEvent;
    void *SignalEvent;
    void *CloseEvent;
    void *CheckEvent;
    void *InstallProtocolInterface;
    void *ReinstallProtocolInterface;
    void *UninstallProtocolInterface;
    void *HandleProtocol;
    void *Reserved;
    void *RegisterProtocolNotify;
    void *LocateHandle;
    void *LocateDevicePath;
    void *InstallConfigurationTable;
    void *LoadImage;
    void *StartImage;
    void *Exit;
    void *UnloadImage;
    void *ExitBootServices;
    void *GetNextMonotonicCount;
    void *Stall;
    void *SetWatchdogTimer;
    void *ConnectController;
    void *DisconnectController;
    void *OpenProtocol;
    void *CloseProtocol;
    void *OpenProtocolInformation;
    void *ProtocolsPerHandle;
    void *LocateHandleBuffer;
    EFI_STATUS (*LocateProtocol)(EFI_GUID *Protocol, void *Registration, void **Interface);
    void *InstallMultipleProtocolInterfaces;
    void *UninstallMultipleProtocolInterfaces;
    void *CalculateCrc32;
    void *CopyMem;
    void *SetMem;
    void *CreateEventEx;
} EFI_BOOT_SERVICES;

// PCI Root Bridge IO Protocol
#define EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_GUID \
    { 0x2f707ebb, 0x4a1a, 0x11d4, {0x9a, 0x38, 0x00, 0x90, 0x27, 0x3f, 0xc1, 0x4d} }

typedef enum {
  EfiPciWidthUint8,
  EfiPciWidthUint16,
  EfiPciWidthUint32,
  EfiPciWidthUint64,
  EfiPciWidthFifoUint8,
  EfiPciWidthFifoUint16,
  EfiPciWidthFifoUint32,
  EfiPciWidthFifoUint64,
  EfiPciWidthFillUint8,
  EfiPciWidthFillUint16,
  EfiPciWidthFillUint32,
  EfiPciWidthFillUint64,
  EfiPciWidthMaximum
} EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_WIDTH;

typedef struct _EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL;

typedef
EFI_STATUS
(*EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_IO_MEM) (
  EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL  *This,
  EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_WIDTH  Width,
  UINT64                                 Address,
  UINTN                                  Count,
  VOID                                   *Buffer
  );

typedef struct {
  EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_IO_MEM  Read;
  EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_IO_MEM  Write;
} EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_ACCESS;

struct _EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL {
  void *ParentHandle;
  void *PollMem;
  void *PollIo;
  EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_ACCESS Mem;
  EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_ACCESS Io;
  EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_ACCESS Pci;
  void *CopyMem;
  void *Map;
  void *Unmap;
  void *AllocateBuffer;
  void *FreeBuffer;
  void *Flush;
  void *GetAttributes;
  void *SetAttributes;
  void *Configuration;
  UINT32 SegmentNumber;
};

// System Table
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
    EFI_BOOT_SERVICES *BootServices;
    uint64_t numberOfTableEntries;
    void *configurationTable;
} EFI_SYSTEM_TABLE;

#endif
