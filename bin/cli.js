#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';
import { program } from 'commander';
import degit from 'degit';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template padrão
const DEFAULT_TEMPLATE = 'FrancisWorld/nextjs-template';

// Detecta qual gerenciador de pacotes está disponível
function detectPackageManager() {
  try {
    execSync('bun --version', { stdio: 'ignore' });
    return 'bun';
  } catch {
    try {
      execSync('pnpm --version', { stdio: 'ignore' });
      return 'pnpm';
    } catch {
      try {
        execSync('yarn --version', { stdio: 'ignore' });
        return 'yarn';
      } catch {
        return 'npm';
      }
    }
  }
}

// Verifica se o Bun está instalado
function checkBunInstallation() {
  try {
    execSync('bun --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

program
  .version('1.0.0')
  .description('CLI para criar projetos Next.js personalizados')
  .argument('[nome-do-projeto]', 'Nome do projeto a ser criado')
  .option('--use-npm', 'Usar npm como gerenciador de pacotes')
  .option('--use-yarn', 'Usar yarn como gerenciador de pacotes')
  .option('--use-pnpm', 'Usar pnpm como gerenciador de pacotes')
  .option('--use-bun', 'Usar bun como gerenciador de pacotes')
  .action(async (projectName, options) => {
    try {
      console.log(chalk.blue.bold('🚀 Bem-vindo ao Create Chico App!'));

      // Coleta de informações do projeto
      const questions = [];

      if (!projectName) {
        questions.push({
          type: 'input',
          name: 'projectName',
          message: 'Qual o nome do seu projeto?',
          validate: input => input.length > 0 || 'Por favor, forneça um nome para o projeto'
        });
      }

      // Verifica se o Bun está instalado
      const hasBun = checkBunInstallation();
      
      // Determina o gerenciador de pacotes
      let packageManager = hasBun ? 'bun' : 'npm';
      if (options.useNpm) packageManager = 'npm';
      else if (options.useYarn) packageManager = 'yarn';
      else if (options.usePnpm) packageManager = 'pnpm';
      else if (options.useBun) {
        if (!hasBun) {
          console.log(chalk.yellow('⚠️  Bun não está instalado. Para instalar:'));
          console.log(chalk.white('  curl -fsSL https://bun.sh/install | bash'));
          process.exit(1);
        }
        packageManager = 'bun';
      }
      else if (!options.useNpm && !options.useYarn && !options.usePnpm && !options.useBun) {
        const choices = [
          { name: 'bun (Recomendado)', value: 'bun', disabled: !hasBun && 'Não instalado' },
          { name: 'pnpm', value: 'pnpm' },
          { name: 'yarn', value: 'yarn' },
          { name: 'npm', value: 'npm' }
        ];

        questions.push({
          type: 'list',
          name: 'packageManager',
          message: 'Qual gerenciador de pacotes você quer usar?',
          default: hasBun ? 'bun' : 'npm',
          choices
        });
      }

      const answers = await inquirer.prompt(questions);
      projectName = projectName || answers.projectName;
      packageManager = answers.packageManager || packageManager;

      const spinner = ora('Criando seu projeto incrível...').start();

      try {
        // Clonar o template
        const emitter = degit(DEFAULT_TEMPLATE, {
          cache: false,
          force: true,
          verbose: true
        });

        await emitter.clone(projectName);
        
        // Atualizar package.json do projeto clonado
        const pkgPath = path.join(process.cwd(), projectName, 'package.json');
        const pkg = await fs.readJson(pkgPath);
        pkg.name = projectName;
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });

        spinner.succeed(chalk.green('Projeto criado com sucesso! 🎉'));
        
        // Comandos específicos para cada gerenciador de pacotes
        const pmCommands = {
          npm: {
            install: 'npm install',
            dev: 'npm run dev'
          },
          yarn: {
            install: 'yarn',
            dev: 'yarn dev'
          },
          pnpm: {
            install: 'pnpm install',
            dev: 'pnpm dev'
          },
          bun: {
            install: 'bun install',
            dev: 'bun dev'
          }
        };

        console.log('\n' + chalk.cyan('Para começar:'));
        console.log(chalk.white(`  cd ${projectName}`));
        console.log(chalk.white(`  ${pmCommands[packageManager].install}`));
        console.log(chalk.white(`  ${pmCommands[packageManager].dev}`));
        
        // Encerra o processo com sucesso
        process.exit(0);
      } catch (error) {
        spinner.fail(chalk.red('Ops! Algo deu errado.'));
        console.error(chalk.red(error));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Erro inesperado:'));
      console.error(chalk.red(error));
      process.exit(1);
    }
  });

program.parse(process.argv); 