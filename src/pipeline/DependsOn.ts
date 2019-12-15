import Stage from './Stage';

type StageCtor = new (...args: any[]) => Stage;

export function DependsOn(...value: StageCtor[]) {
  return (target: StageCtor) => {
    if (value.indexOf(target) !== -1) {
      throw new Error(`${target.name} cannot depend on itself`);
    }
    target.prototype.$dependsOn = value;
  };
}

export function checkDependencies(stages: Array<Stage | Stage[]>) {
  for (const [i, stage] of stages.entries()) {
    for (const subStage of Array.isArray(stage) ? stage : [stage]) {
      if (!subStage.$dependsOn) {
        continue;
      }
      const precedingStages = stages.slice(0, i).flat();
      for (const dependency of subStage.$dependsOn) {
        if (!precedingStages.find((s) => s.constructor === dependency)) {
          throw new Error(
            `Dependency '${dependency.name}' not satisfied on ${subStage.constructor.name}`
          );
        }
      }
    }
  }
}
