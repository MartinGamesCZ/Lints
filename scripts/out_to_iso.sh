# Create a FAT12 image
dd if=/dev/zero of=out/fat.img bs=1k count=1440
mformat -i out/fat.img -f 1440 ::

# Create EFI directory structure
mmd -i out/fat.img ::/EFI
mmd -i out/fat.img ::/EFI/BOOT

# Copy the EFI application
mcopy -i out/fat.img out/img/EFI/BOOT/BOOTX64.EFI ::/EFI/BOOT

# Verify content
echo "Verifying FAT image content:"
mdir -i out/fat.img -/ ::

# Create the ISO
# -e specifies the boot image (the FAT image)
# -no-emul-boot is required for UEFI
xorriso -as mkisofs -R -f -e /fat.img -no-emul-boot -volid LintsEFI -o out/lints.iso out/img out/fat.img