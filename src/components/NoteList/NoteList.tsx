import type { Note } from '../../types/note';
import css from './NoteList.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNote } from '../../services/noteService';

interface NoteListProps {
  notes: Note[];
}

const NoteList = ({ notes }: NoteListProps) => {
  const queryClient = useQueryClient();

  // Мутація видалення всередині компонента
  const mutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      // Автоматичне оновлення списку після видалення
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error) => {
      console.error("Помилка при видаленні:", error);
      alert("Не вдалося видалити нотатку.");
    }
  });

  if (notes.length === 0) return null;

  return (
    <ul className={css.list}>
      {notes.map(({ id, title, content, tag }) => (
        <li key={id} className={css.listItem}>
          <div>
            <h2 className={css.title}>{title}</h2>
            <p className={css.content}>{content}</p>
          </div>
          <div className={css.footer}>
            <span className={css.tag}>{tag}</span>
            <button 
              className={css.button} 
              onClick={() => mutation.mutate(id)}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? '...' : 'Видалити'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};


export default NoteList;