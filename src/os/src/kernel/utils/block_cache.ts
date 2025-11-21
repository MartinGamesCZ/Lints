interface Block {
  key: number;
  hashNext: Block | null;
  freeNext: Block | null;
  freePrev: Block | null;
  payload: number[]; // Array instead of Uint8Array
}

interface BlockCacheState {
  payloadSize: number;
  blocks: number;
  hashTable: (Block | null)[];
  blocksMemory: Block[];
  front: Block | null;
  rear: Block | null;
}

export function blockCache_create(): BlockCacheState {
  return {
    payloadSize: 0,
    blocks: 0,
    hashTable: [],
    blocksMemory: [],
    front: null,
    rear: null,
  };
}

export function blockCache_init(
  state: BlockCacheState,
  payloadSize: number,
  blocks: number
): void {
  state.payloadSize = payloadSize;
  state.blocks = blocks;

  // Initialize hash table (2x the number of blocks)
  var hashTableSize = blocks * 2;
  state.hashTable = [];
  for (var i = 0; i < hashTableSize; i++) {
    state.hashTable.push(null);
  }

  // Allocate blocks in memory
  state.blocksMemory = [];
  var previous: Block | null = null;

  for (var i = 0; i < blocks; i++) {
    var payload: number[] = [];
    for (var j = 0; j < payloadSize; j++) {
      payload.push(0);
    }

    var block: Block = {
      key: 0,
      hashNext: null,
      freeNext: null,
      freePrev: previous,
      payload: payload,
    };

    if (previous) {
      previous.freeNext = block;
    }

    state.blocksMemory.push(block);
    previous = block;
  }

  state.front = state.blocksMemory[0];
  state.rear = previous;
}

export function blockCache_blockIfPresent(
  state: BlockCacheState,
  deviceOrKey: number,
  sector?: number
): number[] | null {
  var origKey =
    sector !== undefined ? deviceOrKey * 65536 + sector : deviceOrKey;

  var key = origKey % (state.blocks * 2);

  if (state.hashTable[key]) {
    var entry = state.hashTable[key];

    while (entry) {
      if (entry.key === origKey) {
        return entry.payload;
      }
      entry = entry.hashNext;
    }
  }

  return null;
}

export function blockCache_block(
  state: BlockCacheState,
  deviceOrKey: number,
  sectorOrValid: number | { valid: boolean },
  valid?: { valid: boolean }
): number[] {
  var origKey: number;
  var validRef: { valid: boolean };

  if (valid !== undefined) {
    // block(state, device, sector, valid)
    origKey = deviceOrKey * 65536 + (sectorOrValid as number);
    validRef = valid;
  } else {
    // block(state, key, valid)
    origKey = deviceOrKey;
    validRef = sectorOrValid as { valid: boolean };
  }

  var key = origKey % (state.blocks * 2);

  // Try to get from hash table
  var direct = blockCache_blockIfPresent(state, origKey);
  if (direct) {
    validRef.valid = true;
    return direct;
  }

  // Allocate new block from front of free list
  validRef.valid = false;

  if (!state.front) {
    throw new Error("No free blocks available");
  }

  var blk = state.front;

  // Remove block from previous hash table entry if it was used
  if (blk.key) {
    var previousKey = blk.key % (state.blocks * 2);

    if (state.hashTable[previousKey] === blk) {
      state.hashTable[previousKey] = blk.hashNext;
    } else {
      var entry = state.hashTable[previousKey];
      var found = false;

      while (entry && entry.hashNext) {
        if (entry.hashNext === blk) {
          entry.hashNext = blk.hashNext;
          found = true;
          break;
        }
        entry = entry.hashNext;
      }

      if (!found) {
        throw new Error("The hash table chain did not contain the used block");
      }
    }
  }

  // Insert block into hash table
  blk.key = origKey;

  if (!state.hashTable[key]) {
    blk.hashNext = null;
    state.hashTable[key] = blk;
  } else {
    // Insert at end of chain
    var entry = state.hashTable[key]!;

    while (entry.hashNext) {
      entry = entry.hashNext;
    }

    entry.hashNext = blk;
    blk.hashNext = null;
  }

  // Move block to rear of free list
  state.front = state.front.freeNext;
  if (state.front) {
    state.front.freePrev = null;
  }

  if (state.rear) {
    state.rear.freeNext = blk;
  }
  blk.freePrev = state.rear;
  blk.freeNext = null;
  state.rear = blk;

  return blk.payload;
}
