import Stage from './Stage';

export interface Injectable {
  $dependencyMap?: Record<string, new () => Stage>;
}

export default function Inject(stage: new () => Stage) {
  return (target: Injectable | any, property: string) => {
    if (!target.$dependencyMap) {
      target.$dependencyMap = {};
    }
    target.$dependencyMap[property] = stage;
  };
}
