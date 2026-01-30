# -------- Frontend Build --------
FROM node:20 AS frontend

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend .
RUN npm run build
# ➜ erzeugt /frontend/dist


# -------- Backend Runtime --------
FROM node:20

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend .

# 🔥 Frontend Build übernehmen
COPY --from=frontend /frontend/dist ./dist

EXPOSE 3000
CMD ["node", "server.js"]
