#!/bin/bash

# Badminton Web App - Elastic IP Configuration Script
# Hướng dẫn: https://github.com/your-username/badminton-web

set -e

echo "=== Badminton Web App - Elastic IP Configuration ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    echo "Install with: sudo apt install awscli"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials are not configured."
    echo "Please run: aws configure"
    exit 1
fi

# Get current instance ID
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
print_status "Current Instance ID: $INSTANCE_ID"

# Get current public IP
CURRENT_IP=$(curl -s http://checkip.amazonaws.com/)
print_status "Current Public IP: $CURRENT_IP"

# Function to create Elastic IP
create_elastic_ip() {
    print_status "Creating new Elastic IP..."
    ALLOCATION_ID=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
    ELASTIC_IP=$(aws ec2 describe-addresses --allocation-ids $ALLOCATION_ID --query 'Addresses[0].PublicIp' --output text)
    
    print_status "Elastic IP created: $ELASTIC_IP"
    print_status "Allocation ID: $ALLOCATION_ID"
    
    # Associate with current instance
    aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOCATION_ID
    
    print_status "Elastic IP associated with instance"
    
    # Save to file for future reference
    echo "ELASTIC_IP=$ELASTIC_IP" > /opt/badminton-web/.elastic-ip
    echo "ALLOCATION_ID=$ALLOCATION_ID" >> /opt/badminton-web/.elastic-ip
    
    return 0
}

# Function to update environment variables
update_env_vars() {
    local ELASTIC_IP=$1
    
    print_status "Updating environment variables..."
    
    # Update .env file if it exists
    if [ -f /opt/badminton-web/.env ]; then
        # Backup current .env
        cp /opt/badminton-web/.env /opt/badminton-web/.env.backup.$(date +%Y%m%d_%H%M%S)
        
        # Update FRONTEND_NEXT_PUBLIC_API_URL
        sed -i "s|FRONTEND_NEXT_PUBLIC_API_URL=.*|FRONTEND_NEXT_PUBLIC_API_URL=http://$ELASTIC_IP/api|g" /opt/badminton-web/.env
        
        print_status "Updated .env file with new Elastic IP"
    else
        print_warning ".env file not found. Please create it manually."
    fi
    
    # Update Jenkins environment variables if Jenkins is running
    if systemctl is-active --quiet jenkins; then
        print_status "Updating Jenkins environment variables..."
        
        # Create Jenkins environment update script
        cat > /tmp/update-jenkins-env.groovy << EOF
import jenkins.model.Jenkins
import hudson.EnvVars

Jenkins jenkins = Jenkins.getInstance()
EnvVars envVars = jenkins.getGlobalNodeProperties().get(hudson.slaves.EnvironmentVariablesNodeProperty.class)?.getEnvVars()

if (envVars == null) {
    def envVarsNodeProperty = new hudson.slaves.EnvironmentVariablesNodeProperty()
    jenkins.getGlobalNodeProperties().add(envVarsNodeProperty)
    envVars = envVarsNodeProperty.getEnvVars()
}

envVars.put("FRONTEND_NEXT_PUBLIC_API_URL", "http://$ELASTIC_IP/api")
envVars.put("FRONTEND_URL", "http://$ELASTIC_IP")

jenkins.save()
println "Jenkins environment variables updated"
EOF
        
        # Execute the script
        sudo -u jenkins java -jar /usr/share/jenkins/jenkins.war -httpPort=8080 -prefix=/jenkins -executors=0 &
        sleep 10
        
        # Use Jenkins CLI to update environment
        curl -X POST http://localhost:8080/scriptText --data-urlencode "script=$(cat /tmp/update-jenkins-env.groovy)" --user admin:$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)
        
        # Stop temporary Jenkins instance
        pkill -f "java -jar /usr/share/jenkins/jenkins.war"
        
        print_status "Jenkins environment variables updated"
    fi
}

# Function to update Nginx configuration
update_nginx_config() {
    local ELASTIC_IP=$1
    
    print_status "Updating Nginx configuration..."
    
    # Backup current Nginx config
    sudo cp /etc/nginx/sites-available/badminton-web /etc/nginx/sites-available/badminton-web.backup.$(date +%Y%m%d_%H%M%S)
    
    # Update server_name if needed
    sudo sed -i "s/server_name .*/server_name _ $ELASTIC_IP;/" /etc/nginx/sites-available/badminton-web
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    print_status "Nginx configuration updated"
}

# Function to update DNS records (if using Route 53)
update_dns_records() {
    local ELASTIC_IP=$1
    local DOMAIN=$2
    
    if [ -z "$DOMAIN" ]; then
        print_warning "No domain specified. Skipping DNS update."
        return 0
    fi
    
    print_status "Updating DNS records for domain: $DOMAIN"
    
    # Get hosted zone ID
    ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='$DOMAIN.'].Id" --output text)
    
    if [ -z "$ZONE_ID" ]; then
        print_error "Hosted zone not found for domain: $DOMAIN"
        return 1
    fi
    
    # Create change batch
    cat > /tmp/change-batch.json << EOF
{
    "Changes": [
        {
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "$DOMAIN",
                "Type": "A",
                "TTL": 300,
                "ResourceRecords": [
                    {
                        "Value": "$ELASTIC_IP"
                    }
                ]
            }
        }
    ]
}
EOF
    
    # Update DNS record
    aws route53 change-resource-record-sets --hosted-zone-id $ZONE_ID --change-batch file:///tmp/change-batch.json
    
    print_status "DNS record updated for $DOMAIN -> $ELASTIC_IP"
}

# Main execution
main() {
    # Check if Elastic IP already exists
    if [ -f /opt/badminton-web/.elastic-ip ]; then
        source /opt/badminton-web/.elastic-ip
        print_status "Existing Elastic IP found: $ELASTIC_IP"
        
        # Check if it's still associated
        ASSOCIATED_IP=$(aws ec2 describe-addresses --allocation-ids $ALLOCATION_ID --query 'Addresses[0].PublicIp' --output text 2>/dev/null || echo "")
        
        if [ "$ASSOCIATED_IP" = "$ELASTIC_IP" ]; then
            print_status "Elastic IP is still valid and associated"
            ELASTIC_IP_TO_USE=$ELASTIC_IP
        else
            print_warning "Elastic IP is no longer valid. Creating new one..."
            create_elastic_ip
            ELASTIC_IP_TO_USE=$ELASTIC_IP
        fi
    else
        print_status "No existing Elastic IP found. Creating new one..."
        create_elastic_ip
        ELASTIC_IP_TO_USE=$ELASTIC_IP
    fi
    
    # Update environment variables
    update_env_vars $ELASTIC_IP_TO_USE
    
    # Update Nginx configuration
    update_nginx_config $ELASTIC_IP_TO_USE
    
    # Update DNS records if domain is provided
    if [ ! -z "$1" ]; then
        update_dns_records $ELASTIC_IP_TO_USE $1
    fi
    
    print_status "Configuration completed successfully!"
    echo ""
    echo "=== Summary ==="
    echo "Elastic IP: $ELASTIC_IP_TO_USE"
    echo "Application URL: http://$ELASTIC_IP_TO_USE"
    echo "API URL: http://$ELASTIC_IP_TO_USE/api"
    echo "Health Check: http://$ELASTIC_IP_TO_USE/health"
    echo ""
    echo "=== Next Steps ==="
    echo "1. Restart your application: docker-compose -f docker-compose.prod.yml restart"
    echo "2. Test the application: curl http://$ELASTIC_IP_TO_USE"
    echo "3. Update your GitHub webhook URL if needed"
    echo ""
}

# Check command line arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [domain]"
    echo ""
    echo "Options:"
    echo "  domain    Domain name for DNS update (optional)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Configure Elastic IP only"
    echo "  $0 example.com        # Configure Elastic IP and update DNS"
    exit 0
fi

# Run main function
main $1 