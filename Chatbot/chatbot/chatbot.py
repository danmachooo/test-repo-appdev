from data_preparation import prepare_intent_data, prepare_ner_data
from intent_classification import train_intent_model
from ner_model import train_ner_model
from dialogue_management import DialogueManager
import torch
from db_utils import check_stock, check_expiry, set_alert, update_stock, get_items_below_threshold
from datetime import datetime, timedelta

# Prepare data and train models
train_intent_df, test_intent_df = prepare_intent_data()
train_ner_data, test_ner_data = prepare_ner_data()
intent_model, intent_tokenizer, intent_encoder = train_intent_model(train_intent_df, test_intent_df)
ner_model, ner_tokenizer, id2tag = train_ner_model(train_ner_data, test_ner_data)

# Initialize dialogue manager
dialogue_manager = DialogueManager()

def classify_intent(text):
    inputs = intent_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        logits = intent_model(**inputs).logits
    predicted_class_id = logits.argmax().item()
    return intent_encoder.inverse_transform([predicted_class_id])[0]

def extract_entities(text):
    inputs = ner_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        logits = ner_model(**inputs).logits
    predictions = torch.argmax(logits, dim=2)
    predicted_tokens = ner_tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
    
    entities = []
    current_entity = None
    for token, prediction in zip(predicted_tokens, predictions[0]):
        if prediction != 0:  # 0 is usually the index for 'O' (Outside) tag
            if current_entity is None:
                current_entity = {"type": id2tag[prediction.item()], "text": token}
            else:
                current_entity["text"] += f" {token}"
        elif current_entity is not None:
            entities.append(current_entity)
            current_entity = None
    
    if current_entity is not None:
        entities.append(current_entity)
    
    return entities

def generate_response(intent, entities, context):
    if intent == "check_stock":
        if entities and entities[0]['type'] == 'ITEM':
            item = entities[0]['text']
            quantity = check_stock(item)
            if quantity is not None:
                return f"We currently have {quantity} {item} in stock."
            else:
                return f"I couldn't find any information about {item} in our inventory."
        else:
            return "Which item would you like to check?"

    elif intent == "reorder_check":
        items_below_threshold = get_items_below_threshold()
        if items_below_threshold:
            response = "The following items are below the reorder threshold:\n"
            for item, quantity, threshold in items_below_threshold:
                response += f"- {item}: {quantity} (threshold: {threshold})\n"
            return response
        else:
            return "All items are currently above their reorder thresholds."

    elif intent == "check_expiry":
        if entities and entities[0]['type'] == 'DATE':
            date = entities[0]['text']
            try:
                date_obj = datetime.strptime(date, "%Y-%m-%d")
            except ValueError:
                date_obj = datetime.now() + timedelta(days=30)  # Default to next month if date format is invalid
            expiring_items = check_expiry(date_obj.strftime("%Y-%m-%d"))
            if expiring_items:
                response = f"The following items are expiring by {date_obj.strftime('%Y-%m-%d')}:\n"
                for item, expiry_date in expiring_items:
                    response += f"- {item}: expires on {expiry_date}\n"
                return response
            else:
                return f"No items are expiring by {date_obj.strftime('%Y-%m-%d')}."
        else:
            return "For which date would you like to check expiring items? (Format: YYYY-MM-DD)"

    elif intent == "set_alert":
        if len(entities) >= 2 and entities[0]['type'] == 'ITEM' and entities[1]['type'] == 'QUANTITY':
            item = entities[0]['text']
            threshold = int(entities[1]['text'])
            set_alert(item, threshold)
            return f"Alert set for {item} when stock drops below {threshold}."
        else:
            return "Please specify the item and quantity for the alert."

    elif intent == "update_stock":
        if len(entities) >= 2 and entities[0]['type'] == 'ITEM' and entities[1]['type'] == 'QUANTITY':
            item = entities[0]['text']
            quantity = int(entities[1]['text'])
            update_stock(item, quantity)
            return f"Stock updated for {item}. New quantity: {quantity}."
        else:
            return "Please specify the item and new quantity to update the stock."

    else:
        return "I'm not sure how to handle that request. Can you please rephrase?"

def process_input(user_input):
    intent = classify_intent(user_input)
    entities = extract_entities(user_input)
    
    context = dialogue_manager.get_context()
    response = generate_response(intent, entities, context)
    
    dialogue_manager.update_context(user_input, response, intent, entities)
    
    return response

# # Example usage
# print(process_input("How many gloves do we have?"))
# print(process_input("Set an alert when we have less than 20 masks."))
# print(process_input("What items are expiring next month?"))
# print(process_input("Update the stock of syringes to 150."))
# print(process_input("Do we need to reorder anything?"))

print("Chatbot is ready for use.")

