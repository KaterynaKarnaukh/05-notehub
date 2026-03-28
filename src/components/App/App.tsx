import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

  // 1. Отримання даних залишається в App, бо вони потрібні для NoteList та Pagination
  const { data, isLoading } = useQuery({
    queryKey: ['notes', page, search],
    queryFn: () => fetchNotes(page, search),
  });

  // 2. Дебаунс пошуку
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

      {/* 3. NoteList тепер сам знає, як видаляти нотатки */}
      {isLoading ? (
        <p>Завантаження нотаток...</p>
      ) : (
        <NoteList notes={data?.notes || []} />
      )}

      {/* 4. NoteForm тепер сам знає, як створювати нотатки */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm onClose={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default App;