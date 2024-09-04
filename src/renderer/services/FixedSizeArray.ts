export class FixedSizeArray<T> {
  private size: number;
  private array: T[];

  constructor(size: number) {
    this.size = size;
    this.array = [];
  }

  push(item: T): void {
    if (this.array.length >= this.size) {
      this.array.shift(); // Remove the first item if the array is full
    }
    this.array.push(item); // Add the new item to the end
  }

  slice(start?: number, end?: number): T[] {
    return this.array.slice(start, end);
  }

  get(index: number): T | undefined {
    if (index >= 0 && index < this.array.length) {
      return this.array[index];
    }
    return undefined; // Return undefined if the index is out of bounds
  }

  getArray(): T[] {
    return this.array;
  }

  setArray(newArray: T[]): void {
    if (newArray.length > this.size) {
      this.array = newArray.slice(-this.size); // Keep only the last `size` elements
    } else {
      this.array = newArray;
    }
  }
}
