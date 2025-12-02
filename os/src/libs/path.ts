export const Path = {
  join(p1: string, p2: string): string {
    if (p1.endsWith("/")) return p1 + p2;
    else return p1 + "/" + p2;
  },
  filename(path: string): string {
    return path.split("/").pop()!;
  },
  dirname(path: string): string {
    return path.split("/").slice(0, -1).join("/");
  },
};
