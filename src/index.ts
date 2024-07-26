import { Plugin } from 'rollup';
import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import { RollupDynamicGenerationFileOptions } from '../types';

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null;

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function generatePagesJson(inputDir: string, outputFile: string) {
    try {
        const pages: string[] = [];
        const files = fs.readdirSync(inputDir);

        files.forEach(file => {
            const fullPath = path.join(inputDir, file, 'router.ts');
            if (fs.existsSync(fullPath)) {
                pages.push(fullPath);
            }
        });

        // 确保输出目录存在
        const outputDir = path.dirname(outputFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 读取现有的 pages.json 文件内容
        let existingPages = [];
        if (fs.existsSync(outputFile)) {
            existingPages = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
        }

        // 如果内容有变化才进行写入操作
        if (JSON.stringify(existingPages) !== JSON.stringify(pages)) {
            fs.writeFileSync(outputFile, JSON.stringify(pages, null, 2));
        }
    } catch (error: any) {
        console.error(`Error dynamic-generation-file: ${error.message}`);
    }
}

function dynamicGenerationFile(options: RollupDynamicGenerationFileOptions): Plugin {
    const { inputDir, outputFile } = options;

    return {
        name: 'dynamic-generation-file',
        buildStart() {
            generatePagesJson(inputDir, outputFile);

            const watcher = chokidar.watch(path.join(inputDir, '**/router.ts'));

            const debouncedGeneratePagesJson = debounce(() => {
                generatePagesJson(inputDir, outputFile);
            }, 300);

            watcher.on('change', debouncedGeneratePagesJson);
            watcher.on('add', debouncedGeneratePagesJson);
            watcher.on('unlink', debouncedGeneratePagesJson);
        },
    };
}

export default dynamicGenerationFile;
