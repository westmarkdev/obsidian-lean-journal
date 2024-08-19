import { LogCleaner } from '../LogManager';
import { testLogs } from '../constants';

export function runLogCleanerTests() {
  const cleaner = new LogCleaner();
  const testCases = testLogs;

  testCases.forEach((testCase, index) => {
    const cleaned = cleaner.cleanLogProperty(testCase);
    console.log(`Test case ${index + 1}:`);
    console.log('Original:', testCase);
    console.log('Cleaned:', cleaned);
    console.log('---');
  });
}
