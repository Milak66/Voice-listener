import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InitialState {
    voiceText: string,
}

const initialState: InitialState = {
   voiceText: '',
}

const reducer = createSlice({
    name: 'reduser',
    initialState,
    reducers: {
        setVoiceText: (state, action: PayloadAction<string>) => {
            state.voiceText = action.payload;
        }
    },
});
  
export const {
    setVoiceText,
    
} = reducer.actions;
  
export default reducer.reducer;