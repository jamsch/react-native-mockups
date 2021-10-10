import { promises as fs } from 'fs';
import path from 'path';
import logger from './logger';
import { encoding, appName } from './constants';

export type PackageJsonConfig = Partial<{
  searchDir: Array<string> | string;
  outputFile: string;
  pattern: string;
  silent: boolean;
  debug: boolean;
  host: string;
  port: string;
}>;

export type GenerateConfiguration = {
  searchDir: Array<string>;
  outputFile: string;
  pattern: string;
  rootDirectory: string;
  silent?: boolean;
  debug?: boolean;
};

type PackageJsonFile = {
  config?: {
    [appName]?: PackageJsonConfig;
  };
};

export const defaultConfiguration: GenerateConfiguration = {
  pattern: '**/*.mockup.jsx',
  outputFile: './src/mockups.js',
  searchDir: ['./src/'],
  rootDirectory: process.cwd(),
};

export const resolveConfiguration = (
  input: PackageJsonConfig | undefined,
  fallbackConfig: GenerateConfiguration
): GenerateConfiguration => {
  if (!input || typeof input !== 'object') {
    return fallbackConfig;
  }

  const { searchDir, outputFile, pattern } = input;

  let config = { ...fallbackConfig };

  if (searchDir !== undefined) {
    config = {
      ...config,
      searchDir: Array.isArray(searchDir) ? searchDir : [searchDir],
    };
  }

  if (outputFile !== undefined) {
    config = { ...config, outputFile };
  }

  if (pattern) {
    config = { ...config, pattern };
  }

  return config;
};

export const resolvePackageJsonConfig = async () => {
  const processDirectory = process.cwd();
  const packageJsonFile = await getPackageJsonPath(processDirectory);

  if (!packageJsonFile) {
    return;
  }

  logger.debug('package.json located at ' + packageJsonFile);

  const packageJsonContents = await fs.readFile(packageJsonFile, {
    encoding,
  });

  return (JSON.parse(packageJsonContents) as PackageJsonFile).config?.[appName];
};

const getPackageJsonPath = async (processDirectory: string) => {
  const packageJsonFile = await findUp('package.json', {
    cwd: processDirectory,
  });

  return packageJsonFile;
};

async function findUp(name: string, options: { cwd?: string } = {}) {
  let directory = path.resolve(options.cwd || '');
  const { root } = path.parse(directory);
  const stopAt = path.resolve(directory, root);

  while (directory !== stopAt) {
    const pathToCheck = path.resolve(directory, name);

    if (await fs.stat(pathToCheck)) {
      return pathToCheck;
    }

    directory = path.dirname(directory);
  }

  return null;
}

export const generateConfiguration = async (
  cliArgs: PackageJsonConfig,
  processDirectory: string
): Promise<GenerateConfiguration> => {
  const packageConfig = await (async () => {
    const pkgConfig = await resolvePackageJsonConfig();
    logger.debug('package.json configuration: ', pkgConfig);
    if (!pkgConfig) {
      logger.debug(`package.json does not have [${appName}] configuration`);
      return defaultConfiguration;
    }
    const config = resolveConfiguration(pkgConfig, defaultConfiguration);
    return config;
  })();

  const cliConfig = resolveConfiguration(cliArgs, packageConfig);

  logger.debug('cli configuration: ', cliConfig);

  const configuration = {
    ...defaultConfiguration,
    ...packageConfig,
    ...cliConfig,
    rootDirectory: processDirectory,
  };

  logger.debug('Using configuration: ', configuration);

  return configuration;
};
