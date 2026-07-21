
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --frozen-lockfile


COPY . .

RUN npm run build -- --configuration production


FROM nginx:1.27-alpine


COPY --from=build /app/dist/frond-esoterica/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
