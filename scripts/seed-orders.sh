#!/bin/bash
STORE="shopintel-demo.myshopify.com"
TOKEN="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"
API="https://$STORE/admin/api/2024-10"

create_order() {
  local email="$1"
  local first="$2"
  local last="$3"
  local city="$4"
  local province="$5"
  local items="$6"
  local financial="$7"
  local fulfillment="$8"
  local created="$9"

  curl -s -X POST "$API/orders.json" \
    -H "X-Shopify-Access-Token: $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"order\": {
        \"email\": \"$email\",
        \"financial_status\": \"$financial\",
        \"fulfillment_status\": $fulfillment,
        \"created_at\": \"$created\",
        \"line_items\": [$items],
        \"billing_address\": {
          \"first_name\": \"$first\",
          \"last_name\": \"$last\",
          \"city\": \"$city\",
          \"province\": \"$province\",
          \"country\": \"US\",
          \"zip\": \"10001\",
          \"address1\": \"123 Main St\"
        },
        \"shipping_address\": {
          \"first_name\": \"$first\",
          \"last_name\": \"$last\",
          \"city\": \"$city\",
          \"province\": \"$province\",
          \"country\": \"US\",
          \"zip\": \"10001\",
          \"address1\": \"123 Main St\"
        }
      }
    }" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"Order {d.get('order',{}).get('name','ERROR')}: \${d.get('order',{}).get('total_price','?')}\")" 2>&1
}

echo "Creating 20 test orders..."

# Order 1 - Loyal customer, big spender
create_order "sarah.chen@email.com" "Sarah" "Chen" "New York" "NY" \
  '{"variant_id":53962516332819,"quantity":2},{"variant_id":53962516398355,"quantity":1},{"variant_id":53962516824339,"quantity":1}' \
  "paid" '"fulfilled"' "2026-03-01T10:30:00-05:00"

# Order 2
create_order "mike.johnson@email.com" "Mike" "Johnson" "Los Angeles" "CA" \
  '{"variant_id":53962516594963,"quantity":3},{"variant_id":53962516463891,"quantity":1}' \
  "paid" '"fulfilled"' "2026-03-02T14:15:00-05:00"

# Order 3
create_order "emma.williams@email.com" "Emma" "Williams" "Chicago" "IL" \
  '{"variant_id":53962517217555,"quantity":1}' \
  "paid" '"fulfilled"' "2026-03-03T09:45:00-05:00"

# Order 4
create_order "sarah.chen@email.com" "Sarah" "Chen" "New York" "NY" \
  '{"variant_id":53962516693267,"quantity":1},{"variant_id":53962516758803,"quantity":2}' \
  "paid" '"fulfilled"' "2026-03-04T16:20:00-05:00"

# Order 5
create_order "james.garcia@email.com" "James" "Garcia" "Miami" "FL" \
  '{"variant_id":53962517283091,"quantity":1},{"variant_id":53962517086483,"quantity":1},{"variant_id":53962516529427,"quantity":1}' \
  "paid" '"fulfilled"' "2026-03-05T11:00:00-05:00"

# Order 6
create_order "olivia.martinez@email.com" "Olivia" "Martinez" "Austin" "TX" \
  '{"variant_id":53962516988179,"quantity":1},{"variant_id":53962516562195,"quantity":1}' \
  "paid" '"fulfilled"' "2026-03-06T13:30:00-05:00"

# Order 7
create_order "noah.brown@email.com" "Noah" "Brown" "Seattle" "WA" \
  '{"variant_id":53962516726035,"quantity":2},{"variant_id":53962517053715,"quantity":3}' \
  "paid" '"fulfilled"' "2026-03-07T08:15:00-05:00"

# Order 8
create_order "ava.taylor@email.com" "Ava" "Taylor" "Denver" "CO" \
  '{"variant_id":53962517184787,"quantity":2},{"variant_id":53962516660499,"quantity":1}' \
  "paid" '"fulfilled"' "2026-03-08T15:45:00-05:00"

# Order 9
create_order "sarah.chen@email.com" "Sarah" "Chen" "New York" "NY" \
  '{"variant_id":53962517348627,"quantity":1},{"variant_id":53962516955411,"quantity":2}' \
  "paid" '"fulfilled"' "2026-03-09T10:00:00-05:00"

# Order 10
create_order "liam.wilson@email.com" "Liam" "Wilson" "Portland" "OR" \
  '{"variant_id":53962517119251,"quantity":3},{"variant_id":53962516431123,"quantity":1}' \
  "paid" '"fulfilled"' "2026-03-10T12:30:00-05:00"

# Order 11
create_order "sophia.davis@email.com" "Sophia" "Davis" "San Francisco" "CA" \
  '{"variant_id":53962516332819,"quantity":1},{"variant_id":53962516988179,"quantity":1},{"variant_id":53962516594963,"quantity":1},{"variant_id":53962516463891,"quantity":1}' \
  "paid" '"fulfilled"' "2026-03-11T09:00:00-05:00"

# Order 12
create_order "ethan.moore@email.com" "Ethan" "Moore" "Nashville" "TN" \
  '{"variant_id":53962517152019,"quantity":1},{"variant_id":53962517020947,"quantity":1}' \
  "paid" '"fulfilled"' "2026-03-12T17:00:00-05:00"

# Order 13
create_order "isabella.clark@email.com" "Isabella" "Clark" "Boston" "MA" \
  '{"variant_id":53962517217555,"quantity":1},{"variant_id":53962516758803,"quantity":1}' \
  "paid" 'null' "2026-03-13T11:30:00-05:00"

# Order 14 - Partially fulfilled
create_order "mike.johnson@email.com" "Mike" "Johnson" "Los Angeles" "CA" \
  '{"variant_id":53962516824339,"quantity":1},{"variant_id":53962516398355,"quantity":2},{"variant_id":53962516529427,"quantity":1}' \
  "paid" '"partial"' "2026-03-14T14:00:00-05:00"

# Order 15
create_order "mia.anderson@email.com" "Mia" "Anderson" "Phoenix" "AZ" \
  '{"variant_id":53962516857107,"quantity":2},{"variant_id":53962517381395,"quantity":1}' \
  "paid" 'null' "2026-03-15T10:45:00-05:00"

# Order 16
create_order "sarah.chen@email.com" "Sarah" "Chen" "New York" "NY" \
  '{"variant_id":53962516431123,"quantity":1},{"variant_id":53962516693267,"quantity":1}' \
  "paid" 'null' "2026-03-16T08:30:00-05:00"

# Order 17
create_order "alexander.lee@email.com" "Alexander" "Lee" "San Diego" "CA" \
  '{"variant_id":53962517283091,"quantity":2},{"variant_id":53962517053715,"quantity":1},{"variant_id":53962516660499,"quantity":1}' \
  "paid" 'null' "2026-03-17T13:15:00-05:00"

# Order 18
create_order "charlotte.thomas@email.com" "Charlotte" "Thomas" "Minneapolis" "MN" \
  '{"variant_id":53962516332819,"quantity":3},{"variant_id":53962516562195,"quantity":1}' \
  "paid" 'null' "2026-03-18T16:00:00-05:00"

# Order 19 - Pending payment
create_order "emma.williams@email.com" "Emma" "Williams" "Chicago" "IL" \
  '{"variant_id":53962516988179,"quantity":1},{"variant_id":53962516726035,"quantity":1},{"variant_id":53962517184787,"quantity":1}' \
  "pending" 'null' "2026-03-19T09:30:00-05:00"

# Order 20
create_order "olivia.martinez@email.com" "Olivia" "Martinez" "Austin" "TX" \
  '{"variant_id":53962517348627,"quantity":1},{"variant_id":53962516955411,"quantity":1},{"variant_id":53962517119251,"quantity":2}' \
  "paid" 'null' "2026-03-20T07:45:00-05:00"

echo ""
echo "Done! 20 orders created."
