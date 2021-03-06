import prettier from 'prettier';

import type { LoaderDefinition } from './locator';
import logger from './logger';

const relativeFormatter = (
  files: { root: string[]; outputFile: string[] },
  frms: (params: { root: string; outputFile: string }) => string,
  separator: string
) => {
  const formatted = files.root.map((_, i) =>
    frms({
      root: files.root[i],
      outputFile: files.outputFile[i],
    })
  );
  return formatted.join(separator);
};

const defaultPrettierOptions: prettier.Options = {
  parser: 'babel',
};

export const generateTemplate = async (
  loader: LoaderDefinition
): Promise<string> => {
  const template = `// Auto-generated file created by react-native-mockups
  // Do not edit.
  //
  // https://github.com/jamsch/react-native-mockups

  export default {
  ${relativeFormatter(
    loader.mockupFiles.relative,
    (file) => `'${file.root}': require('${file.outputFile}')`,
    ',\n'
  )}
  };
  `;

  return makePrettier(template);
};

const makePrettier = async (template: string): Promise<string> => {
  try {
    const prettierConfigFile = await prettier.resolveConfigFile();

    if (prettierConfigFile === null) {
      logger.info(
        'Prettier configuration not detected, using default formatting.'
      );
      return prettier.format(template, defaultPrettierOptions);
    }

    logger.info(
      `Attempting to use prettier configuration detected at ${prettierConfigFile}`
    );

    const prettierConfig = await prettier.resolveConfig(prettierConfigFile);

    if (prettierConfig === null) {
      logger.warn(
        'Prettier configuration was not found, using default formatting.'
      );
      return prettier.format(template, defaultPrettierOptions);
    }

    // Since many prettier configs don't include the `parser` option (the
    // Prettier docs recommend against setting it and letting Prettier infer
    // based on the file-name), we include `...defaultPrettierOptions` here
    // before `...prettierConfig`.
    return prettier.format(template, {
      ...defaultPrettierOptions,
      ...prettierConfig,
    });
  } catch (err) {
    logger.warn(
      `Something went awry while trying to get the prettier config, falling back to default formatting [${err}]`
    );
    return prettier.format(template, defaultPrettierOptions);
  }
};
