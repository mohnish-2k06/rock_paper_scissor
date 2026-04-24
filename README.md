# Full-Stack Rock Paper Scissors Game

A modern, visually appealing Rock Paper Scissors game built with HTML, CSS, JavaScript (Frontend) and Node.js/Express (Backend).

## Features
- **Rich UI**: Dark mode aesthetic, glassmorphism, smooth animations.
- **Backend Logic**: Game outcomes calculated on a Node.js server.
- **Data Persistence**: Scores saved in a local JSON database.

## Local Setup

1. **Install Dependencies**
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Run the Server**
   ```bash
   node backend/server.js
   ```

3. **Play the Game**
   Open your browser and navigate to `http://localhost:3000`.

---

## AWS Deployment Guide

This guide covers how to deploy this application to an AWS EC2 instance.

### 1. Launch an EC2 Instance
- Go to the AWS Console -> EC2 -> **Launch Instance**.
- **Name**: `rps-game-server`
- **AMI**: Ubuntu Server 24.04 LTS (or similar).
- **Instance Type**: `t2.micro` (free-tier eligible).
- **Key Pair**: Create a new key pair (e.g., `rps-key.pem`) and download it.
- **Network Settings**:
  - Allow SSH traffic from your IP.
  - Allow HTTP traffic from the internet.
  - Allow HTTPS traffic from the internet.
- Click **Launch**.

### 2. Connect to Your Instance
Open your terminal and SSH into the instance using the downloaded key:
```bash
chmod 400 rps-key.pem
ssh -i "rps-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

### 3. Install Node.js & Git
Once connected, update packages and install Node.js:
```bash
sudo apt update
sudo apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. Clone Your Code
Assuming you've pushed this code to a GitHub repository:
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd rps-game
npm install
```
*(If you haven't used GitHub, you can use `scp` to copy the files from your local machine to the EC2 instance).*

### 5. Run the App with PM2
PM2 is a production process manager for Node.js. It will keep your app running continuously.
```bash
sudo npm install -g pm2
pm2 start backend/server.js --name "rps-app"
pm2 startup
pm2 save
```

### 6. Set Up Nginx Reverse Proxy
Nginx will route port 80 (HTTP) to your Node app running on port 3000.
```bash
sudo apt install -y nginx
```
Edit the Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/default
```
Replace the `location /` block with:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```
Save (`Ctrl+O`, `Enter`) and exit (`Ctrl+X`).

Test and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Play!
Open your browser and navigate to your EC2 instance's **Public IPv4 address**. You should see the game running!

---
*Note: For a production app, consider using MongoDB (e.g., MongoDB Atlas) instead of a local JSON file, and secure your site with HTTPS using Certbot (Let's Encrypt).*
