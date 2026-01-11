// random.ts

/**
 * Returns a random element from the given array.
 * @param arr - The array to get a random element from.
 * @returns A random element from the array.
 */
export function getRandomElement<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined; // handle empty array
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}
