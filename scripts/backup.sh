#!/bin/bash

# MongoDB Backup Script cho Badminton Shop
# Sử dụng: ./scripts/backup.sh [backup|restore] [backup_name]

set -e

# Configuration
CONTAINER_NAME="badminton_mongodb"
DB_NAME="badminton_shop"
DB_USER="admin"
DB_PASSWORD="badminton123"
BACKUP_DIR="/home/ubuntu/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    if ! docker ps > /dev/null 2>&1; then
        log_error "Docker is not running or not accessible"
        exit 1
    fi
}

check_container() {
    if ! docker ps | grep -q $CONTAINER_NAME; then
        log_error "Container $CONTAINER_NAME is not running"
        exit 1
    fi
}

create_backup() {
    local backup_name=${1:-"badminton_backup_$DATE"}
    
    log_info "Creating backup: $backup_name"
    
    # Create backup directory if not exists
    mkdir -p $BACKUP_DIR
    
    # Create backup
    docker exec $CONTAINER_NAME mongodump \
        --username $DB_USER \
        --password $DB_PASSWORD \
        --authenticationDatabase admin \
        --db $DB_NAME \
        --out /backup/$backup_name
    
    # Compress backup
    cd $BACKUP_DIR
    tar -czf $backup_name.tar.gz $backup_name
    rm -rf $backup_name
    
    log_info "Backup completed: $BACKUP_DIR/$backup_name.tar.gz"
    
    # Clean old backups (keep last 7 days)
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
    log_info "Cleaned old backups (older than 7 days)"
}

restore_backup() {
    local backup_name=$1
    
    if [ -z "$backup_name" ]; then
        log_error "Backup name is required for restore"
        echo "Usage: $0 restore <backup_name>"
        echo "Available backups:"
        ls -la $BACKUP_DIR/*.tar.gz 2>/dev/null || echo "No backups found"
        exit 1
    fi
    
    local backup_file="$BACKUP_DIR/$backup_name.tar.gz"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        echo "Available backups:"
        ls -la $BACKUP_DIR/*.tar.gz 2>/dev/null || echo "No backups found"
        exit 1
    fi
    
    log_warn "This will overwrite the current database!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
    
    log_info "Restoring from backup: $backup_name"
    
    # Extract backup
    cd $BACKUP_DIR
    tar -xzf $backup_name.tar.gz
    
    # Get extracted directory name
    local extracted_dir=$(tar -tzf $backup_name.tar.gz | head -1 | cut -d/ -f1)
    
    # Restore database
    docker exec -i $CONTAINER_NAME mongorestore \
        --username $DB_USER \
        --password $DB_PASSWORD \
        --authenticationDatabase admin \
        --db $DB_NAME \
        --drop \
        /backup/$extracted_dir/$DB_NAME
    
    # Clean up extracted files
    rm -rf $extracted_dir
    
    log_info "Restore completed successfully"
}

list_backups() {
    log_info "Available backups:"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR/*.tar.gz 2>/dev/null)" ]; then
        ls -lah $BACKUP_DIR/*.tar.gz
    else
        log_warn "No backups found in $BACKUP_DIR"
    fi
}

show_help() {
    echo "MongoDB Backup Script for Badminton Shop"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  backup [name]     Create a new backup (optional name)"
    echo "  restore <name>    Restore from backup"
    echo "  list              List available backups"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 backup my_backup"
    echo "  $0 restore badminton_backup_20241201_143000.tar.gz"
    echo "  $0 list"
}

# Main script
case "${1:-help}" in
    backup)
        check_docker
        check_container
        create_backup "$2"
        ;;
    restore)
        check_docker
        check_container
        restore_backup "$2"
        ;;
    list)
        list_backups
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 