# Prova Prática de Refatoração - Star Wars API

Este é um projeto de prova prática para praticar refatoração de código com base nos princípios do livro "Clean Code" de Robert C. Martin.

## Sobre o trabalho

O arquivo `swapi.js` contém um código JavaScript funcional que faz requisições HTTP para a API de Star Wars (SWAPI) e exibe os resultados. O código funciona, mas intencionalmente viola vários princípios de código limpo.

## Princípios de Clean Code violados

O código atual viola os seguintes princípios:

1. **Nomes significativos** - Funções e variáveis têm nomes curtos e não-descritivos (`f`, `p`, `d`, `r`, `j`, etc.). Ajuste-os com base no seu entendimento do código.
2. **Responsabilidade única** - Funções fazem muitas coisas diferentes ao mesmo tempo.
3. **Números mágicos** - Valores fixos sem explicação (1000000000, 3, 10000, etc.).
4. **Funções extensas** - Funções com mais de 30 linhas que fazem muitas tarefas.
5. **Variáveis globais** - Uso excessivo de variáveis de estado globais.
6. **DRY (Don't Repeat Yourself)** - Código repetitivo que poderia ser abstraído.
7. **Tratamento de erros inconsistente** - Diferentes abordagens para lidar com erros

## Instruções

1. Execute o código para entender seu funcionamento
   ```
   node swapi.js
   ```

2. Acesse http://localhost:3000 no seu navegador

3. Refatore o código aplicando os princípios de Clean Code:
   - Renomeie variáveis e funções para nomes significativos
   - Divida funções grandes em funções menores com responsabilidade única
   - Substitua números mágicos por constantes nomeadas
   - Remova variáveis globais desnecessárias
   - Padronize o tratamento de erros
   - Separe código de debug do código de produção
   - Mantenha cada função com menos de 30 linhas
   - Elimine repetições usando abstrações adequadas

4. Mantenha a funcionalidade original do código

## Recursos

- [Star Wars API Documentation](https://swapi.dev/documentation)
- "Clean Code" - Robert C. Martin 

# Pontuação

Este trabalho vale 1,5 pontos. É sugerido utilizar o ESLint para facilitar a correção do código.
Para cada problema de linting encontrado, será descontado 0,1 décimos (ou seja, se você deixar 15 problemas de linting, o trabalho será zerado).

# Entrega

O trabalho pode ser feito em equipe de até 4 pessoas e deve ser enviado para o GitHub.
O link do repositório deve ser enviado no AVA até 26/05/2025.