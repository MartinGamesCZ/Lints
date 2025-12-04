import { Logger } from "../../../lib/logger";
import type { FileSystem } from "../../filesystem/fs/fs";
import { KernelModule } from "../kmod";

export class VFSKModule extends KernelModule {
  static instance: VFSKModule = new this();

  #mounts: Map<string, FileSystem> = new Map();

  constructor() {
    super("vfs");
  }

  static init() {
    VFSKModule.instance.init();
  }

  mount(fs: FileSystem, mountPoint: string) {
    if (!this.initialized) return;

    Logger.log(`[VFS] Mounting ${fs.id} at ${mountPoint}`);
    this.#mounts.set(mountPoint, fs);
  }

  #resolveMount(path: string) {
    const parts = path.split("/");

    for (let i = 0; i < parts.length; i++) {
      const mountPoint = parts.slice(0, i + 1).join("/");

      if (this.#mounts.has(mountPoint))
        return {
          fs: this.#mounts.get(mountPoint)!,
          path: parts.slice(i + 1).join("/"),
        };
    }

    return null;
  }

  mkdir(path: string) {
    const mount = this.#resolveMount(path);
    if (!mount) return;

    mount.fs.mkdir(mount.path);
  }

  ls(path: string) {
    const mount = this.#resolveMount(path);
    if (!mount) return;

    return mount.fs.ls(mount.path);
  }

  createFile(path: string) {
    const mount = this.#resolveMount(path);
    if (!mount) return;

    mount.fs.createFile(mount.path);
  }

  writeFile(path: string, content: string) {
    const mount = this.#resolveMount(path);
    if (!mount) return;

    mount.fs.writeFile(mount.path, content);
  }

  readFile(path: string) {
    const mount = this.#resolveMount(path);
    if (!mount) return;

    return mount.fs.readFile(mount.path);
  }

  remove(path: string) {
    const mount = this.#resolveMount(path);
    if (!mount) return;

    mount.fs.remove(mount.path);
  }

  stat(path: string) {
    const mount = this.#resolveMount(path);
    if (!mount) return;

    return mount.fs.stat(mount.path);
  }
}
