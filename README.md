## Getting Started

First, run the development server:

```bash
npm run de
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

During development it might be hard to read the JSON logs inside the terminal. Since the [pino](https://github.com/pinojs/pino) logger is used inside the project, the [pino-pretty](https://github.com/pinojs/pino-pretty) package can be used to improve the logging output.


## Security Monitoring

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

## Deployment

The application can be deployed using a docker container or a kubernetes helm chart.

### Docker Container

The following environment variables need to be provided:

```env
MONGODB_PASSWORD="secret"
MONGODB_USER="ozgsec"
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_DATABASE="ozgsec"
```

The container can be started with the following command:

```bash
docker run registry.gitlab.com/ozg-security/ozgsec-security-quick-test/main
```

### Helm Chart

#### MUST READ
The application will not start since an influxdb token needs to be created for it to communicate with the influx database. This step cannot be handled by the helm chart itself. To create a token, login using the administration user. The credentials of the administrator can be found inside the `influxdb-credentials` secret. After that create a secret which matches the following format:

```yaml
apiVersion: v1
metadata:
  name: influxdb-token # important!
kind: Secret
data:
  token: <the api token>
type: Opaque
```

It is recommended to create an api token with limited capabilities. Only the write capability is required.

The helm chart includes the following setup:

1. A deployment with a single replica
2. A mongodb database
3. A influxdb database for monitoring purposes
4. A sidecar setup to monitor the incoming requests

The [values.yaml](./helm-chart/values.yaml) provides a good overview of the configuration options.

The helm chart can be installed using the following commands:

```bash
helm repo add ozgsec https://gitlab.com/api/v4/projects/39163451/packages/helm/ozgsec
```

```bash
helm install ozgsec ozgsec/ozgsec
```
