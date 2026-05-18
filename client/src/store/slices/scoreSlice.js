import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const submitScores = createAsyncThunk(
  'scores/submit',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/scores', payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchMyScores = createAsyncThunk(
  'scores/fetchMine',
  async (participantId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/scores/my/${participantId}`);
      return { participantId, scores: data.scores };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchResults = createAsyncThunk(
  'scores/fetchResults',
  async (categoryId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/results/category/${categoryId}`);
      return { categoryId, results: data.results };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const scoreSlice = createSlice({
  name: 'scores',
  initialState: {
    // myScores[participantId] = [{ criterion, value }]
    myScores:  {},
    // results[categoryId] = [{ participant, totalScore, rank, breakdown }]
    results:   {},
    submitting: false,
    loading:    false,
    error:      null,
  },
  reducers: {
    // Update results in real-time from socket
    updateResults: (state, action) => {
      const { categoryId, results } = action.payload;
      state.results[categoryId] = results;
    },
    clearScoreError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitScores.pending,   (state) => { state.submitting = true; state.error = null; })
      .addCase(submitScores.fulfilled, (state, action) => {
        state.submitting = false;
        const { results } = action.payload;
        if (results?.length) {
          const categoryId = results[0].category;
          state.results[categoryId] = results;
        }
      })
      .addCase(submitScores.rejected,  (state, action) => { state.submitting = false; state.error = action.payload; })

      .addCase(fetchMyScores.fulfilled, (state, action) => {
        const { participantId, scores } = action.payload;
        state.myScores[participantId] = scores;
      })

      .addCase(fetchResults.pending,   (state) => { state.loading = true; })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, results } = action.payload;
        state.results[categoryId] = results;
      })
      .addCase(fetchResults.rejected,  (state) => { state.loading = false; });
  },
});

export const { updateResults, clearScoreError } = scoreSlice.actions;
export default scoreSlice.reducer;