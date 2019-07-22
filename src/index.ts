import extractorPipeline from './pipeline';

export default (config?: any) => async (text: string, userData?: any) => {
  return await extractorPipeline(config)(userData)(text);
};
