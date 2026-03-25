import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { fetchNotes, createNote, deleteNote } from '../../services/noteServices';
import NoteList from '../NoteList/NoteList';
import SearchBox from '../SearchBox/SearchBox';
import Pagination from '../Pagination/Pagination';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import css from './App.module.css';

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

  const handlePageClick = (selectedItem: { selected: number }) => {
    setPage(selectedItem.selected + 1);
  };

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSearch(e.target.value)} />
        {data && data.totalPages > 1 && (
          <Pagination 
            pageCount={data.totalPages} 
            onPageChange={handlePageClick} 
            forcePage={page - 1} 
          />
        )}
        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Створити примітку +
        </button>
      </header>

      {isLoading ? <p>Loading...</p> : (
        <NoteList notes={data?.data || []} onDelete={(id) => deleteMutation.mutate(id)} />
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm 
            onSubmit={(values) => createMutation.mutate(values)} 
            onClose={() => setIsModalOpen(false)} 
          />
        </Modal>
      )}
    </div>
  );
};

export default App;