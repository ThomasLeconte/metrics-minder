FROM node:18-alpine

################
### FRONTEND ###
################

# Set the working directory
WORKDIR /usr/src/app/front

# Copier le fichier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances de l'application
RUN npm install

# Copier le reste du code source de l'application
COPY .. .

# Définir variable d'environnement pour le port
ENV NITRO_PORT=5173

# Build
RUN npm run build

#############################
### START THE APPLICATION ###
#############################

# Commande pour démarrer l'application
CMD ["node", ".output/server/index.mjs"]