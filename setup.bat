@echo off
echo ========================================
echo Hellware Setup Script
echo ========================================
echo.

echo Step 1: Installing CLI tools...
call npm i -g supabase vercel
if errorlevel 1 (
    echo ERROR: Failed to install CLI tools
    pause
    exit /b 1
)
echo CLI tools installed.
echo.

echo Step 2: Logging into Supabase...
echo A browser window will open for authentication.
call supabase login
if errorlevel 1 (
    echo ERROR: Supabase login failed
    pause
    exit /b 1
)
echo Supabase login complete.
echo.

echo Step 3: Creating Supabase project...
call supabase projects create --name hellware --region ap-south-1
if errorlevel 1 (
    echo ERROR: Failed to create Supabase project
    pause
    exit /b 1
)
echo.
echo Copy the project reference ID from above output.
set /p PROJECT_REF=Enter project reference:
echo.

echo Step 4: Linking Supabase project...
call supabase link --project-ref %PROJECT_REF%
if errorlevel 1 (
    echo ERROR: Failed to link Supabase project
    pause
    exit /b 1
)
echo Supabase project linked.
echo.

echo Step 5: Pushing database schema...
call supabase db push
if errorlevel 1 (
    echo ERROR: Failed to push database schema
    pause
    exit /b 1
)
echo Database schema pushed successfully!
echo.

echo Step 6: Logging into Vercel...
echo A browser window will open for authentication.
call vercel login
if errorlevel 1 (
    echo ERROR: Vercel login failed
    pause
    exit /b 1
)
echo Vercel login complete.
echo.

echo Step 7: Linking Vercel project...
cd frontend
call vercel link --yes
if errorlevel 1 (
    echo ERROR: Failed to link Vercel project
    pause
    exit /b 1
)
echo Vercel project linked.
echo.

echo Step 8: Adding environment variables...
echo You will be prompted to enter each variable.
echo Leave blank to skip any variable.
echo.
call vercel env add NEXT_PUBLIC_SUPABASE_URL
call vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
call vercel env add SUPABASE_SERVICE_ROLE_KEY
call vercel env add RESEND_API_KEY
call vercel env add RAZORPAY_KEY_ID
call vercel env add RAZORPAY_KEY_SECRET
call vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID
call vercel env add NEXT_PUBLIC_APP_URL
call vercel env add CRON_SECRET
echo Environment variables added.
echo.

echo Step 9: Deploying to Vercel...
call vercel deploy --prod
if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)
echo.
echo ========================================
echo Deployment complete!
echo ========================================
echo.
echo Next steps (manual, via web UI):
echo 1. Resend: Add DNS records for careers@hellware.in
echo 2. Razorpay: Create account and get API keys
echo 3. Supabase: Add GitHub OAuth provider
echo.
pause
