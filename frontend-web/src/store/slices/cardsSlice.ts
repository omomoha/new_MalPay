import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cardsAPI } from '../../services/api';

export interface Card {
  id: string;
  cardNumberMasked: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover';
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddCardRequest {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
}

export interface CardsState {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
  maxCards: number;
  addingCard: boolean;
}

const initialState: CardsState = {
  cards: [],
  isLoading: false,
  error: null,
  maxCards: 3,
  addingCard: false,
};

// Async thunks
export const fetchCards = createAsyncThunk(
  'cards/fetchCards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cardsAPI.getCards();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch cards');
    }
  }
);

export const addCard = createAsyncThunk(
  'cards/addCard',
  async (cardData: AddCardRequest, { rejectWithValue }) => {
    try {
      const response = await cardsAPI.addCard(cardData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to add card');
    }
  }
);

export const setDefaultCard = createAsyncThunk(
  'cards/setDefaultCard',
  async (cardId: string, { rejectWithValue }) => {
    try {
      const response = await cardsAPI.setDefaultCard(cardId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to set default card');
    }
  }
);

export const deleteCard = createAsyncThunk(
  'cards/deleteCard',
  async (cardId: string, { rejectWithValue }) => {
    try {
      await cardsAPI.deleteCard(cardId);
      return { cardId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete card');
    }
  }
);

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAddingCard: (state, action: PayloadAction<boolean>) => {
      state.addingCard = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cards
      .addCase(fetchCards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cards = action.payload.cards;
        state.maxCards = action.payload.maxCards;
        state.error = null;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add Card
      .addCase(addCard.pending, (state) => {
        state.addingCard = true;
        state.error = null;
      })
      .addCase(addCard.fulfilled, (state, action) => {
        state.addingCard = false;
        state.cards.push(action.payload.card);
        state.error = null;
      })
      .addCase(addCard.rejected, (state, action) => {
        state.addingCard = false;
        state.error = action.payload as string;
      })
      // Set Default Card
      .addCase(setDefaultCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setDefaultCard.fulfilled, (state) => {
        state.isLoading = false;
        // Update default card in the cards array
        state.cards = state.cards.map(card => ({
          ...card,
          isDefault: false
        }));
        state.error = null;
      })
      .addCase(setDefaultCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Card
      .addCase(deleteCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cards = state.cards.filter(card => card.id !== action.payload.cardId);
        state.error = null;
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setAddingCard } = cardsSlice.actions;
export default cardsSlice.reducer;
