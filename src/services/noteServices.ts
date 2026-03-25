import axios from 'axios';
import { Note } from '../types/notes';

const instance = axios.create({
  baseURL: 'https://notehub-public.goit.study/api',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_NOTEHUB_TOKEN}`,
  },
});

export interface FetchNotesResponse {
  data: Note[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export const fetchNotes = async (page: number, search: string): Promise<FetchNotesResponse> => {
  const response = await instance.get<FetchNotesResponse>('/notes', {
    params: { page, perPage: 12, search },
  });
  return response.data;
};

export const createNote = async (note: Omit<Note, 'id'>): Promise<Note> => {
  const response = await instance.post<Note>('/notes', note);
  return response.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response = await instance.delete<Note>(`/notes/${id}`);
  return response.data;
};