CREATE EXTENSION IF NOT EXISTS plpython3u;

CREATE TABLE card_transaction_logs (

);

CREATE TABLE bank_transaction_logs (

);

CREATE OR REPLACE FUNCTION send_to_es(action text, json_data text, index_name text)
RETURNS void AS $$
import requests
import json

def send_to_es(action, data, index):
    payload = json.loads(data)
    doc_id = payload['id']

    es_url = f"http://elasticsearch:9200/{index}/_doc/{doc_id}" if doc_id else f"http://elasticsearch:9200/{index}/_doc"
    headers = {
        "Content-Type": "application/json"
    }

    if action == 'index':
        response = requests.post(es_url, headers=headers, json=payload)
    elif action == 'delete':
        response = requests.delete(es_url, headers=headers)

    if response.status_code not in [200, 201]:
        raise Exception(f"Failed to {action} data to ES: {response.text}")

send_to_es(action, json_data, index_name)
$$ LANGUAGE plpython3u;

CREATE OR REPLACE FUNCTION sync_to_es_card()
RETURNS TRIGGER AS $$
DECLARE
  json_data text;
  action text;
BEGIN
    CASE
        WHEN TG_OP = 'INSERT' THEN
            action := 'index';
        WHEN TG_OP = 'UPDATE' THEN
            action := 'index';
        WHEN TG_OP = 'DELETE' THEN
            action := 'delete';
        ELSE
            RAISE EXCEPTION 'Unknown operation: %', TG_OP;
    END CASE;

    RAISE NOTICE 'Data sent to ES';

    IF TG_OP != 'DELETE' THEN
        json_data = json_build_object(
            'id', NEW.id::text,
            'payment_type', NEW.payment_type,
            'amount', NEW.amount,
            'transaction_date', NEW.transaction_date,
            'description', NEW.description,
            'card_id', NEW.card_id
        )::text;
    ELSE
        json_data = json_build_object('id', OLD.id::text)::text;
    END IF;

    PERFORM send_to_es(action, json_data, 'card_transaction_logs_index');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER es_sync_trigger_card
AFTER INSERT OR UPDATE OR DELETE ON card_transaction_logs
    FOR EACH ROW EXECUTE FUNCTION sync_to_es_card();


CREATE OR REPLACE FUNCTION sync_to_es_bank()
RETURNS TRIGGER AS $$
DECLARE
  json_data text;
  action text;
BEGIN
    CASE
        WHEN TG_OP = 'INSERT' THEN
            action := 'index';
        WHEN TG_OP = 'UPDATE' THEN
            action := 'index';
        WHEN TG_OP = 'DELETE' THEN
            action := 'delete';
        ELSE
            RAISE EXCEPTION 'Unknown operation: %', TG_OP;
    END CASE;

    RAISE NOTICE 'Data sent to ES';

    IF TG_OP != 'DELETE' THEN
        json_data = json_build_object(
            'id', NEW.id,
            'transaction_type', NEW.transaction_type,
            'amount', NEW.amount,
            'transaction_date', NEW.transaction_date,
            'description', NEW.description,
            'account_id', NEW.account_id
        )::text;
    ELSE
        json_data = json_build_object('id', OLD.id)::text;
    END IF;

    PERFORM send_to_es(action, json_data, 'bank_transaction_logs_index');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER es_sync_trigger_bank
AFTER INSERT OR UPDATE OR DELETE ON bank_transaction_logs
    FOR EACH ROW EXECUTE FUNCTION sync_to_es_bank();
