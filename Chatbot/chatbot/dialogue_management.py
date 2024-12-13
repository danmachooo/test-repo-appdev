class DialogueManager:
    def __init__(self):
        self.context = []
        self.max_context_length = 5
    
    def update_context(self, user_input, bot_response, intent, entities):
        self.context.append({
            "user_input": user_input,
            "bot_response": bot_response,
            "intent": intent,
            "entities": entities
        })
        if len(self.context) > self.max_context_length:
            self.context.pop(0)
    
    def get_context(self):
        return self.context
    
    def get_last_intent(self):
        if self.context:
            return self.context[-1]["intent"]
        return None
    
    def get_last_entities(self):
        if self.context:
            return self.context[-1]["entities"]
        return []

print("Dialogue management system ready.")

