export function formatReferencePeriod(input: {
  startedYear: string;
  ongoing: boolean;
  endedYear: string | null;
}) {
  if (input.ongoing) {
    return input.startedYear ? `since ${input.startedYear}` : "ongoing";
  }
  if (input.startedYear && input.endedYear) {
    return `${input.startedYear}–${input.endedYear}`;
  }
  return input.startedYear || input.endedYear || "";
}
