import { Plugin } from 'rollup';
import { RollupDynamicGenerationFileOptions } from '../types';
declare function dynamicGenerationFile(options: RollupDynamicGenerationFileOptions): Plugin;
export default dynamicGenerationFile;
