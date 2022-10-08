## Getting Started

First, run the development server:

```bash
npm run de
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

During development it might be hard to read the JSON logs inside the terminal. Since the [pino](https://github.com/pinojs/pino) logger is used inside the project, the [pino-pretty](https://github.com/pinojs/pino-pretty) package can be used to improve the logging output.


## Monitoring

The application can monitor the security state of selected sites. The requirements for this are:

1. It needs a Kubernetes leader election sidecar
2. The environment variables:
    - LEADER_ELECTOR_URL
    - POD_NAME

   need to be defined.
3. A file with the name `ozgsec.json` needs to be placed inside the root directory. It has to match this interface:

```json
[
 {
      "fqdn": "example.com",
      "interval": 10000,
 }
 ...
]
```

The `interval` is used to specify the interval in SECONDS in which the site is checked. The default value is (60 * 60 * 4)s - 4 hours.