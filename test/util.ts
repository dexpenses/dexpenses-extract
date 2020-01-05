import * as path from 'path';
import * as fs from 'fs';

export interface TestReceipt {
  name: string;
  path: string;
  text: string;
}

function getTestSuites() {
  const testSuites: Record<string, TestReceipt[]> = {
    general: [],
  };
  const dir = path.resolve(__dirname, 'data');
  for (const entry of fs.readdirSync(dir)) {
    const entryPath = path.resolve(dir, entry);
    if (fs.statSync(entryPath).isDirectory()) {
      testSuites[path.basename(entryPath)] = fs
        .readdirSync(entryPath)
        .filter((f) => f.endsWith('.txt'))
        .map((f) => ({
          name: f,
          path: path.resolve(entryPath, f),
          text: fs.readFileSync(path.resolve(entryPath, f), {
            encoding: 'utf8',
          }),
        }));
    } else if (entry.endsWith('.txt')) {
      testSuites.general.push({
        name: path.basename(entryPath),
        path: entryPath,
        text: fs.readFileSync(entryPath, { encoding: 'utf8' }),
      });
    }
  }
  return testSuites;
}

export const testSuiteMap = getTestSuites();

export const testSuites: Array<[
  string,
  Array<[string, string, string]>
]> = Object.entries(testSuiteMap)
  .filter(([, cases]) => cases.length > 0)
  .map(([suite, cases]) => [
    suite,
    cases.map(({ name, path, text }) => [name, path, text]),
  ]);
