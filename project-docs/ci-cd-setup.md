# CI/CD Setup Guide

This document explains how to set up and maintain the CI/CD pipeline for the Afino platform.

## GitHub Actions Workflow

The Afino platform uses GitHub Actions for continuous integration and Vercel for continuous deployment. The workflow is defined in `.github/workflows/ci-cd.yml`.

### Workflow Overview

The CI workflow performs the following steps:
1. Checks out the repository
2. Sets up Node.js
3. Installs dependencies
4. Generates the Prisma client
5. Runs linting
6. Builds the application
7. Runs tests

Deployment is handled automatically by Vercel through its GitHub integration.

### Environment Variables

The CI workflow requires the following environment variables to be set as GitHub secrets:

- `DATABASE_URL`: The URL for the Supabase PostgreSQL database
- `NEXT_PUBLIC_SUPABASE_URL`: The URL for the Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous key for the Supabase project

### Setting Up GitHub Secrets

To set up the required secrets:

1. Go to your GitHub repository at https://github.com/afinoblakeb/afino-app
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" and then "Actions"
4. Click on "New repository secret" to add each of the required secrets
5. Copy the values from your `.env` file

### Troubleshooting CI Failures

Common issues that can cause CI failures:

1. **Missing environment variables**: Ensure all required secrets are set in GitHub.
2. **Prisma client generation failures**: Make sure the DATABASE_URL is correct and accessible.
3. **Test failures**: Check the test logs to identify failing tests.
4. **Build failures**: Look for errors in the build logs, which might indicate issues with dependencies or code.

### Updating the Workflow

If you need to update the CI workflow:

1. Edit the `.github/workflows/ci-cd.yml` file
2. Commit and push the changes
3. GitHub will automatically use the updated workflow for future runs

## Vercel Deployment

Vercel is configured to automatically deploy the application when changes are pushed to the main branch. It uses the environment variables set in the Vercel project settings.

### Setting Up Vercel Environment Variables

1. Go to the Vercel dashboard
2. Select the Afino project
3. Go to "Settings" > "Environment Variables"
4. Add the same environment variables as in the GitHub secrets

### Deployment Preview

Vercel automatically creates deployment previews for pull requests, allowing you to test changes before merging them into the main branch. 