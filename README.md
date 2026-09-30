# Controle de Documentos — Real Medicina

Sistema web estático (HTML + CSS + JavaScript puro), pronto para o **GitHub Pages**. Sem backend, sem banco de dados.

## Instalação
1. Baixe ou clone o projeto.
2. Envie todos os arquivos para um repositório no GitHub.
3. Em *Settings → Pages*, escolha a branch principal e a pasta raiz (`/`).
4. Acesse o endereço publicado.

## Atualização dos dados
1. Abra o sistema e clique em **Importar Planilha**.
2. Arraste o arquivo `.xlsx`, `.xls` ou `.csv`.
3. Confira a prévia (registros, duplicados).
4. Clique em **Confirmar importação**.
5. Clique em **Baixar dados.js**.
6. Substitua o `dados.js` no repositório do GitHub.
7. Faça o commit.
8. O GitHub Pages atualiza o sistema.

## Observações
- A planilha é processada **somente no navegador** (SheetJS). Nenhum dado é enviado para servidores.
- Alterações feitas no navegador (cadastro, edição, exclusão, importação) ficam salvas apenas naquele navegador. Para publicar, exporte o `dados.js` e faça o commit. O botão *Descartar alterações locais* (Configurações) volta ao `dados.js` publicado.
- As colunas são reconhecidas pelo **nome do cabeçalho**, não pela posição.
- Nos documentos, `X` = solicitado (quantidade 1); números são preservados como quantidade; vazio = não solicitado.
- CNPJ/CPF são sempre texto. Datas são gravadas como `AAAA-MM-DD` e exibidas como `DD/MM/AAAA`.
- Backup: JSON e CSV em *Configurações*. O importador também carrega um `dados.js` gerado anteriormente.
