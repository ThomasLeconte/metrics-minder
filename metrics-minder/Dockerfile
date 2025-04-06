FROM node:18-alpine

################
### FRONTEND ###
################

# Set the working directory
WORKDIR /usr/src/app/front

# Copier le fichier package.json et package-lock.json
COPY front/package*.json ./

# Installer les dépendances de l'application
RUN npm install

# Copier le reste du code source de l'application
COPY .. .

# Exposer le port sur lequel l'application va tourner
EXPOSE 5173

#############################
### START THE APPLICATION ###
#############################

# Commande pour démarrer l'application
CMD ["npm", "run", "dev"]