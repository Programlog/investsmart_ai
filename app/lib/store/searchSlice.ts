import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

type SearchResult = {
    id: string;
    title: string;
    snippet: string;
    url: string;
    source: string; // Keep source flexible or align with API filters
};

type SearchState = {
    results: SearchResult[];
    summary: string | null;
    loading: boolean;
    error: string | null;
};

const initialState: SearchState = {
    results: [],
    summary: null,
    loading: false,
    error: null,
};

// Async thunk to fetch search results
export const fetchSearchResults = createAsyncThunk(
    "search/fetchResults",
    async ({ query, filter }: { query: string; filter?: string }, { rejectWithValue }) => {
        try {
            const params: Record<string, string> = { query };
            if (filter && filter !== 'all') { // Don't send 'all' as a filter param
                params.filter = filter;
            }
            const response = await axios.get("/api/search", { params });
            return response.data as { results: SearchResult[]; summary: string | null };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message :
                (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
                "Failed to fetch search results";
            return rejectWithValue(errorMessage);
        }

    }
);

const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
        clearSearchResults: (state) => {
            state.results = [];
            state.summary = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSearchResults.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.results = []; // Clear previous results on new search
                state.summary = null;
            })
            .addCase(fetchSearchResults.fulfilled, (state, action: PayloadAction<{ results: SearchResult[]; summary: string | null }>) => {
                state.loading = false;
                state.results = action.payload.results;
                state.summary = action.payload.summary;
            })
            .addCase(fetchSearchResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;
