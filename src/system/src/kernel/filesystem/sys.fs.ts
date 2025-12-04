import { Logger } from "../../lib/logger";
import { Path } from "../../lib/path";
import { FSEntity } from "./fs/entity";
import { FileSystem } from "./fs/fs";

export class SysFS extends FileSystem {
  static instance: SysFS = new this();

  constructor() {
    super("sysfs");
  }

  override mkdir(path: string): void {
    throw new Error("SysFS::Mkdir sysfs is read-only");
  }

  public pMkdir(path: string): void {
    const parent = this.getEntity(Path.dirname(path));
    if (!parent || parent.type !== "d") return;

    (parent.content as FSEntity[]).push(
      new FSEntity(Path.filename(path), path, 0, "d", [])
    );
  }

  public pWriteFile(path: string, content: string): void {
    const parent = this.getEntity(Path.dirname(path));
    if (!parent || parent.type !== "d") return;

    const existing = (parent.content as FSEntity[]).find(
      (e) => e.name === Path.filename(path)
    );
    if (existing) {
      existing.content = content;
      return;
    }

    (parent.content as FSEntity[]).push(
      new FSEntity(Path.filename(path), path, content.length, "f", content)
    );
  }

  override ls(path: string): FSEntity[] {
    const entity = this.getEntity(path);
    if (!entity || entity.type !== "d") return [];

    return entity.content as FSEntity[];
  }

  override createFile(path: string): void {
    throw new Error("SysFS::CreateFile sysfs is read-only");
  }

  override writeFile(path: string, content: string): void {
    throw new Error("SysFS::WriteFile sysfs is read-only");
  }

  override readFile(path: string): string {
    const entity = this.getEntity(path);
    if (!entity || entity.type !== "f") return "";

    return entity.content as string;
  }

  override remove(path: string): void {
    throw new Error("SysFS::Remove sysfs is read-only");
  }

  override stat(path: string): FSEntity | null {
    const entity = this.getEntity(path);
    if (!entity) return null;

    return entity;
  }
}
