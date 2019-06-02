export function sanitizeNick(nick: string) {
  const sanitized = nick.replace(/[^-_0-9a-zA-Z]/g, "").trim();
  return sanitized.substr(0, Math.min(20, sanitized.length));
}
