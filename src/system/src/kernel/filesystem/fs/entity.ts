export class FSEntity {
  #name: string;
  #path: string;
  #size: number;
  #type: "d" | "f";
  #content: string | string[] | FSEntity[];

  constructor(
    name: string,
    path: string,
    size: number,
    type: "d" | "f",
    content: string | string[] | FSEntity[]
  ) {
    this.#name = name;
    this.#path = path;
    this.#size = size;
    this.#type = type;
    this.#content = content;
  }

  get name() {
    return this.#name;
  }

  get path() {
    return this.#path;
  }

  get size() {
    return this.#size;
  }

  get type() {
    return this.#type;
  }

  get content() {
    return this.#content;
  }

  set content(content: string | string[] | FSEntity[]) {
    this.#content = content;
    this.#size =
      this.#type == "d"
        ? 0
        : content instanceof Array
        ? this.#content.length
        : this.#content.length;
  }
}
