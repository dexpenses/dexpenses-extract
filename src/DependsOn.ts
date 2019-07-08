import { Extractor } from './extractor/extractor';

type Class = new (...args: any[]) => {};

export function DependsOn(...value: Class[]) {
  return function MyClassDecorator(target: any): any {
    if (value.indexOf(target) !== -1) {
      throw new Error(`${target.name} cannot depend on itself`);
    }
    target.prototype.$dependsOn = value;
  };
}

export function checkDependencies(pipeline: Array<Extractor<any>>) {
  pipeline.forEach((extractor, index) => {
    const dependencies = (extractor as any).$dependsOn;
    if (!dependencies) {
      return;
    }
    for (const dependency of dependencies) {
      if (!pipeline.slice(0, index).find((e) => e instanceof dependency)) {
        throw new Error(
          `Dependency '${dependency.name}' not satisfied on ${
            extractor.constructor.name
          }`
        );
      }
    }
  });
}
