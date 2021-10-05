import { promises as fs } from 'fs';
import path from 'path';
import logger from './logger';
import { encoding, appName } from './constants';

export type InputConfiguration = {
  searchDir?: Array<string> | string;
  outputFile?: string;
  pattern?: string;
  silent?: boolean;
  debug?: boolean;
};

export type Configuration = {
  searchDir: Array<string>;
  outputFile: string;
  pattern: string;
  rootDirectory: string;
};

type PackageJsonFile = {
  config?: {
    [appName]?: InputConfiguration;
  };
};

export const defaultConfiguration: Configuration = {
  pattern: '**/*.mockup.jsx',
  outputFile: './src/mockups.js',
  searchDir: ['./src/'],
  rootDirectory: process.cwd(),
};

export const resolveConfiguration = (
  input: InputConfiguration | undefined,
  prevConfig: Configuration
): Configuration => {
  if (!input || typeof input !== 'object') {
    return prevConfig;
  }

  const { searchDir, outputFile, pattern } = input;

  let config = { ...prevConfig };

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

const resolvePackageJsonConfiguration = async (
  processDirectory: string,
  prevConfig: Configuration
): Promise<Configuration> => {
  const packageJsonFile = await getPackageJsonPath(processDirectory);

  if (!packageJsonFile) {
    return prevConfig;
  }

  logger.debug('package.json located at ' + packageJsonFile);

  const packageJsonContents = await fs.readFile(packageJsonFile, {
    encoding,
  });

  const pkg = JSON.parse(packageJsonContents) as PackageJsonFile;

  if (pkg.config === undefined || pkg.config[appName] === undefined) {
    logger.debug('package.json does not have rnstl configuration');
    return prevConfig;
  }

  const config = resolveConfiguration(pkg.config[appName], prevConfig);
  logger.debug('package.json configuration: ', config);

  return config;
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
  cliArgs: InputConfiguration,
  processDirectory: string
): Promise<Configuration> => {
  const packageConfig = await resolvePackageJsonConfiguration(
    processDirectory,
    defaultConfiguration
  );
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
