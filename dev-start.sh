# dev-start.sh
#!/bin/bash
echo "🚀 Starting Development Environment"

# Cleanup alte Container
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Starte PostgreSQL
echo "🗄️  Starting PostgreSQL..."
docker-compose -f docker-compose.dev.yml up -d

# Warte auf DB
echo "⏳ Waiting for database..."
sleep 5

# Setup Backend
echo "🔧 Setting up backend..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.development .env
fi
npm install
npx prisma migrate dev --name development
npx prisma db seed
cd ..

echo "✅ Development ready!"
echo ""
echo "🎯 Next steps:"
echo "1. Terminal 1: cd backend && npm run dev"
echo "2. Terminal 2: cd frontend && npm run dev"
echo ""
echo "🌐 URLs:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:4000/graphql"