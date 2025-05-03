import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AssistantMessage = {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: string; // ISO string for serialization
};

const initialState: {
    messages: AssistantMessage[];
} = {
    messages: [
        {
            id: "1",
            content: "Hello! I'm your AI investment assistant. How can I help you with your investment journey today?",
            role: "assistant",
            timestamp: new Date().toISOString(),
        },
    ],
};

const LOCAL_STORAGE_KEY = "assistant_conversation";

function loadState() {
    try {
        const serialized = typeof window !== "undefined" && localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serialized) return JSON.parse(serialized);
    } catch { }
    return initialState;
}

function saveState(state: typeof initialState) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch { }
}

const assistantSlice = createSlice({
    name: "assistant",
    initialState: loadState(),
    reducers: {
        addMessage(state, action: PayloadAction<AssistantMessage>) {
            state.messages.push(action.payload);
            saveState(state);
        },
        setMessages(state, action: PayloadAction<AssistantMessage[]>) {
            state.messages = action.payload;
            saveState(state);
        },
        resetConversation(state) {
            state.messages = initialState.messages;
            saveState(state);
        },
    },
});

export const { addMessage, setMessages, resetConversation } = assistantSlice.actions;
export default assistantSlice.reducer;
