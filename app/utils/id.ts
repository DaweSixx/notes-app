// crypto.randomUUID is unavailable on plain http (e.g. the Docker build opened by LAN IP)
export function createId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
