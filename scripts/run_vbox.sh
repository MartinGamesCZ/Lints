#!/bin/bash
VM_NAME="LintsEFI"
ISO_PATH="$(pwd)/out/lints.iso"

# Check if VM exists
if VBoxManage list vms | grep -q "\"$VM_NAME\""; then
    echo "VM '$VM_NAME' already exists."
else
    echo "Creating VM '$VM_NAME'..."
    VBoxManage createvm --name "$VM_NAME" --ostype "Other_64" --register
    VBoxManage modifyvm "$VM_NAME" --memory 128 --firmware efi --graphicscontroller vmsvga
    VBoxManage storagectl "$VM_NAME" --name "IDE Controller" --add ide
fi

# Attach ISO (force unmount first just in case)
echo "Attaching ISO..."
VBoxManage storageattach "$VM_NAME" --storagectl "IDE Controller" --port 0 --device 0 --type dvddrive --medium emptydrive --forceunmount
VBoxManage storageattach "$VM_NAME" --storagectl "IDE Controller" --port 0 --device 0 --type dvddrive --medium "$ISO_PATH"

# Start VM
echo "Starting VM..."
VBoxManage startvm "$VM_NAME"
