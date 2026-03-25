import { useState } from 'react'; // Видалили useCallback
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { fetchNotes, createNote, deleteNote } from '../../services/noteServices';
import NoteList from '../NoteList/NoteList';
import SearchBox from '../SearchBox/SearchBox';
import Pagination from '../Pagination/Pagination';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import css from './App.module.css';
import type { Note } from '../../types/note';

const App = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notes', page, search],
    queryFn: () => fetchNotes(page, search),
  });

  const debouncedSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 500);

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        {/* Додали value={search}, щоб задовольнити SearchBoxProps */}
        <SearchBox 
          value={search} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSearch(e.target.value)} 
        />

        {data && data.totalPages > 1 && (
          <Pagination 
            totalPages={data.totalPages} 
            currentPage={page} 
            onPageChange={(nextPage: number) => setPage(nextPage)} // Типізували nextPage
          />
        )}

        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Створити примітку +
        </button>
      </header>

      {isLoading ? <p>Loading...</p> : (
        <NoteList notes={data?.notes || []} onDelete={(id: string) => deleteMutation.mutate(id)} />
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm 
onSubmit={(values) => createMutation.mutate(values as Omit<Note, 'id'>)} 
  onClose={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default App;