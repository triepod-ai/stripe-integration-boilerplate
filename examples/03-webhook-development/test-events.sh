#!/bin/bash

# Stripe Webhook Event Testing Script
#
# Usage: ./test-events.sh [event-type]
#
# Examples:
#   ./test-events.sh                  # Test all events
#   ./test-events.sh payment          # Test payment events only
#   ./test-events.sh subscription     # Test subscription events only

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo -e "${RED}Error: Stripe CLI is not installed${NC}"
    echo ""
    echo "Install with:"
    echo "  macOS:   brew install stripe/stripe-cli/stripe"
    echo "  Linux:   See https://stripe.com/docs/stripe-cli"
    echo "  Windows: scoop install stripe"
    exit 1
fi

# Check if logged in
if ! stripe config --list &> /dev/null; then
    echo -e "${YELLOW}Warning: Not logged into Stripe CLI${NC}"
    echo "Run: stripe login"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Stripe Webhook Event Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Determine which events to test
EVENT_TYPE=${1:-all}

trigger_event() {
    local event=$1
    local description=$2

    echo -e "${YELLOW}Triggering:${NC} $description"
    echo -e "${BLUE}Event:${NC} $event"

    if stripe trigger "$event" 2>&1 | grep -q "Trigger succeeded"; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
    echo ""
    sleep 1
}

# Payment Intent Events
if [ "$EVENT_TYPE" = "all" ] || [ "$EVENT_TYPE" = "payment" ]; then
    echo -e "${BLUE}━━━ Payment Intent Events ━━━${NC}"
    echo ""

    trigger_event "payment_intent.succeeded" "Payment succeeded"
    trigger_event "payment_intent.payment_failed" "Payment failed"
    trigger_event "payment_intent.canceled" "Payment canceled"
    trigger_event "payment_intent.requires_action" "Payment requires action (3D Secure)"
fi

# Customer Events
if [ "$EVENT_TYPE" = "all" ] || [ "$EVENT_TYPE" = "customer" ]; then
    echo -e "${BLUE}━━━ Customer Events ━━━${NC}"
    echo ""

    trigger_event "customer.created" "Customer created"
    trigger_event "customer.updated" "Customer updated"
    trigger_event "customer.deleted" "Customer deleted"
fi

# Subscription Events
if [ "$EVENT_TYPE" = "all" ] || [ "$EVENT_TYPE" = "subscription" ]; then
    echo -e "${BLUE}━━━ Subscription Events ━━━${NC}"
    echo ""

    trigger_event "customer.subscription.created" "Subscription created"
    trigger_event "customer.subscription.updated" "Subscription updated"
    trigger_event "customer.subscription.deleted" "Subscription canceled"
    trigger_event "customer.subscription.trial_will_end" "Trial ending soon"
fi

# Invoice Events
if [ "$EVENT_TYPE" = "all" ] || [ "$EVENT_TYPE" = "invoice" ]; then
    echo -e "${BLUE}━━━ Invoice Events ━━━${NC}"
    echo ""

    trigger_event "invoice.payment_succeeded" "Invoice paid"
    trigger_event "invoice.payment_failed" "Invoice payment failed"
    trigger_event "invoice.created" "Invoice created"
    trigger_event "invoice.finalized" "Invoice finalized"
fi

# Charge Events
if [ "$EVENT_TYPE" = "all" ] || [ "$EVENT_TYPE" = "charge" ]; then
    echo -e "${BLUE}━━━ Charge Events ━━━${NC}"
    echo ""

    trigger_event "charge.succeeded" "Charge succeeded"
    trigger_event "charge.failed" "Charge failed"
    trigger_event "charge.refunded" "Charge refunded"
    trigger_event "charge.dispute.created" "Dispute created"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Testing Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Check your application logs to verify webhook processing."
echo ""
echo "Useful commands:"
echo "  ${BLUE}stripe listen --forward-to localhost:3000/api/webhooks/stripe${NC}"
echo "  ${BLUE}stripe events list${NC}"
echo "  ${BLUE}stripe logs tail${NC}"
