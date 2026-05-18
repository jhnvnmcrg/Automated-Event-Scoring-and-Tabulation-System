import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// ── Thunks ──────────────────────────────────────────────────

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/events');
      return data.events;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchEvent = createAsyncThunk(
  'events/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/events/${id}`);
      return data.event;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/create',
  async (eventData, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/events', eventData);
      return data.event;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/events/${id}`, updates);
      return data.event;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/events/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateEventStatus = createAsyncThunk(
  'events/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await API.patch(`/events/${id}/status`, { status });
      return data.event;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ── Slice ────────────────────────────────────────────────────

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    selectedEvent: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    clearEventError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state) => { state.loading = true; state.error = null; };
    const failed  = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchEvents.pending, loading)
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, failed)

      .addCase(fetchEvent.fulfilled, (state, action) => {
        state.selectedEvent = action.payload;
      })

      .addCase(createEvent.pending, loading)
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
      })
      .addCase(createEvent.rejected, failed)

      .addCase(updateEvent.fulfilled, (state, action) => {
        const idx = state.events.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.events[idx] = action.payload;
        if (state.selectedEvent?._id === action.payload._id)
          state.selectedEvent = action.payload;
      })

      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(e => e._id !== action.payload);
      })

      .addCase(updateEventStatus.fulfilled, (state, action) => {
        const idx = state.events.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.events[idx] = action.payload;
      });
  },
});

export const { setSelectedEvent, clearEventError } = eventSlice.actions;
export default eventSlice.reducer;