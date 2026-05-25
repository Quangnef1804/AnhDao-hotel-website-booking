# Quan ly khach san Anh Dao

Boilerplate fullstack cho web quan ly khach san Anh Dao.

## Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: React, Vite, Tailwind CSS, i18next
- Runtime: Docker Compose, Nginx reverse proxy

## Cau truc

```text
backend/
  src/config/db.js
  src/controllers/
  src/middleware/
  src/models/
  src/routes/
  src/scripts/seedAdmin.js
frontend/
  src/api/
  src/components/
  src/context/
  src/i18n/
  src/pages/
docker-compose.yml
.env
.env.example
```

## Chay va deploy bang Docker

Docker la cach chay mac dinh cho project nay. Frontend Nginx la entrypoint public, sau do proxy `/api` vao backend trong mang noi bo Docker. Backend va MongoDB khong expose port ra ngoai host.

```bash
cp .env.example .env
```

Sua cac bien quan trong trong `.env` truoc khi deploy:

```env
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=https://your-domain.com
FRONTEND_PORT=80
```

Luu y: `.env` de `MONGO_URI=mongodb://localhost:27017/anhdao_hotel` de ho tro local dev. Khi chay Docker, `docker-compose.yml` se override backend thanh `MONGO_URI=mongodb://mongo:27017/anhdao_hotel`.

Build va chay:

```bash
docker compose up -d --build
```

Tao tai khoan admin:

```bash
docker compose exec backend npm run seed:admin
```

Kiem tra:

```bash
docker compose ps
curl http://localhost/api/health
```

Frontend mac dinh: `http://localhost`

Neu muon chay tren port khac, sua `.env`:

```env
FRONTEND_PORT=8080
CLIENT_URL=http://localhost:8080
```

Sau do recreate:

```bash
docker compose up -d --build
```

## Kien truc Docker

- `frontend`: Nginx phuc vu React build va proxy `/api` sang `backend:5000`.
- `backend`: Express API chi expose trong Docker network, khong public port `5000`.
- `mongo`: MongoDB volume persist data, khong public port `27017`.
- `backend_uploads`: volume persist anh phong upload tu Admin.

Admin co the upload toi da 6 anh cho moi phong. Anh dau tien trong danh sach upload la anh chinh; cac anh con lai hien thi trong gallery o modal chi tiet phong.

## Local development tuy chon

Neu muon chay backend local bang `npm run dev`, can dung backend container truoc:

```bash
docker compose stop backend
```

Neu dung MongoDB tu Docker cho backend local, expose port Mongo bang override dev:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d mongo
```

Khong chay lai `docker compose up -d` thuong trong luc dang dev backend local, vi cau hinh deploy se khong publish port `27017` ra host. Neu da lo chay lai va gap `ECONNREFUSED 127.0.0.1:27017`, chay lai lenh override dev o tren.

Trong `.env`, giu cac gia tri local:

```env
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/anhdao_hotel
CLIENT_URL=http://localhost,http://localhost:5173
VITE_API_URL=/api
```

Chay backend va frontend local:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Vite proxy da cau hinh `/api` sang `http://localhost:5000`, nen form login/register tren `http://localhost:5173` goi duoc backend local.

## Loi port backend

Neu gap `EADDRINUSE: address already in use :::5000`, nghia la da co process khac dang dung port `5000`. Truong hop pho bien la backend Docker dang chay trong khi ban chay backend local.

```bash
docker compose stop backend
```

Hoac doi port backend local trong `.env`.

## Loi MongoDB EAI_AGAIN mongo

Neu gap:

```text
MongoDB connection failed: getaddrinfo EAI_AGAIN mongo
```

Ban dang chay backend ngoai Docker bang `nodemon`, nhung lai dung hostname Docker noi bo `mongo`. Cach sua:

```env
MONGO_URI=mongodb://localhost:27017/anhdao_hotel
```

Hoac chay backend trong Docker bang:

```bash
docker compose up -d backend
```
