# Running the new web console in Docker (Unraid)

The web console is compiled into the API server binary, so the existing `sctg/sctgdesk-server` image
cannot show it. This project builds its own small image instead. Run it as a **separate test container**
first, on a copy of your database.

1. On the Unraid host, copy the database (stop hbbs briefly first, or at least copy while idle):

       mkdir -p /mnt/user/appdata/sctgdesk-ui-test
       cp /mnt/user/appdata/sctgdesk/db_v2.sqlite3* /mnt/user/appdata/sctgdesk-ui-test/
       # optional, if you use them:
       cp /mnt/user/appdata/sctgdesk/oauth2.toml /mnt/user/appdata/sctgdesk/s3config.toml /mnt/user/appdata/sctgdesk-ui-test/ 2>/dev/null

   Copy the `-wal` / `-shm` files too if they exist (the `*` above does that).

2. Put this project on the Unraid box (git clone your repo), edit `docker-compose.test.yml`
   and set `--secret_key` to your own random value (e.g. `openssl rand -base64 32`).

3. Build and start (the first build takes several minutes):

       docker compose -f docker-compose.test.yml up -d --build

4. Open `http://<unraid-ip>:21120/ui/` and sign in with your existing admin user.

Your original `hbbs` / `hbbr` containers keep running unchanged on 21114-21119.

## Moving to the live database
Only after testing: point the volume at `/mnt/user/appdata/sctgdesk` instead. Back that folder up first.
On startup the server runs database migrations, which may change the schema of whatever file it opens.
