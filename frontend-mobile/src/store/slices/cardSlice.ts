import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card } from '@types/card.types';

interface CardState {
  linkedCards: Card[];
  primaryCard: Card | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CardState = {
  linkedCards: [],
  primaryCard: null,
  isLoading: false,
  error: null,
};

const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setCards: (state, action: PayloadAction<Card[]>) => {
      state.linkedCards = action.payload;
      state.primaryCard = action.payload.find(card => card.isPrimary) || null;
    },
    addCard: (state, action: PayloadAction<Card>) => {
      state.linkedCards.push(action.payload);
      if (action.payload.isPrimary) {
        state.primaryCard = action.payload;
      }
    },
    updateCard: (state, action: PayloadAction<Card>) => {
      const index = state.linkedCards.findIndex(card => card.id === action.payload.id);
      if (index !== -1) {
        state.linkedCards[index] = action.payload;
        if (action.payload.isPrimary) {
          state.primaryCard = action.payload;
        }
      }
    },
    removeCard: (state, action: PayloadAction<string>) => {
      state.linkedCards = state.linkedCards.filter(card => card.id !== action.payload);
      if (state.primaryCard?.id === action.payload) {
        state.primaryCard = state.linkedCards.find(card => card.isPrimary) || null;
      }
    },
    setPrimaryCard: (state, action: PayloadAction<string>) => {
      // Remove primary from all cards
      state.linkedCards.forEach(card => {
        card.isPrimary = false;
      });
      
      // Set new primary card
      const card = state.linkedCards.find(card => card.id === action.payload);
      if (card) {
        card.isPrimary = true;
        state.primaryCard = card;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCards,
  addCard,
  updateCard,
  removeCard,
  setPrimaryCard,
  setLoading,
  setError,
  clearError,
} = cardSlice.actions;

export default cardSlice.reducer;
