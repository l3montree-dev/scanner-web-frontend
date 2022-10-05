## Getting Started

First, run the development server:

```bash
npm run de
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

During development it might be hard to read the JSON logs inside the terminal. Since the [pino](https://github.com/pinojs/pino) logger is used inside the project, the [pino-pretty](https://github.com/pinojs/pino-pretty) package can be used to improve the logging output.