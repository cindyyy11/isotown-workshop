# IsoTown CRUD API – MockAPI.io Endpoints

This document lists the **REST API endpoints** used for **Save / Load / Update / Delete** city saves. They map to **CRUD** concepts and use [MockAPI.io](https://mockapi.io) as the backend.

---

## Base URL

```
https://<YOUR_PROJECT_ID>.mockapi.io/api/v1
```

- Replace `<YOUR_PROJECT_ID>` with your MockAPI project ID.
- Set `VITE_MOCKAPI_BASE_URL` in `.env` (e.g. `VITE_MOCKAPI_BASE_URL=https://abcdef12.mockapi.io/api/v1`).

## Resource: `citysaves`

All endpoints use the **`citysaves`** resource. Create it in your MockAPI project with at least these properties:

| Property     | Type   | Description                          |
| ------------ | ------ | ------------------------------------ |
| `name`       | string | Display name (e.g. "My Kuala Lumpur") |
| `zoneLabel`  | string | Location label (e.g. "Kuala Lumpur")  |
| `zoneLat`    | number | Latitude                              |
| `zoneLon`    | number | Longitude                             |
| `snapshot`   | object | Full city state JSON                  |

MockAPI automatically adds `id` and `createdAt`.

---

## Endpoints Overview

| CRUD   | Method | Endpoint                  | Description        |
| ------ | ------ | ------------------------- | ------------------ |
| Create | `POST` | `/citysaves`              | Save a new city    |
| Read   | `GET`  | `/citysaves`              | List all saves     |
| Read   | `GET`  | `/citysaves/:id`          | Get one save by ID |
| Update | `PUT`  | `/citysaves/:id`          | Update a save      |
| Delete | `DELETE` | `/citysaves/:id`        | Delete a save      |

---

## 1. CREATE – Save a new city

**`POST /citysaves`**

Creates a new city save.

### Request

- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "name": "My Kuala Lumpur City",
  "zoneLabel": "Kuala Lumpur",
  "zoneLat": 3.139,
  "zoneLon": 101.686,
  "snapshot": {
    "version": "1",
    "coins": 20,
    "population": 0,
    "jobs": 0,
    "happiness": 0,
    "grid": {},
    "worldCondition": "CLEAR",
    "tickCount": 0,
    "characters": []
  }
}
```

### Response

- **Status:** `201 Created`
- **Body:** Created record including `id` and `createdAt`:

```json
{
  "id": "1",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "name": "My Kuala Lumpur City",
  "zoneLabel": "Kuala Lumpur",
  "zoneLat": 3.139,
  "zoneLon": 101.686,
  "snapshot": { ... }
}
```

---

## 2. READ – List all saves

**`GET /citysaves`**

Returns all city saves.

### Request

- No body.

### Response

- **Status:** `200 OK`
- **Body:** Array of saves:

```json
[
  {
    "id": "1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "name": "My Kuala Lumpur City",
    "zoneLabel": "Kuala Lumpur",
    "zoneLat": 3.139,
    "zoneLon": 101.686,
    "snapshot": { ... }
  },
  {
    "id": "2",
    "createdAt": "2024-01-16T14:00:00.000Z",
    "name": "Tokyo Town",
    "zoneLabel": "Tokyo",
    "zoneLat": 35.6762,
    "zoneLon": 139.6503,
    "snapshot": { ... }
  }
]
```

---

## 3. READ – Get one save by ID

**`GET /citysaves/:id`**

Returns a single city save.

### Request

- **URL:** Replace `:id` with the save ID (e.g. `GET /citysaves/1`).

### Response

- **Status:** `200 OK`
- **Body:** Single save object:

```json
{
  "id": "1",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "name": "My Kuala Lumpur City",
  "zoneLabel": "Kuala Lumpur",
  "zoneLat": 3.139,
  "zoneLon": 101.686,
  "snapshot": { ... }
}
```

- **Status:** `404 Not Found` if the ID does not exist.

---

## 4. UPDATE – Update an existing save

**`PUT /citysaves/:id`**

Updates a city save. Use when overwriting an existing save (e.g. “Save” after loading from cloud).

### Request

- **Headers:** `Content-Type: application/json`
- **URL:** Replace `:id` with the save ID.
- **Body:** Same shape as CREATE; typically the updated `name`, `zoneLabel`, `zoneLat`, `zoneLon`, and `snapshot`.

```json
{
  "name": "My Kuala Lumpur City (Updated)",
  "zoneLabel": "Kuala Lumpur",
  "zoneLat": 3.139,
  "zoneLon": 101.686,
  "snapshot": { ... }
}
```

### Response

- **Status:** `200 OK`
- **Body:** Updated record (MockAPI returns the full object).

---

## 5. DELETE – Remove a save

**`DELETE /citysaves/:id`**

Deletes a city save.

### Request

- **URL:** Replace `:id` with the save ID (e.g. `DELETE /citysaves/1`).

### Response

- **Status:** `200 OK` (or `204 No Content`, depending on MockAPI).
- No body required.

---

## CRUD ↔ HTTP Summary

| CRUD   | HTTP    | Endpoint        | Use case                    |
| ------ | ------- | --------------- | --------------------------- |
| Create | `POST`  | `/citysaves`    | Save as new cloud save      |
| Read   | `GET`   | `/citysaves`    | List saves (Load menu)      |
| Read   | `GET`   | `/citysaves/:id`| Load one save               |
| Update | `PUT`   | `/citysaves/:id`| Overwrite existing save     |
| Delete | `DELETE`| `/citysaves/:id`| Remove a save               |

---

## Setup

1. Create a project at [mockapi.io](https://mockapi.io).
2. Create a resource **`citysaves`** with fields: `name`, `zoneLabel`, `zoneLat`, `zoneLon`, `snapshot` (or use MockAPI’s default type handling).
3. Copy your project base URL (e.g. `https://abcdef12.mockapi.io/api/v1`) and set:

   ```
   VITE_MOCKAPI_BASE_URL=https://<YOUR_PROJECT_ID>.mockapi.io/api/v1
   ```

4. Restart the dev server after changing `.env`.

---

## Testing with `curl`

```bash
# List all saves (Read)
curl "https://<YOUR_PROJECT_ID>.mockapi.io/api/v1/citysaves"

# Get one save (Read)
curl "https://<YOUR_PROJECT_ID>.mockapi.io/api/v1/citysaves/1"

# Create save (Create)
curl -X POST "https://<YOUR_PROJECT_ID>.mockapi.io/api/v1/citysaves" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test City","zoneLabel":"KL","zoneLat":3.14,"zoneLon":101.69,"snapshot":{}}'

# Update save (Update)
curl -X PUT "https://<YOUR_PROJECT_ID>.mockapi.io/api/v1/citysaves/1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated City","zoneLabel":"KL","zoneLat":3.14,"zoneLon":101.69,"snapshot":{}}'

# Delete save (Delete)
curl -X DELETE "https://<YOUR_PROJECT_ID>.mockapi.io/api/v1/citysaves/1"
```
