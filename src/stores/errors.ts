export function errorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Something went wrong.";
  }

  if (
    error.name.includes("Database") ||
    error.name.includes("Dexie") ||
    error.name === "MissingAPIError" ||
    error.name === "RepositoryError" ||
    error.name === "ConstraintError" ||
    error.message.includes("IndexedDB")
  ) {
    return "PetPomodoro could not reach local device storage. Your pet data stays on this device, so check that storage is available, then try again.";
  }

  return error.message;
}
