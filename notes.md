  Here are the exact commands to zip, transfer, and unzip the  out  folder.

  ### 1. Locally on your Mac

  Run these commands from the root directory of your project:

    # Navigate to the frontend folder
    cd frontend

    # Zip the out/ directory
    zip -r out.zip out

    # SCP the zip file to your droplet
    scp out.zip root@167.99.15.196:/var/www/nexa_ng/frontend/
    ──────
  ### 2. On your DigitalOcean Droplet

  SSH into your droplet and run:

    # Navigate to the frontend directory
    cd /var/www/nexa_ng/frontend/

    # Install unzip (if not already installed)
    sudo apt update && sudo apt install unzip -y

    # Extract the archive (this will overwrite the /out folder with the new files)
    unzip -o out.zip


  ### 1. Server Preparation

  SSH into your DigitalOcean droplet and install packages:

    sudo apt update && sudo apt upgrade -y
    sudo apt install git nginx certbot python3-certbot-nginx -y
    
    # Install Node.js (via NVM)
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.
  sh | bash
    source ~/.bashrc && nvm install 20 && nvm use 20
    
    # Install Go
    wget https://go.dev/dl/go1.22.2.linux-amd64.tar.gz
    sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.22.2.
  linux-amd64.tar.gz
    echo 'export PATH=$PATH:/usr/local/go' >> ~/.profile && source ~/.
  profile
    
  ### 2. Project Setup

  Clone the repository:

    git clone <your-repository-url> /var/www/nexa
    cd /var/www/nexa
    
  ### 3. Build & Run Backend (Go)

  1. Add remote Hostinger database credentials into 
  /var/www/nexa/backend/.env :
    PORT=8080
  
  DATABASE_URL="mysql://username:password@host:port/database_name?sslmode=
  true"
    JWT_SECRET="your-secure-random-secret"
    
  2. Build binary:
    cd /var/www/nexa/backend
    go run github.com/steebchen/prisma-client-go generate
    go build -o nexa-api main.go
    
  3. Set up systemd service to manage the process persistently under 
  /etc/systemd/system/nexa-backend.service :
    sudo systemctl daemon-reload
    sudo systemctl enable nexa-backend
    sudo systemctl start nexa-backend
    

  ### 4. Build & Export Frontend (Next.js Static)

  1. In  /var/www/nexa/frontend/.env.local , set your base URL pointing to
  the Nginx reverse-proxy:
    NEXT_PUBLIC_API_URL="https://nexa.reedbreed.cc/api"
    
  2. Compile and export static HTML assets:
    cd /var/www/nexa/frontend
    npm ci
    npm run build # Exports static files directly to frontend/out/
    

### 3. Configure Nginx

Configure Nginx to serve the static frontend files and proxy  /api/* 
requests to your Go backend running on port  8080 .

Create  /etc/nginx/sites-available/nexa :

sudo nano /etc/nginx/sites-available/nexa

Paste the following server configuration block:

server {
    listen 80;
    server_name nexa.reedbreed.cc www.nexa.reedbreed.cc;

    root /var/www/nexa_ng/frontend/out;
    index index.html;

    # Serve static frontend files
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }

    # Proxy API requests to the Go backend
    location /api/ {
        #rewrite ^/api/(.*)$ /$1 break; # Strip /api prefix
        proxy_pass http://localhost:8085;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

Enable the configuration and reload Nginx:

sudo ln -s /etc/nginx/sites-available/nexa /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t # Ensure configuration has no errors
sudo systemctl restart nginx
──────
### 4. Enable SSL/HTTPS (Final Step)

Install Certbot to secure your traffic with Let's Encrypt:

sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d nexa.reedbreed.cc
 