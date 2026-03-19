import { create } from 'zustand';

interface FeedbackModalState {
  isOpen: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;
}

export const useFeedbackModalStore = create<FeedbackModalState>((set) => ({
  isOpen: false,
  openFeedback: () => set({ isOpen: true }),
  closeFeedback: () => set({ isOpen: false }),
}));
