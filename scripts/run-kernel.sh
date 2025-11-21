./scripts/build.sh

# Create disk image if it doesn't exist
if [ ! -f hdd.img ]; then
  echo "Creating disk image..."
  qemu-img create -f raw hdd.img 10M
  
  # Create a proper MBR partition table with one FAT32 partition
  # Using fdisk commands
  (
    echo o      # Create new DOS partition table
    echo n      # New partition
    echo p      # Primary partition
    echo 1      # Partition number 1
    echo        # Default first sector
    echo        # Default last sector (use all space)
    echo t      # Change partition type
    echo c      # FAT32 LBA
    echo a      # Make bootable
    echo w      # Write changes
  ) | fdisk hdd.img >/dev/null 2>&1
  
  # Format the partition as FAT32
  # First, get the partition offset using sfdisk
  OFFSET=$(sfdisk -l hdd.img 2>/dev/null | grep 'hdd.img1' | awk '{print $2}')
  
  # Check if OFFSET is empty or non-numeric and set default if needed
  if [ -z "$OFFSET" ] || ! [[ "$OFFSET" =~ ^[0-9]+$ ]]; then
    OFFSET=2048  # Default first sector for most partition tables
  fi
  
  # Create FAT32 filesystem on the partition
  echo "Formatting partition as FAT32..."
  mkfs.vfat -F 32 -n "TESTDISK" --offset $OFFSET hdd.img
  
  echo "Disk image created with FAT32 partition"
fi

# Get the partition offset for file operations
OFFSET=$(sfdisk -l hdd.img 2>/dev/null | grep 'hdd.img1' | awk '{print $2}')
if [ -z "$OFFSET" ] || ! [[ "$OFFSET" =~ ^[0-9]+$ ]]; then
  OFFSET=2048
fi

# Copy test-hdd contents into the disk image
if [ -d "test-hdd" ]; then
  echo "Copying test-hdd contents to disk image..."
  
  # Use mcopy to copy files to the FAT32 partition
  MTOOLS_SKIP_CHECK=1 mcopy -i hdd.img@@$((OFFSET * 512)) -s test-hdd/* :: || {
    echo "Warning: mcopy failed, retrying individual files..."
    for file in test-hdd/*; do
      if [ -f "$file" ]; then
        MTOOLS_SKIP_CHECK=1 mcopy -i hdd.img@@$((OFFSET * 512)) "$file" :: && echo "Copied $(basename "$file")"
      fi
    done
  }
fi

# Create CD-ROM image if it doesn't exist
if [ ! -f cdrom.iso ]; then
    mkdir -p /tmp/cdrom_content
    echo "Test CD-ROM" > /tmp/cdrom_content/readme.txt
    genisoimage -o cdrom.iso -V "TESTCD" -r -J /tmp/cdrom_content 2>/dev/null || touch cdrom.iso
fi

qemu-system-i386 -serial stdio -kernel "build/out/kernel" \
  -drive file=hdd.img,if=ide,format=raw,index=0,media=disk \
  -drive file=cdrom.iso,if=ide,format=raw,index=1,media=cdrom