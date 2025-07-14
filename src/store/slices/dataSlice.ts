import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface DataState {
  slices: string[];
  data: Record<string, any>;
  loading: boolean;
  error: string | null;
}

const initialState: DataState = {
  slices: [],
  data: {},
  loading: false,
  error: null,
};

export const fetchSlices = createAsyncThunk('data/fetchSlices', async () => {
  const res = await axios.get('/api/data');
  return res.data.slices;
});

export const fetchSliceData = createAsyncThunk(
  'data/fetchSliceData',
  async (slice: string) => {
    const res = await axios.get(`/api/data/${slice}`);
    return { slice, data: res.data };
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSlices.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlices.fulfilled, (state, action) => {
        state.slices = action.payload;
        state.loading = false;
      })
      .addCase(fetchSlices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load slices';
      })
      .addCase(fetchSliceData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSliceData.fulfilled, (state, action) => {
        state.data[action.payload.slice] = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchSliceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load data';
      });
  },
});

export default dataSlice.reducer;
