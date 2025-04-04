export function isValidAddress(address: string): boolean {
  if (typeof address !== 'string') {
    return false;
  }

  if (!address.startsWith('0x') || address.length !== 42) {
    return false;
  }

  const hexPart = address.slice(2);
  const hexRegex = /^[0-9a-fA-F]+$/;

  return hexRegex.test(hexPart);
}
