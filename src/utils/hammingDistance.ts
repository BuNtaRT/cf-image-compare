/**
 * Computes Hamming distance between two hex strings
 * @param hash1 First hash in hex format
 * @param hash2 Second hash in hex format
 * @returns Hamming distance (number of differing bits)
 */
export function calculateHammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    throw new Error("Hashes must have the same length");
  }

  const binary1 = hexToBinary(hash1);
  const binary2 = hexToBinary(hash2);

  let distance = 0;
  for (let i = 0; i < binary1.length; i++) {
    if (binary1[i] !== binary2[i]) {
      distance++;
    }
  }

  return distance;
}

/**
 * Converts hex string to binary string
 * @param hex Hex string
 * @returns Binary string
 */
function hexToBinary(hex: string): string {
  let binary = "";
  for (let i = 0; i < hex.length; i++) {
    const char = hex[i];
    const decimal = parseInt(char, 16);
    const binaryChar = decimal.toString(2).padStart(4, "0");
    binary += binaryChar;
  }
  return binary;
}
