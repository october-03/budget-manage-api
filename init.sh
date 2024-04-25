sleep 10

curl -X PUT "http://elasticsearch:9200/card_transaction_logs_index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "id": {
        "type": "keyword"
      },
      "payment_type": {
        "type": "keyword"
      },
      "amount": {
        "type": "integer"
      },
      "transaction_date": {
        "type": "date",
        "format": "yyyy-MM-dd'\''T'\''HH:mm:ss"
      },
      "description": {
        "type": "text"
      },
      "card_id": {
        "type": "integer"
      }
    }
  }
}'

curl -X PUT "http://elasticsearch:9200/bank_transaction_logs_index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "id": {
        "type": "integer"
      },
      "transaction_type": {
        "type": "keyword"
      },
      "amount": {
        "type": "integer"
      },
      "transaction_date": {
        "type": "date",
        "format": "yyyy-MM-dd'\''T'\''HH:mm:ss"
      },
      "description": {
        "type": "text"
      },
      "account_id": {
        "type": "integer"
      }
    }
  }
}'
