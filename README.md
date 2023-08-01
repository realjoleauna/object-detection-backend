# Projeto de Detecção de Objetos com TensorFlow e Flask

Este é um projeto simples de detecção de objetos usando TensorFlow e Flask. O objetivo deste projeto é criar um aplicativo da web que permite ao usuário fazer upload de uma imagem e, em seguida, detectar objetos na imagem usando um modelo pré-treinado de detecção de objetos.

## Requisitos

Certifique-se de ter o Python 3.x instalado em seu sistema. Para instalar as bibliotecas necessárias, execute o seguinte comando no terminal:

```
pip install -r requirements.txt
```

## Uso

1. Clone este repositório para o seu sistema local.
2. Instale as dependências conforme mencionado nos requisitos.
3. Inicie o servidor Flask executando o seguinte comando:

```
python app.py
```

4. O aplicativo agora está em execução e pode ser acessado em `http://localhost:5000/` no seu navegador.

## Estrutura do Projeto

- `app.py`: Contém a lógica do aplicativo Flask para lidar com as solicitações de API e renderizar a página inicial.
- `index.html`: Página HTML que contém o formulário para fazer upload da imagem e exibir as imagens detectadas.
- `templates/`: Pasta contendo os modelos HTML usados no aplicativo.
- `static/`: Pasta contendo arquivos estáticos usados no aplicativo, como CSS e JavaScript.
    - `css/`: Pasta contendo o arquivo de estilo `styles.css`.
    - `js/`: Pasta contendo o arquivo de script `script.js`.
- `requirements.txt`: Arquivo que lista todas as dependências necessárias do Python.


## Funcionamento

1. No navegador, abra `http://localhost:5000/` para acessar o aplicativo.
2. Selecione uma imagem para fazer upload e clique no botão "Detectar Objetos".
3. O aplicativo enviará a imagem para a API do Flask.
4. A API usará o modelo TensorFlow pré-treinado para detectar objetos na imagem.
5. A resposta da API contendo os objetos detectados será exibida no console do terminal.
6. A imagem original com os objetos detectados circulados será exibida na interface do aplicativo.

## Detalhes da Implementação

O aplicativo usa o TensorFlow e TensorFlow Hub para carregar um modelo de detecção de objetos pré-treinado. Ele utiliza o Flask para criar a API da web e a interface do usuário. A detecção de objetos é realizada na imagem carregada pelo usuário e os resultados são retornados como uma lista de objetos detectados, cada um com suas coordenadas de caixa delimitadora, classe e pontuação de confiança.

## Licença

Este projeto é licenciado sob a Licença MIT - consulte o arquivo `LICENSE` para obter detalhes.

## Agradecimentos

Agradecemos ao TensorFlow e ao TensorFlow Hub por fornecerem o modelo pré-treinado de detecção de objetos e as bibliotecas Python para simplificar o processo de detecção de objetos.

---

Esperamos que este guia seja útil para entender o projeto. Se você tiver alguma dúvida ou precisar de mais informações, sinta-se à vontade para entrar em contato conosco. Divirta-se codificando!
