from transformers import AutoModelForTokenClassification, AutoTokenizer, Trainer, TrainingArguments, DataCollatorForTokenClassification
from datasets import Dataset
import torch

from data_preparation import tokenize_and_align_labels  # Ensure this is correct

def create_ner_model(num_labels):
    model = AutoModelForTokenClassification.from_pretrained("distilbert-base-uncased", num_labels=num_labels)
    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
    return model, tokenizer

def train_ner_model(train_data, test_data):
    unique_tags = set()
    for _, annotations in train_data + test_data:
        for _, _, label in annotations['entities']:
            unique_tags.add(label)
    
    tag2id = {tag: id for id, tag in enumerate(unique_tags)}
    id2tag = {id: tag for tag, id in tag2id.items()}

    def preprocess_data(data):
        processed_data = []
        for text, annotations in data:
            tokens = text.split()
            ner_tags = ['O'] * len(tokens)
            for start, end, label in annotations['entities']:
                start_token = len(text[:start].split())
                end_token = len(text[:end].split())
                for i in range(start_token, min(end_token, len(ner_tags))):
                    ner_tags[i] = label
            processed_data.append((tokens, [tag2id.get(tag, 0) for tag in ner_tags]))
        return processed_data

    train_dataset = Dataset.from_dict({
        "tokens": [tokens for tokens, _ in preprocess_data(train_data)],
        "ner_tags": [tags for _, tags in preprocess_data(train_data)]
    })
    test_dataset = Dataset.from_dict({
        "tokens": [tokens for tokens, _ in preprocess_data(test_data)],
        "ner_tags": [tags for _, tags in preprocess_data(test_data)]
    })

    model, tokenizer = create_ner_model(len(tag2id))

    train_tokenized_datasets = train_dataset.map(
        lambda examples: tokenize_and_align_labels(examples, tokenizer),
        batched=True,
        remove_columns=train_dataset.column_names
    )
    test_tokenized_datasets = test_dataset.map(
        lambda examples: tokenize_and_align_labels(examples, tokenizer),
        batched=True,
        remove_columns=test_dataset.column_names
    )

    data_collator = DataCollatorForTokenClassification(tokenizer=tokenizer)

    training_args = TrainingArguments(
        output_dir="./results",
        evaluation_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        num_train_epochs=3,
        weight_decay=0.01,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_tokenized_datasets,
        eval_dataset=test_tokenized_datasets,
        tokenizer=tokenizer,
        data_collator=data_collator,
    )

    trainer.train()

    return model, tokenizer, id2tag
