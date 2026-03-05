
export const BOARD = [
  ["e","e","e","e","e","e","e","e","e", "e"],
  ["e","e","e","e","e","e","e","e","e", "e"],
  ["e","e","e","e","e","e","e","e","e", "e"],
  ["e","e","e","e","e","e","e","e","e", "e"],
  ["e","e","e","e","x","x","e","e","e", "e"],
  ["e","e","e","e","x","x","e","e","e", "e"],
  ["e","e","e","e","e","e","e","e","e", "e"],
  ["e","e","e","e","e","e","e","e","e", "e"],
  ["e","e","e","e","e","e","e","e","e", "e"],
  ["e","e","e","e","e","e","e","e","e", "e"],
]

export type TileType = "e" | "x";
export type Board = TileType[][];