# OSP AutoCare - Local Docker Compose

Requirements: Docker Engine with Compose plugin or Docker Desktop.

1. Copy `.env.example` to `.env`.
2. Edit `.env` and replace the placeholder with a new, strong administrator password.
3. Make sure the external Docker network `proxy` exists.
4. Run `docker compose up -d` from the project root directory, one level above `apps`.
5. Access the application through the configured reverse proxy.

Run `docker compose logs -f` to view logs and `docker compose down` to stop.

## Storage and safety
- The database is stored in the project folder `database/osp_autocare.db` and mounted at `/data/osp_autocare.db` inside the container.
- `OSO_INITIAL_PASSWORD` is only used to create the initial administrator if the users table is empty. Changing `.env` afterward does not reset existing passwords.
- Port 8080 is exposed only inside the external Docker network `proxy`; the reverse-proxy container must connect to that same network. This configuration is NOT for public production use without HTTPS and additional hardening.
- Back up the `database` folder before upgrades, and avoid copying a live SQLite file without a consistent backup procedure.

## Development

The root `docker-compose.yml` configuration mounts `apps/OSP_AutoCare` at `/app`
and the local `database` folder at `/data`, so source and database changes stay
in the project.

Create the external network if it does not already exist, then start the
development service:

```powershell
docker network create proxy
docker compose up
```

This repository change only defines the development structure; no container or
volume was started or created automatically.
