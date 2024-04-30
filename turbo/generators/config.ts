import { execSync } from 'node:child_process';
import type { PlopTypes } from '@turbo/gen';

interface PackageJson {
  name: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

// Learn more about Turborepo Generators at https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // A simple generator to add a new React component to the internal UI library
  plop.setGenerator('package', {
    description: 'Generate a new package for the Acme Monorepo',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the package? (You can skip the `@acme/` prefix)',
      },
      {
        type: 'input',
        name: 'deps',
        message: 'Enter a space separated list of dependencies you would like to install',
      },
    ],
    actions: [
      (answers) => {
        if ('name' in answers && typeof answers.name === 'string') {
          if (answers.name.startsWith('@acme/')) {
            answers.name = answers.name.replace('@acme/', '');
          }
        }
        return 'Config sanitized';
      },
      {
        type: 'add',
        path: 'packages/{{ name }}/package.json',
        templateFile: 'templates/package/package.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{ name }}/tsconfig.json',
        templateFile: 'templates/package/tsconfig.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{ name }}/index.ts',
        template: "export * from './src';\n",
      },
      {
        type: 'add',
        path: 'packages/{{ name }}/src/index.ts',
        template: "export const name = '{{ name }}';\n",
      },
      {
        type: 'modify',
        path: 'packages/{{ name }}/package.json',
        async transform(content, answers) {
          if ('deps' in answers && typeof answers.deps === 'string') {
            const pkg = JSON.parse(content) as PackageJson;
            for (const dep of answers.deps.split(' ').filter(Boolean)) {
              const version = await fetch(`https://registry.npmjs.org/-/package/${dep}/dist-tags`)
                .then((res) => res.json())
                // @ts-ignore
                .then((json) => json.latest);
              if (!pkg.dependencies) pkg.dependencies = {};
              pkg.dependencies[dep] = `${version}`;
            }
            return JSON.stringify(pkg, null, 2);
          }
          return content;
        },
      },
      async (answers) => {
        /**
         * Install deps and format everything
         */
        if ('name' in answers && typeof answers.name === 'string') {
          execSync('bun install', { stdio: 'inherit' });
          execSync(`bunx biome check ./packages/${answers.name}/** --list-different --apply`);
          return 'Package scaffolded';
        }
        return 'Package not scaffolded';
      },
    ],
  });

  plop.setGenerator('react-component', {
    description: 'Adds a new react component under packages/ui',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the component?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'packages/ui/src/{{kebabCase name}}.tsx',
        templateFile: 'templates/react/component.hbs',
      },
      {
        type: 'add',
        path: 'packages/ui/src/stories/{{pascalCase name}}.stories.tsx',
        templateFile: 'templates/react/story.hbs',
      },
    ],
  });
}
