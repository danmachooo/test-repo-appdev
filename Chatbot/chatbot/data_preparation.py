import random
from faker import Faker
import pandas as pd
from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer

fake = Faker()

# Authentic intent templates
intent_templates = [
    ("Can you check the stock for {item}?", "check_stock"),
    ("Are we running low on {item}?", "reorder_check"),
    ("Which items will expire by {time}?", "check_expiry"),
    ("Set a notification for when {item} stock falls below {quantity}.", "set_alert"),
    ("Could you update the count for {item}?", "update_stock"),
    ("How much {item} do we have left?", "check_stock"),
    ("Do we need to reorder {item} soon?", "reorder_check"),
    ("What’s the status of {item} delivery?", "check_delivery"),
    ("Set a reminder to reorder {item} before {time}.", "set_alert"),
    ("Check the expiration dates for {item}.", "check_expiry"),
    ("Please update the inventory for {item} to {quantity}.", "update_stock"),
    ("What are our current stock levels?", "check_stock"),
    ("Can you check the expiry dates on all {item}?", "check_expiry"),
    ("Notify me about {item} stock if it goes under {quantity}.", "set_alert"),
]

# Expanded items and ranges
items = [
    "surgical gloves", "IV fluids", "painkillers", "antiseptics", "cotton rolls", 
    "scalpels", "antibiotic ointment", "thermometers", "stethoscopes", 
    "face masks", "bandages", "disinfectant sprays", "hand sanitizer"
]
quantities = [str(q) for q in range(1, 101)]
times = [fake.date_between(start_date="-1y", end_date="today").strftime("%Y-%m-%d") for _ in range(100)]

intent_data = []
for _ in range(1500):
    template, intent = random.choice(intent_templates)
    item = random.choice(items)
    quantity = random.choice(quantities)
    time = random.choice(times)
    query = template.format(item=item, quantity=quantity, time=time)
    intent_data.append((query, intent))

# Expanded NER templates
ner_templates = [
    ("Reorder {quantity} {item}.", [(8, 8 + len(quantity), "QUANTITY"), (9 + len(quantity), 9 + len(quantity) + len(item), "ITEM")]),
    ("What items expire {time}?", [(17, 17 + len(time), "DATE")]),
    ("We have {quantity} {item} in stock.", [(8, 8 + len(quantity), "QUANTITY"), (9 + len(quantity), 9 + len(quantity) + len(item), "ITEM")]),
    ("Set alert for {item} stock below {quantity}.", [(14, 14 + len(item), "ITEM"), (27 + len(item), 27 + len(item) + len(quantity), "QUANTITY")]),
    ("The {item} expire on {date}.", [(4, 4 + len(item), "ITEM"), (17 + len(item), 17 + len(item) + len(fake.date()), "DATE")]),
    ("Order {quantity} {item} for {time}.", [(6, 6 + len(quantity), "QUANTITY"), (7 + len(quantity), 7 + len(quantity) + len(item), "ITEM"), (12 + len(quantity) + len(item), 12 + len(quantity) + len(item) + len(time), "DATE")]),
]

ner_data = []
for _ in range(1500):
    template, entities_template = random.choice(ner_templates)
    quantity = random.choice(quantities)
    item = random.choice(items)
    time = random.choice(times)
    date = fake.date()
    query = template.format(quantity=quantity, item=item, time=time, date=date)
    entities = [(start, start + len(text), label) for start, _, label, text in zip([ent[0] for ent in entities_template], [ent[1] for ent in entities_template], [ent[2] for ent in entities_template], [quantity, item, time, date]) if label]
    ner_data.append((query, {"entities": entities}))

# Split intent data
def prepare_intent_data():
    df = pd.DataFrame(intent_data, columns=['query', 'intent'])
    
    # Split data
    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)
    
    return train_df, test_df

# Split NER data
def prepare_ner_data():
    train_data, test_data = train_test_split(ner_data, test_size=0.2, random_state=42)
    return train_data, test_data

def tokenize_and_align_labels(examples, tokenizer):
    tokenized_inputs = tokenizer(
        examples["tokens"],
        truncation=True,
        is_split_into_words=True,
        padding=True,
    )
    labels = []
    for i, label in enumerate(examples["ner_tags"]):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        previous_word_idx = None
        label_ids = []
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)
            elif word_idx != previous_word_idx:
                label_ids.append(label[word_idx])
            else:
                label_ids.append(-100)
            previous_word_idx = word_idx
        labels.append(label_ids)

    tokenized_inputs["labels"] = labels
    return tokenized_inputs

print("Authentic data preparation complete. Total intents: 1500, Total NER: 1500")
