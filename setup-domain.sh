# Script para configurar domínio após DNS
npx vercel domains add tickrify.com --force
npx vercel domains add www.tickrify.com --force
npx vercel alias set https://tickrify-g5ie4nkq9-scannutris-projects.vercel.app tickrify.com
