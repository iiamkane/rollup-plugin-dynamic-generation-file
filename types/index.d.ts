import type { Plugin } from "rollup";

export interface RollupDynamicGenerationFileOptions {
    inputDir: string;
    outputFile: string;
}

export default function run(options?: RollupDynamicGenerationFileOptions): Plugin;
