# Tablero del clasificador de noticias

Frontend React, TypeScript y Vite para cargar noticias en PDF, consultar la
predicción del modelo y administrar el historial persistente del API.

## Desarrollo local

Con el API ejecutándose en `http://localhost:8000`:

```powershell
npm ci
npm run dev
```

Vite publica el tablero en `http://localhost:5173` y redirige las solicitudes
de `/api` al API local.

## Validaciones

```powershell
npm run lint
npm run build
```

## Docker

La imagen usa una compilación multi-stage con Node.js 22 y sirve los archivos
estáticos mediante Nginx. Nginx también funciona como proxy inverso: el
navegador llama a `/api` y el contenedor reenvía la solicitud al modelo.

Con el API disponible en el puerto `8000` del host:

```powershell
docker compose up --build -d
```

Abrir:

```text
http://localhost:8080
```

Comprobar el contenedor y consultar sus registros:

```powershell
docker compose ps
docker compose logs -f frontend
```

Detenerlo:

```powershell
docker compose down
```

### Variables del contenedor

| Variable | Predeterminado | Descripción |
|---|---|---|
| `MODEL_API_HOST` | `host.docker.internal` | Host o nombre DNS del contenedor del API. |
| `MODEL_API_PORT` | `8000` | Puerto interno del API. |

Cuando frontend y API estén en la misma red Docker, se debe usar el nombre del
servicio del modelo como `MODEL_API_HOST`. Esta configuración se completará en
el Compose conjunto para EC2.
