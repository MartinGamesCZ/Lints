#!/bin/bash

set -e  # Exit on error

VM_NAME="LintsOS"
DISK_IMG="${1:-out/fat.img}"

# Remove existing VM if it exists
if VBoxManage list vms | grep -q "\"${VM_NAME}\""; then
    VBoxManage unregistervm ${VM_NAME} --delete 2>/dev/null || true
fi

# Remove old VDI if it exists
if [ -f "uefi-disk.vdi" ]; then
    rm -f uefi-disk.vdi
fi

VBoxManage createvm --name "${VM_NAME}" --ostype "Other_64" --register

VBoxManage modifyvm "${VM_NAME}" \
    --memory 512 \
    --vram 16 \
    --cpus 1 \
    --firmware efi \
    --boot1 disk \
    --boot2 none \
    --boot3 none \
    --boot4 none \
    --graphicscontroller vmsvga \
    --mouse usbtablet

VBoxManage storagectl "${VM_NAME}" \
    --name "SATA Controller" \
    --add sata \
    --controller IntelAhci \
    --portcount 1 \
    --bootable on

VBoxManage convertfromraw ${DISK_IMG} out/test-disk.vdi --format VDI

VBoxManage storageattach "${VM_NAME}" \
    --storagectl "SATA Controller" \
    --port 0 \
    --device 0 \
    --type hdd \
    --medium out/test-disk.vdi

# Start the VM
VBoxManage startvm "${VM_NAME}"
