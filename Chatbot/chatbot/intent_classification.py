from transformers import AutoModelForSequenceClassification, AutoTokenizer, Trainer, TrainingArguments
from sklearn.preprocessing import LabelEncoder
import numpy as np
import torch

def create_intent_model(num_labels):
    model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=num_labels)
    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
    return model, tokenizer

class IntentDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

def train_intent_model(train_df, test_df):
    le = LabelEncoder()
    train_df['intent_encoded'] = le.fit_transform(train_df['intent'])
    test_df['intent_encoded'] = le.transform(test_df['intent'])

    model, tokenizer = create_intent_model(len(le.classes_))

    train_encodings = tokenizer(train_df['query'].tolist(), truncation=True, padding=True)
    test_encodings = tokenizer(test_df['query'].tolist(), truncation=True, padding=True)

    train_dataset = IntentDataset(train_encodings, train_df['intent_encoded'].tolist())
    test_dataset = IntentDataset(test_encodings, test_df['intent_encoded'].tolist())

    training_args = TrainingArguments(
        output_dir='./results',
        num_train_epochs=3,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=64,
        warmup_steps=500,
        weight_decay=0.01,
        logging_dir='./logs',
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset
    )

    trainer.train()

    return model, tokenizer, le

print("Intent classification model ready.")

