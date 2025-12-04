export class Path {
  static dirname(path: string) {
    return path.split("/").slice(0, -1).join("/");
  }

  static filename(path: string) {
    return path.split("/").pop()!;
  }

  static join(...paths: string[]) {
    return paths.join("/");
  }
}
