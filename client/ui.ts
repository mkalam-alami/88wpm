
export function wordIndexToState(wordIndex: number, currentWordIndex: number, currentWordError: boolean) {
  if (wordIndex > currentWordIndex) {
      return "pending";
  } else if (wordIndex < currentWordIndex) {
      return "done";
  } else if (currentWordError) {
      return "error";
  } else {
      return "todo";
  }
}

export  function progressPercentFromWordTiming(currentTime: number, wordTiming: number[], wordCount: number): number {
  if (wordCount > wordTiming.length) {
    return wordTiming.length * 1. / wordCount;
  } else {
    const wordIndex = wordTiming.findIndex((timing) => timing > currentTime);
    if (wordIndex === -1) {
        return 1.;
    } else {
        return wordIndex * 1. / wordCount;
    }
  }
}
