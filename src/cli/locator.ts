import glob from 'glob';
import path from 'path';

import { formatPath, getRelativePath, stripExtension } from './paths';
import type { GenerateConfiguration } from './configuration';

export type LoaderDefinition = {
  outputFile: string;
  mockupFiles: {
    absolute: string[];
    relative: {
      root: string[];
      outputFile: string[];
    };
  };
};

export const generateLoaderDefinition = async ({
  rootDirectory,
  outputFile,
  searchDir,
  pattern,
}: GenerateConfiguration): Promise<LoaderDefinition> => {
  const fullOutputFile = path.resolve(rootDirectory, outputFile);
  const outputFileDir = path.dirname(fullOutputFile);

  const lookupPatterns = searchDir.map((dir) =>
    path.resolve(rootDirectory, dir, pattern)
  );

  const lookupFiles = lookupPatterns
    .map((f) => formatPath(f))
    .reduce((acc: string[], p: string) => [...acc, ...glob.sync(p)], [])
    // Applying a format again to ensure paths are using '/'
    .map((file) => formatPath(file));

  const uniqueFiles = Array.from(new Set(lookupFiles));

  const projectRoot = process.cwd();

  return {
    outputFile: fullOutputFile,
    mockupFiles: {
      absolute: uniqueFiles,
      relative: {
        root: uniqueFiles.map((f) => getRelativePath(f, projectRoot)),
        outputFile: uniqueFiles
          .map((f) => getRelativePath(f, outputFileDir))
          .map((f) => stripExtension(f))
          .map((f) => formatPath(f)),
      },
    },
  };
};
