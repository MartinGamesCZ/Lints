import { Logger } from "../../../lib/logger";
import { FSEntity } from "./entity";

export class FileSystem {
  #id: string;
  #root: FSEntity;

  constructor(id: string) {
    this.#id = id;

    this.#root = new FSEntity("", "/", 0, "d", []);
  }

  get id() {
    return this.#id;
  }

  protected getEntity(path: string) {
    if (path === "/") return this.#root;

    const parts = path.split("/");
    let entity = this.#root;

    for (let i = 1; i < parts.length; i++) {
      if (!entity.content || entity.content.length === 0) return null;
      if (entity.type !== "d") return null;

      entity = (entity.content as FSEntity[]).find((e) => e.name === parts[i])!;
    }

    return entity;
  }

  mkdir(path: string) {
    throw new Error("FS::Mkdir Not implemented");
  }

  ls(path: string) {
    throw new Error("FS::Ls Not implemented");
  }

  readFile(path: string) {
    throw new Error("FS::ReadFile Not implemented");
  }

  writeFile(path: string, content: string) {
    throw new Error("FS::WriteFile Not implemented");
  }

  createFile(path: string) {
    throw new Error("FS::CreateFile Not implemented");
  }

  remove(path: string) {
    throw new Error("FS::Remove Not implemented");
  }

  stat(path: string) {
    throw new Error("FS::Stat Not implemented");
  }
}
