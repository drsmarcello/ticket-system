#!/bin/bash
# rollback.sh - Manual rollback script
# Usage: ./rollback.sh [deployment_id]

set -e

DEPLOY_PATH="/opt/docker-containers/ticket-system/Bachelor"
BACKUP_PATH="/opt/backups/ticket-system"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to list available backups
list_backups() {
    log "Available backups:"
    if [ -d "$BACKUP_PATH" ]; then
        cd "$BACKUP_PATH"
        for backup in */; do
            if [ -f "$backup/metadata.json" ]; then
                echo "📦 $backup"
                echo "   📅 $(jq -r '.timestamp' "$backup/metadata.json" 2>/dev/null || echo 'Unknown date')"
                echo "   🔗 $(jq -r '.commit_sha' "$backup/metadata.json" 2>/dev/null || echo 'Unknown commit')"
                echo ""
            fi
        done
    else
        warning "No backup directory found at $BACKUP_PATH"
    fi
}

# Function to perform rollback
rollback_to_backup() {
    local backup_id="$1"
    local backup_dir="$BACKUP_PATH/$backup_id"
    
    if [ ! -d "$backup_dir" ]; then
        error "Backup $backup_id not found!"
        exit 1
    fi
    
    log "🔄 Starting rollback to backup: $backup_id"
    
    # Confirm rollback
    echo -e "${YELLOW}⚠️  This will:"
    echo "   - Stop current services"
    echo "   - Restore database from backup"
    echo "   - Restore application files"
    echo "   - Restart services"
    echo ""
    read -p "Continue with rollback? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log "Rollback cancelled"
        exit 0
    fi
    
    # Create emergency backup of current state
    log "💾 Creating emergency backup of current state..."
    EMERGENCY_BACKUP="$BACKUP_PATH/emergency_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$EMERGENCY_BACKUP"
    
    cd "$DEPLOY_PATH"
    
    # Backup current database
    if docker compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
        docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$EMERGENCY_BACKUP/database.sql" || true
    fi
    
    # Backup current git state
    git rev-parse HEAD > "$EMERGENCY_BACKUP/git_commit.txt" 2>/dev/null || true
    cp .env "$EMERGENCY_BACKUP/" 2>/dev/null || true
    
    success "Emergency backup created: $EMERGENCY_BACKUP"
    
    # Stop services
    log "🛑 Stopping services..."
    docker compose -f docker-compose.prod.yml down --timeout 60
    
    # Restore git state
    if [ -f "$backup_dir/git_commit.txt" ]; then
        log "📝 Restoring git state..."
        git fetch origin
        git reset --hard "$(cat "$backup_dir/git_commit.txt")"
        success "Git state restored"
    fi
    
    # Restore environment files
    if [ -f "$backup_dir/.env" ]; then
        log "⚙️ Restoring environment configuration..."
        cp "$backup_dir/.env" .env
        success "Environment restored"
    fi
    
    # Start services (database first)
    log "🚀 Starting database..."
    docker compose -f docker-compose.prod.yml up -d postgres
    
    # Wait for database
    log "⏳ Waiting for database to be ready..."
    timeout=60
    while ! docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" 2>/dev/null; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            error "Database failed to start!"
            exit 1
        fi
    done
    
    # Restore database
    if [ -f "$backup_dir/database.sql" ]; then
        log "📊 Restoring database..."
        # Drop and recreate database
        docker compose -f docker-compose.prod.yml exec -T postgres psql -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS $POSTGRES_DB;"
        docker compose -f docker-compose.prod.yml exec -T postgres psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $POSTGRES_DB;"
        
        # Restore data
        cat "$backup_dir/database.sql" | docker compose -f docker-compose.prod.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
        success "Database restored"
    fi
    
    # Restore uploads
    if [ -d "$backup_dir/uploads" ]; then
        log "📁 Restoring uploads..."
        rm -rf uploads
        cp -r "$backup_dir/uploads" .
        success "Uploads restored"
    fi
    
    # Start all services
    log "🚀 Starting all services..."
    docker compose -f docker-compose.prod.yml up -d --build
    
    # Health check
    log "🏥 Running health check..."
    sleep 30
    
    if curl -f -s --max-time 10 http://localhost:4000/health > /dev/null 2>&1; then
        success "✅ Rollback completed successfully!"
        success "✅ Backend is healthy"
        log "🌐 Frontend: https://utilbox.de"
        log "🔗 Backend: https://api.utilbox.de"
    else
        warning "⚠️ Rollback completed but health check failed"
        log "Check logs with: docker compose -f docker-compose.prod.yml logs"
    fi
    
    log "📍 Rollback details:"
    log "   From: Current state (backed up to $EMERGENCY_BACKUP)"
    log "   To: $backup_id"
    log "   Commit: $(cat "$backup_dir/git_commit.txt" 2>/dev/null || echo 'Unknown')"
}

# Main script logic
main() {
    cd "$DEPLOY_PATH" || {
        error "Deploy path not found: $DEPLOY_PATH"
        exit 1
    }
    
    # Load environment variables
    if [ -f ".env" ]; then
        source .env
    else
        warning "No .env file found, using defaults"
        POSTGRES_USER="${POSTGRES_USER:-postgres}"
        POSTGRES_DB="${POSTGRES_DB:-postgres}"
    fi
    
    if [ $# -eq 0 ]; then
        log "🔍 No backup ID provided, showing available backups:"
        list_backups
        echo ""
        log "Usage: $0 <backup_id>"
        log "Example: $0 20241201_143022_a1b2c3d4"
        exit 0
    fi
    
    local backup_id="$1"
    rollback_to_backup "$backup_id"
}

# Run main function
main "$@"

# Additional utility functions

# Quick status check
status_check() {
    log "🔍 System Status Check"
    cd "$DEPLOY_PATH"
    
    echo "📊 Container Status:"
    docker compose -f docker-compose.prod.yml ps
    
    echo ""
    echo "🌐 Service Health:"
    if curl -f -s --max-time 5 http://localhost:4000/health > /dev/null 2>&1; then
        success "✅ Backend: Healthy"
    else
        error "❌ Backend: Unhealthy"
    fi
    
    if curl -f -s --max-time 5 https://utilbox.de > /dev/null 2>&1; then
        success "✅ Frontend: Accessible"
    else
        warning "⚠️ Frontend: Not accessible"
    fi
    
    echo ""
    echo "💾 Available Backups:"
    ls -la "$BACKUP_PATH" | tail -5
}

# If script is called with "status" argument
if [ "$1" = "status" ]; then
    status_check
    exit 0
fi