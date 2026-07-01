export class DuplicateAlbumError extends Error {
  existingId: string

  constructor(existingId: string) {
    super("Cet album est déjà dans la bibliothèque.")
    this.name = "DuplicateAlbumError"
    this.existingId = existingId
  }
}
