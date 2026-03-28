import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { fetchNotes} from '../../services/noteService';
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

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['notes', page, search],
    queryFn: () => fetchNotes(page, search),
    // Додаємо безшовну пагінацію
    placeholderData: keepPreviousData, 
  });

  const debouncedSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 500);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox 
          value={search} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSearch(e.target.value)} 
        />

        {data && data.totalPages > 1 && (
          <Pagination 
            totalPages={data.totalPages} 
            currentPage={page} 
            onPageChange={(nextPage: number) => setPage(nextPage)} 
          />
        )}

        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Створити примітку +
        </button>
      </header>

      {/* Використовуємо isLoading лише для першого завантаження.
          Завдяки placeholderData, під час перемикання сторінок 
          isLoading буде false, а дані будуть "старими", поки не прийдуть нові.
      */}
      {isLoading ? (
        <p>Завантаження нотаток...</p>
      ) : (
        <div style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          <NoteList notes={data?.notes || []} />
        </div>
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm onClose={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default App;