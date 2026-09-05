import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calendarAPI } from '../../services/api';
import { getMethodMeta, METHOD_LIST } from '../../services/methods';
import { useAsync } from '../../hooks/useAsync';
import { useUI } from '../../hooks/useUI';
import Modal from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorState';

const DAYS = [
  { id: 'domingo', name: 'Dom', fullName: 'Domingo' },
  { id: 'lunes', name: 'Lun', fullName: 'Lunes' },
  { id: 'martes', name: 'Mar', fullName: 'Martes' },
  { id: 'miercoles', name: 'Mié', fullName: 'Miércoles' },
  { id: 'jueves', name: 'Jue', fullName: 'Jueves' },
  { id: 'viernes', name: 'Vie', fullName: 'Viernes' },
  { id: 'sabado', name: 'Sáb', fullName: 'Sábado' },
];

const FIRST_HOUR = 6;
const LAST_HOUR = 23;
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, index) => `${String(FIRST_HOUR + index).padStart(2, '0')}:00`);
const PX_PER_HOUR = 60;

const EMPTY_BLOCK = { day_of_week: '', start_time: '', end_time: '', method: 'pomodoro', subject: '', notes: '' };

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm || '0:0').split(':').map(Number);
  return h * 60 + (m || 0);
};

function currentWeek() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  return DAYS.map((day, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return { ...day, date: date.getDate(), month: date.getMonth() + 1, isToday: date.toDateString() === today.toDateString() };
  });
}

/** Planificador semanal de bloques de estudio, persistido en el backend. */
export default function Calendario() {
  const navigate = useNavigate();
  const ui = useUI();
  const blocks = useAsync(() => calendarAPI.getBlocks(), []);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_BLOCK);
  const [isSaving, setIsSaving] = useState(false);

  const list = blocks.data || [];
  const weekDays = currentWeek();

  const openCreate = (preset = {}) => {
    setEditing(null);
    setForm({ ...EMPTY_BLOCK, ...preset });
    setShowModal(true);
  };

  const openEdit = (block) => {
    setEditing(block);
    setForm({
      day_of_week: block.day_of_week,
      start_time: block.start_time,
      end_time: block.end_time,
      method: block.method,
      subject: block.subject || '',
      notes: block.notes || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_BLOCK);
  };

  const handleSave = async () => {
    if (!form.day_of_week || !form.start_time || !form.end_time || !form.subject.trim()) {
      ui.warning('Completa el día, las horas y la materia');
      return;
    }
    if (toMinutes(form.start_time) >= toMinutes(form.end_time)) {
      ui.warning('La hora de fin debe ser posterior a la de inicio');
      return;
    }
    setIsSaving(true);
    const payload = { ...form, subject: form.subject.trim(), notes: form.notes.trim() || null };
    try {
      if (editing) {
        await calendarAPI.updateBlock(editing.block_id, payload);
        ui.success('Bloque actualizado');
      } else {
        await calendarAPI.createBlock(payload);
        ui.success('Bloque agregado al calendario');
      }
      closeModal();
      await blocks.reload();
    } catch (error) {
      ui.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (block) => {
    const ok = await ui.confirm({ title: 'Eliminar bloque', message: `${block.subject} · ${block.start_time} a ${block.end_time}`, confirmText: 'Eliminar', danger: true });
    if (!ok) return;
    try {
      await calendarAPI.deleteBlock(block.block_id);
      closeModal();
      await blocks.reload();
      ui.success('Bloque eliminado');
    } catch (error) {
      ui.error(error.message);
    }
  };

  const handleClear = async () => {
    const ok = await ui.confirm({ title: 'Vaciar calendario', message: 'Se borrarán todos los bloques planificados.', confirmText: 'Vaciar', danger: true });
    if (!ok) return;
    try {
      await calendarAPI.clearAll();
      await blocks.reload();
      ui.success('Calendario vaciado');
    } catch (error) {
      ui.error(error.message);
    }
  };

  const blockStyle = (block) => {
    const start = Math.max(toMinutes(block.start_time), FIRST_HOUR * 60);
    const end = Math.min(toMinutes(block.end_time), LAST_HOUR * 60);
    return {
      top: `${((start - FIRST_HOUR * 60) / 60) * PX_PER_HOUR}px`,
      height: `${Math.max(((end - start) / 60) * PX_PER_HOUR, 24)}px`,
    };
  };

  const totalHours = (list.reduce((sum, block) => sum + (toMinutes(block.end_time) - toMinutes(block.start_time)), 0) / 60).toFixed(1);

  if (blocks.loading && !blocks.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50">
        <FullPageSpinner label="Cargando calendario..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-block bg-gradient-to-br from-green-400 to-green-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform -rotate-2 mb-4">📅 Calendario</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Planifica tu semana de estudio</h1>
          <p className="text-xl text-gray-600">Organiza tus bloques de estudio y mantén una rutina efectiva</p>
        </div>

        <ErrorBanner message={blocks.error} onRetry={blocks.reload} />

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-3xl font-bold text-gray-800">{list.length}</p>
            <p className="text-gray-600">Bloques planificados</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-3xl font-bold text-gray-800">{totalHours}h</p>
            <p className="text-gray-600">Horas semanales planificadas</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center">
            <button
              onClick={() => openCreate()}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-500 hover:to-green-700 transition-all shadow-lg"
            >
              + Agregar bloque
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-8 bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="p-4 text-center font-semibold border-r border-green-400">Hora</div>
                {weekDays.map((day) => (
                  <div key={day.id} className={`p-4 text-center font-semibold border-r border-green-400 last:border-r-0 ${day.isToday ? 'bg-green-400/30' : ''}`}>
                    <div className="text-sm opacity-80">{day.name}</div>
                    <div className={`text-xl ${day.isToday ? 'bg-white text-green-600 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>{day.date}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-8">
                <div className="border-r border-gray-200">
                  {HOURS.map((hour) => (
                    <div key={hour} className="border-b border-gray-200 p-2 text-xs text-gray-500 text-right pr-3" style={{ height: PX_PER_HOUR }}>
                      {hour}
                    </div>
                  ))}
                </div>

                {weekDays.map((day) => (
                  <div key={day.id} className={`border-r border-gray-200 last:border-r-0 relative ${day.isToday ? 'bg-green-50/50' : ''}`}>
                    {HOURS.map((hour) => (
                      <button
                        type="button"
                        key={hour}
                        aria-label={`Agregar bloque el ${day.fullName} a las ${hour}`}
                        className="w-full border-b border-gray-200 hover:bg-green-50 transition-colors block"
                        style={{ height: PX_PER_HOUR }}
                        onClick={() => {
                          const endHour = Number(hour.split(':')[0]) + 1;
                          openCreate({ day_of_week: day.id, start_time: hour, end_time: `${String(endHour).padStart(2, '0')}:00` });
                        }}
                      />
                    ))}

                    {list
                      .filter((block) => block.day_of_week === day.id)
                      .map((block) => {
                        const meta = getMethodMeta(block.method);
                        return (
                          <button
                            type="button"
                            key={block.block_id}
                            className={`absolute left-1 right-1 ${meta.bgColor} ${meta.borderColor} border-l-4 rounded-r-lg p-2 text-left hover:shadow-lg transition-all overflow-hidden`}
                            style={blockStyle(block)}
                            onClick={() => openEdit(block)}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-sm">{meta.icon}</span>
                              <span className={`text-xs font-semibold ${meta.textColor} truncate`}>{block.subject}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {block.start_time} - {block.end_time}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📖 Leyenda de métodos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {METHOD_LIST.map((method) => (
              <div key={method.name} className="flex items-center gap-2">
                <div className={`${method.bgColor} ${method.borderColor} border-2 w-8 h-8 rounded-lg flex items-center justify-center`}>{method.icon}</div>
                <span className="text-sm font-semibold text-gray-700">{method.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button onClick={() => navigate('/metodos-estudio')} className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">
            ← Volver a métodos
          </button>
          <button onClick={() => navigate('/seguimiento')} className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg">
            Ver progreso 📊
          </button>
          <button
            onClick={handleClear}
            disabled={list.length === 0}
            className="flex-1 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all border-2 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ Vaciar calendario
          </button>
        </div>

        <Modal open={showModal} onClose={closeModal} title={editing ? 'Editar bloque' : 'Agregar bloque de estudio'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="block-day">
                Día *
              </label>
              <select
                id="block-day"
                value={form.day_of_week}
                onChange={(event) => setForm({ ...form, day_of_week: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              >
                <option value="">Selecciona un día</option>
                {weekDays.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.fullName} ({day.date}/{day.month})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="block-start">
                  Hora de inicio *
                </label>
                <input
                  id="block-start"
                  type="time"
                  value={form.start_time}
                  onChange={(event) => setForm({ ...form, start_time: event.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="block-end">
                  Hora de fin *
                </label>
                <input
                  id="block-end"
                  type="time"
                  value={form.end_time}
                  onChange={(event) => setForm({ ...form, end_time: event.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="block-method">
                Método *
              </label>
              <select
                id="block-method"
                value={form.method}
                onChange={(event) => setForm({ ...form, method: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
              >
                {METHOD_LIST.map((method) => (
                  <option key={method.name} value={method.name}>
                    {method.icon} {method.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="block-subject">
                Materia o tema *
              </label>
              <input
                id="block-subject"
                type="text"
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                placeholder="Ej: Matemáticas, Historia..."
                maxLength={100}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="block-notes">
                Notas (opcional)
              </label>
              <textarea
                id="block-notes"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="Capítulos a estudiar, objetivos, etc."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            {editing && (
              <button onClick={() => handleDelete(editing)} className="bg-red-50 text-red-600 px-5 py-3 rounded-xl font-semibold hover:bg-red-100 border-2 border-red-200" aria-label="Eliminar bloque">
                🗑️
              </button>
            )}
            <button onClick={closeModal} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-500 hover:to-green-700 transition-all shadow-lg disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : editing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
