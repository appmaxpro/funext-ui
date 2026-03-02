import { create } from 'zustand'
export type Errors = {
  errors: any[],
  push(error:any): void;
  pop(): any;
};

export const useErrorStore = create<Errors>((set, get) => ({
  errors: [],
  push(error:any) {
      set((state) => ({errors: [...state.errors, error]}))
  },
  pop(){

    if(get().errors.length) {
      const errors = get().errors.slice(0);
      const error = errors.shift();
      set((state) => ({errors}))
      return error;
    }
  }
}))