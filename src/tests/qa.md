# Quality Assurance - Development Testing

Here's a step-by-step guide to set up testing:

## 1. Install Jest and Required Packages

First, ensure that you have the necessary dependencies installed. Run the following command in your project directory:

```bash
npm install --save-dev jest ts-jest @types/jest
```

## 2. Configure Jest

Create a jest.config.js file in the root of your project with the following content:

```javascript
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src/tests'], // specify the tests directory
	moduleFileExtensions: ['ts', 'js'],
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
	testMatch: ['**/tests/**/*.test.ts'],
	moduleNameMapper: {
		'^src/(.*)$': '<rootDir>/src/$1',
	},
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tsconfig.json',
		},
	},
};
```

## 3. Create the Test Directory Structure

You can organize your tests within the src/tests folder. Here’s an example structure:

```bash
src/
  ├── JournalManager.ts
  ├── MOCManager.ts
  ├── LogManager.ts
  ├── SettingsManager.ts
  ├── constants.ts
  ├── tests/
  │   ├── test_logs.test.ts
  │   ├── JournalManager.test.ts
  │   ├── MOCManager.test.ts
  │   ├── LogManager.test.ts
  │   ├── SettingsManager.test.ts
  └── utils.ts
```

## 4. Write the Tests

Here are some sample test cases you might write. For instance, in test_logs.test.ts:

```typescript
import { LogManager } from '../LogManager';
import { LeanJournalSettings } from '../SettingsManager';

describe('LogManager Tests', () => {
	let logManager: LogManager;

	beforeEach(() => {
		const settings: LeanJournalSettings = {
			enableAutoMOC: true,
			// other settings...
		};
		logManager = new LogManager(null, settings); // Pass necessary arguments
	});

	test('should reset logs correctly', () => {
		// Arrange
		// (Mock data or setup preconditions)

		// Act
		logManager.resetLogs();

		// Assert
		// (Expectations)
		expect(/* some condition */).toBe(true);
	});

	// Add more tests as needed
});

```

You would create similar test files for JournalManager, MOCManager, and SettingsManager.

## 5. Integrate Development Command

Since you want to run these tests only in development mode, you’ve already set up a conditional command in main.ts. You
can run your tests using the command:

```bash
npm run test
```

Ensure that in your development environment, NODE_ENV is set to development so that your development-only command runs
correctly.

## 6. Running the Tests

To run all tests, simply use the following command in your terminal:

```bash
npm test
```

This will execute all the tests located in your src/tests folder and output the results in the console.

## 7. Continuous Testing

Consider integrating a CI/CD tool to run these tests automatically on every push to your repository to ensure that your
code remains robust over time.

## 8. Test Coverage

You can also generate a test coverage report by running:

```bash
npm test -- --coverage
```

This will provide insights into how much of your code is covered by the tests.
