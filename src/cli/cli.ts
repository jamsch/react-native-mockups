#!/usr/bin/env node
import yargs from 'yargs';
import { promises as fs } from 'fs';
import path from 'path';

import logger from './logger';
import {
  GenerateConfiguration,
  generateConfiguration,
  resolvePackageJsonConfig,
} from './configuration';

import { generateTemplate } from './template';
import { generateLoaderDefinition } from './locator';
import { encoding } from './constants';
import server from './server';

const resolveArgs = (keys: string[], value: string, defaultValue: string) => {
  for (const key of keys) {
    if (process.argv.includes(key)) {
      return value;
    }
  }
  return defaultValue;
};

yargs
  .usage('$0 [options]')
  .command(
    'server [-p 1337]',
    'Start the server',
    (y) => {
      return y
        .option('port', {
          alias: 'p',
          description: 'Port to listen on',
          default: 1337,
          type: 'number',
        })
        .option('host', {
          alias: 'h',
          description: 'Hostname',
          default: '127.0.0.1',
          type: 'string',
        });
    },
    (argv) => {
      resolvePackageJsonConfig().then((config) => {
        const host = resolveArgs(
          ['-h', '--host'],
          argv.host,
          config?.host || argv.host
        );

        const port = resolveArgs(
          ['-p', '--port'],
          String(argv.port),
          String(config?.port || argv.port)
        );

        server(host, port ? Number(port) : undefined);
      });
    }
  )
  .command(
    'generate',
    'Generate the mockups file',
    // @ts-ignore
    (y) => {
      return y.options({
        searchDir: {
          type: 'string',
          array: true,
          desc: 'The directory or directories, relative to the project root, to search for files in.',
        },
        pattern: {
          desc: "Pattern to search the search directories with. Note: if pattern contains '**/*' it must be escaped with quotes",
          type: 'string',
        },
        outputFile: {
          desc: 'Path to the output file.',
          type: 'string',
        },
        startServer: {
          desc: 'Starts the server',
          type: 'boolean',
        },
        debug: {
          desc: 'Sets log level to debug',
          type: 'boolean',
        },
        silent: {
          desc: 'Silences all logging',
          type: 'boolean',
        },
      });
    },
    GenerateCommand
  )
  .demandCommand(1)
  .help().argv;

function GenerateCommand(args: GenerateConfiguration) {
  if (args.silent) {
    logger.setLogLevel('silent');
  } else if (args.debug) {
    logger.setLogLevel('debug');
  } else {
    logger.setLogLevel('info');
  }

  // logger.debug('yargs', args);

  (async () => {
    try {
      const cwd = process.cwd();

      const configuration = await generateConfiguration(args, cwd);
      const loaderDefinition = await generateLoaderDefinition(configuration);
      const template = await generateTemplate(loaderDefinition);

      await fs.mkdir(path.dirname(loaderDefinition.outputFile), {
        recursive: true,
      });

      logger.info('Writing to ' + loaderDefinition.outputFile);

      await fs.writeFile(loaderDefinition.outputFile, template, { encoding });
    } catch (err) {
      logger.error('Failed to execute: ' + err);
    }
  })().catch((e) => logger.error(e));
}
