# Use Nginx as a base image
FROM nginx:alpine

# Copy frontend files to Nginx HTML folder
COPY . /usr/share/nginx/html

# Expose frontend port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]

