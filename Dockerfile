# Builds the standalone API server together with the redesigned web console.
# The web console (webconsole/) is compiled by build.rs and embedded in the binary.
FROM rust:1-bookworm AS build
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
 && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY . .
# sqlx checks queries at compile time against the bundled template database (needs an absolute path)
ENV DATABASE_URL=sqlite:///src/db_v2.sqlite3
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY --from=build /src/target/release/sctgdesk-api-server /usr/local/bin/sctgdesk-api-server
# The server opens ./db_v2.sqlite3 (and optional oauth2.toml / s3config.toml) from its working directory.
WORKDIR /data
VOLUME /data
EXPOSE 21114
ENTRYPOINT ["sctgdesk-api-server"]
CMD ["--address", "0.0.0.0", "--port", "21114", "--log_level", "normal"]
