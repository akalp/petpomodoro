export function formatCountdown(expectedEndAt: string, nowMs: number): string {
  const remainingSeconds = Math.max(
    0,
    Math.ceil((Date.parse(expectedEndAt) - nowMs) / 1000),
  );
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function shufflePetMessages(
  messages: string[],
  previousMessage: string | null,
): string[] {
  const shuffledMessages = [...messages];

  for (let index = shuffledMessages.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledMessages[index], shuffledMessages[swapIndex]] = [
      shuffledMessages[swapIndex],
      shuffledMessages[index],
    ];
  }

  if (shuffledMessages.length > 1 && shuffledMessages[0] === previousMessage) {
    [shuffledMessages[0], shuffledMessages[1]] = [
      shuffledMessages[1],
      shuffledMessages[0],
    ];
  }

  return shuffledMessages;
}
