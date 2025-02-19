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

// Verifica se um gerenciador de pacotes está instalado
function checkPackageManager(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Configuração dos gerenciadores de pacotes
const packageManagers = {
  bun: {
    name: 'bun (Recomendado - Mais rápido)',
    checkCommand: 'bun',
    commands: {
      install: 'bun install',
      dev: 'bun dev'
    }
  },
  pnpm: {
    name: 'pnpm (Eficiente em disco)',
    checkCommand: 'pnpm',
    commands: {
      install: 'pnpm install',
      dev: 'pnpm dev'
    }
  },
  yarn: {
    name: 'yarn (Popular)',
    checkCommand: 'yarn',
    commands: {
      install: 'yarn',
      dev: 'yarn dev'
    }
  },
  npm: {
    name: 'npm (Padrão)',
    checkCommand: 'npm',
    commands: {
      install: 'npm install',
      dev: 'npm run dev'
    }
  }
};

program
  .version('1.0.0')
  .description('CLI para criar projetos Next.js personalizados')
  .argument('[nome-do-projeto]', 'Nome do projeto a ser criado')
  .option('--use-npm', 'Usar npm como gerenciador de pacotes')
  .option('--use-yarn', 'Usar yarn como gerenciador de pacotes')
  .option('--use-pnpm', 'Usar pnpm como gerenciador de pacotes')
  .option('--use-bun', 'Usar bun como gerenciador de pacotes')
  .option('--branch <branch>', 'Selecionar a branch do template (blank ou master)')
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

      // Adiciona seleção de branch se não foi especificada via opção
      if (!options.branch) {
        questions.push({
          type: 'list',
          name: 'branch',
          message: 'Qual versão do template você quer usar?',
          choices: [
            { name: 'Completa com todas funcionalidades (blank)', value: 'blank' },
            { name: 'Versão com mais animações (master)', value: 'master' }
          ],
          default: 'blank'
        });
      }

      // Determina o gerenciador de pacotes
      let packageManager = null;
      
      // Verifica se foi especificado via linha de comando
      if (options.useNpm) packageManager = 'npm';
      else if (options.useYarn) packageManager = 'yarn';
      else if (options.usePnpm) packageManager = 'pnpm';
      else if (options.useBun) packageManager = 'bun';

      // Se não foi especificado, pergunta ao usuário
      if (!packageManager) {
        // Verifica disponibilidade de cada gerenciador
        const pmChoices = Object.entries(packageManagers).map(([value, pm]) => ({
          name: pm.name,
          value,
          disabled: !checkPackageManager(pm.checkCommand) && 'Não instalado'
        }));

        questions.push({
          type: 'list',
          name: 'packageManager',
          message: 'Qual gerenciador de pacotes você quer usar?',
          choices: pmChoices,
          default: () => {
            // Retorna o primeiro gerenciador disponível
            const available = pmChoices.find(choice => !choice.disabled);
            return available ? available.value : 'npm';
          }
        });
      }

      const answers = await inquirer.prompt(questions);
      projectName = projectName || answers.projectName;
      packageManager = packageManager || answers.packageManager;
      const selectedBranch = options.branch || answers.branch || 'blank';

      // Verifica se o gerenciador selecionado está instalado
      if (!checkPackageManager(packageManagers[packageManager].checkCommand)) {
        console.log(chalk.yellow(`⚠️  ${packageManager} não está instalado.`));
        process.exit(1);
      }

      const spinner = ora('Criando seu projeto incrível...').start();

      try {
        // Clonar o template com a branch selecionada
        const emitter = degit(`${DEFAULT_TEMPLATE}#${selectedBranch}`, {
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
        
        const { commands } = packageManagers[packageManager];

        // Pergunta se quer instalar as dependências
        const { shouldInstall } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldInstall',
            message: '🔨 Deseja instalar as dependências agora?',
            default: true
          }
        ]);

        if (shouldInstall) {
          // Muda para o diretório do projeto
          process.chdir(projectName);
          
          const installSpinner = ora('Instalando dependências...').start();
          
          try {
            execSync(commands.install, { stdio: 'ignore' });
            installSpinner.succeed(chalk.green('Dependências instaladas com sucesso! 📦'));
            
            console.log('\n' + chalk.cyan('Para iniciar o desenvolvimento:'));
            console.log(chalk.white(`  ${commands.dev}`));
          } catch (error) {
            installSpinner.fail(chalk.red('Erro ao instalar dependências.'));
            console.error(chalk.red(error));
            
            console.log('\n' + chalk.cyan('Para tentar novamente:'));
            console.log(chalk.white(`  cd ${projectName}`));
            console.log(chalk.white(`  ${commands.install}`));
            console.log(chalk.white(`  ${commands.dev}`));
          }
        } else {
          console.log('\n' + chalk.cyan('Para começar:'));
          console.log(chalk.white(`  cd ${projectName}`));
          console.log(chalk.white(`  ${commands.install}`));
          console.log(chalk.white(`  ${commands.dev}`));
        }
        
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