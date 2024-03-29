



<img width="585" alt="Screenshot 2024-03-16 at 11 39 18 PM" src="https://github.com/hack4impact-uiuc/HackGPT/assets/62641231/4859ca39-3df9-4351-a546-a370586317e0">


## Backend Deployment

This section describes the steps to deploy the backend FastAPI application to a DigitalOcean server using GitHub Actions for continuous deployment.

### Prerequisites

Before proceeding with the deployment, ensure that you have the following:

- A DigitalOcean account and a server instance created
- SSH access to the server with the necessary permissions
- A GitHub repository containing the backend code
- Docker installed on the server

### Deployment Steps

1. **Set up GitHub Secrets:**
   - In your GitHub repository, go to "Settings" > "Secrets" > "Actions".
   - Create the following secrets:
     - `HOST`: The IP address or hostname of your DigitalOcean server.
     - `USERNAME`: The SSH username for accessing the server (e.g., `root`).
     - `PASSWORD`: The SSH password for the specified username.

2. **Create the GitHub Actions Workflow:**
   - In your GitHub repository, create a new file named `.github/workflows/deploy_api.yml`.
   - Copy the following content into the `deploy_api.yml` file:

     ```yaml
     name: Deploy to DigitalOcean

     on:
       push:
         branches:
           - main

     jobs:
       deploy:
         runs-on: ubuntu-latest

         steps:
         - name: Checkout code
           uses: actions/checkout@v2

         - name: Deploy to DigitalOcean
           run: |
             sshpass -p "${{ secrets.PASSWORD }}" ssh -o StrictHostKeyChecking=no ${{ secrets.USERNAME }}@${{ secrets.HOST }} '
               mkdir -p hackgpt
               cd hackgpt
               if [ ! -d .git ]; then
                 git init
                 git remote add origin https://github.com/${{ github.repository }}.git
                 git config core.sparseCheckout true
                 echo "Dockerfile" >> .git/info/sparse-checkout
                 echo "api/" >> .git/info/sparse-checkout
                 echo "requirements.txt" >> .git/info/sparse-checkout
                 git pull --depth=1 origin main
               else
                 git pull origin main
               fi
               docker build -t hackgpt .
               docker stop hackgpt-container || true
               docker rm hackgpt-container || true
               docker run -d --name hackgpt-container -p 8000:8000 hackgpt
             '
     ```

   - Commit and push the `deploy_api.yml` file to your GitHub repository.

3. **Set up the `.env` File:**
   - SSH into your DigitalOcean server.
   - Navigate to the `hackgpt` directory where the backend code will be deployed.
   - Create a file named `.env` and add the necessary environment variables required by your FastAPI application.

4. **Trigger the Deployment:**
   - Make a change to your backend code and push the changes to the `main` branch of your GitHub repository.
   - GitHub Actions will automatically trigger the deployment workflow based on the `deploy_api.yml` configuration.
   - The workflow will SSH into your DigitalOcean server, clone the repository, build the Docker image, stop any existing containers, and start a new container with the updated code.

5. **Access the Deployed Application:**
   - Once the deployment workflow completes successfully, your FastAPI application will be accessible at `http://<your-server-ip>:8000`.

Note: Make sure that port 8000 is open and accessible on your DigitalOcean server's firewall settings.

That's it! Your backend FastAPI application is now deployed to your DigitalOcean server using GitHub Actions for continuous deployment. Whenever you push changes to the `main` branch, the deployment workflow will automatically update the running application on the server.
