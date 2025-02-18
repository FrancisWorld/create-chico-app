# Create Chico App

Uma CLI elegante para criar projetos Next.js personalizados com templates pré-configurados.

## Instalação

```bash
npm install -g create-chico-app
```

## Pré-requisitos

Para melhor experiência, recomendamos instalar o Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

## Uso

Para criar um novo projeto:

```bash
create-chico-app meu-projeto
```

Ou simplesmente execute:

```bash
create-chico-app
```

E siga as instruções interativas.

### Opções de Gerenciador de Pacotes

Por padrão, a CLI usará Bun se estiver instalado. Você pode forçar um gerenciador específico usando:

```bash
create-chico-app meu-projeto --use-bun   # Usar Bun (recomendado)
create-chico-app meu-projeto --use-pnpm  # Usar pnpm
create-chico-app meu-projeto --use-yarn  # Usar Yarn
create-chico-app meu-projeto --use-npm   # Usar npm
```

## Recursos

- 🎨 Interface interativa e amigável
- 🚀 Templates pré-configurados com Bun + Next.js
- ⚡ Instalação rápida
- 📦 Configuração automática do projeto
- 🔄 Suporte a múltiplos gerenciadores de pacotes

## Como criar seu próprio template

1. Crie seu projeto Next.js com todas as configurações desejadas
2. Faça upload para um repositório GitHub
3. Atualize o `templateRepo` no arquivo `cli.js` com seu repositório

## Versões

- `@latest` - Última versão estável
- `@beta` - Versão beta com recursos experimentais

## Licença

MIT 