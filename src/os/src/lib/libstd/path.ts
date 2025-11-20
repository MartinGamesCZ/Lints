export const Path = {
  dirname(p: string): string {
    const parts = p.split("/");

    parts.pop();

    if (parts.length <= 1) return "/";

    return parts.join("/");
  },
  filename(p: string): string {
    const parts = p.split("/");

    const n = parts.pop();

    if (!n) return "";
    return n;
  },
  join(p1: string, p2: string): string {
    if (p1.endsWith("/")) {
      p1 = p1.slice(0, -1);
    }

    if (p2.startsWith("/")) {
      p2 = p2.slice(1);
    }

    return p1 + "/" + p2;
  },
};
