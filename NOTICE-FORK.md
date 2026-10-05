# About this fork

This project is derived from [sctg-development/sctgdesk-api-server](https://github.com/sctg-development/sctgdesk-api-server)
(© Ronan LE MEILLAT / SCTG Development), licensed under the GNU AGPL-3.0. This derivative remains under AGPL-3.0;
see `LICENSE.md`. The Rust API server is unchanged; the changes are in `webconsole/`:

- Router-based layout with sidebar, deep-linkable pages and a working user menu / Settings page
- Reusable `DataTable` (search, sorting, pagination, multi-select bulk actions, loading/empty/error states, mobile card layout)
- Devices: online/offline badges, status filter, detail drawer, copy ID
- Users and Groups: row menus, bulk activate/deactivate/delete, confirmation dialogs, toasts instead of `alert()`
- Responsive dashboard grid
