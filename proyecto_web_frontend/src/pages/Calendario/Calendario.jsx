import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Nota: Descomentar cuando el endpoint esté listo
// import { calendarAPI } from '../../services/api';

function Calendario() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Estado para nuevo bloque
  const [newBlock, setNewBlock] = useState({
    day: '',
    startTime: '',
    endTime: '',
    method: 'pomodoro',
    subject: '',
    notes: ''
  });

  // Estado para bloques guardados
  const [blocks, setBlocks] = useState([]);

  // Días de la semana (empezando en Domingo)
  const daysOfWeek = [
    { id: 'domingo', name: 'Dom', fullName: 'Domingo' },
    { id: 'lunes', name: 'Lun', fullName: 'Lunes' },
    { id: 'martes', name: 'Mar', fullName: 'Martes' },
    { id: 'miercoles', name: 'Mié', fullName: 'Miércoles' },
    { id: 'jueves', name: 'Jue', fullName: 'Jueves' },
    { id: 'viernes', name: 'Vie', fullName: 'Viernes' },
    { id: 'sabado', name: 'Sáb', fullName: 'Sábado' }
  ];

  // Horas del día (8 AM - 10 PM)
  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  // Métodos disponibles
  const methods = [
    { id: 'pomodoro', name: 'Pomodoro', color: 'from-red-400 to-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-300', textColor: 'text-red-700', icon: '🍅' },
    { id: 'feynman', name: 'Feynman', color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-100', borderColor: 'border-purple-300', textColor: 'text-purple-700', icon: '🧠' },
    { id: 'cornell', name: 'Cornell', color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-300', textColor: 'text-blue-700', icon: '📝' },
    { id: 'flashcards', name: 'Flashcards', color: 'from-yellow-400 to-orange-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300', textColor: 'text-yellow-700', icon: '🗂️' }
  ];

  // Cargar bloques al iniciar
  useEffect(() => {
    loadBlocks();
  }, []);

  // Cargar bloques (intentar backend, fallback a localStorage)
  const loadBlocks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Descomentar cuando el endpoint esté listo
      // const blocksData = await calendarAPI.getBlocks();
      // setBlocks(blocksData);
      
      // Por ahora usar localStorage como fallback
      const savedBlocks = localStorage.getItem('calendarBlocks');
      if (savedBlocks) {
        setBlocks(JSON.parse(savedBlocks));
      }
    } catch (err) {
      console.error('Error cargando bloques:', err);
      // Fallback a localStorage
      const savedBlocks = localStorage.getItem('calendarBlocks');
      if (savedBlocks) {
        setBlocks(JSON.parse(savedBlocks));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar bloques (backend + localStorage como backup)
  const saveBlocks = async (newBlocks) => {
    try {
      // TODO: Descomentar cuando el endpoint esté listo
      // await calendarAPI.createBlock(newBlocks);
      
      // Guardar en localStorage como backup
      localStorage.setItem('calendarBlocks', JSON.stringify(newBlocks));
      setBlocks(newBlocks);
    } catch (err) {
      console.error('Error guardando bloques:', err);
      // Guardar en localStorage como fallback
      localStorage.setItem('calendarBlocks', JSON.stringify(newBlocks));
      setBlocks(newBlocks);
    }
  };

  // Obtener fecha actual
  const getCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek); // Ir al domingo
    
    return daysOfWeek.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        ...day,
        date: date.getDate(),
        month: date.getMonth() + 1,
        isToday: date.toDateString() === today.toDateString()
      };
    });
  };

  const weekDays = getCurrentWeek();

  // Agregar o editar bloque
  const handleSaveBlock = async () => {
    if (!newBlock.day || !newBlock.startTime || !newBlock.endTime || !newBlock.subject) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar que endTime sea después de startTime
    if (newBlock.startTime >= newBlock.endTime) {
      alert('La hora de fin debe ser después de la hora de inicio');
      return;
    }

    setIsSaving(true);

    try {
      let updatedBlocks;
      
      if (editingBlock) {
        // Editar bloque existente
        updatedBlocks = blocks.map(block =>
          block.id === editingBlock.id ? { ...newBlock, id: block.id } : block
        );
      } else {
        // Agregar nuevo bloque
        updatedBlocks = [...blocks, {
          id: Date.now(),
          ...newBlock
        }];
      }

      await saveBlocks(updatedBlocks);

      // Reset form
      setNewBlock({
        day: '',
        startTime: '',
        endTime: '',
        method: 'pomodoro',
        subject: '',
        notes: ''
      });
      setEditingBlock(null);
      setShowAddModal(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      console.error('Error guardando bloque:', err);
      alert('Error al guardar el bloque: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Abrir modal para editar
  const handleEditBlock = (block) => {
    setNewBlock(block);
    setEditingBlock(block);
    setShowAddModal(true);
  };

  // Eliminar bloque
  const handleDeleteBlock = async (blockId) => {
    if (window.confirm('¿Estás seguro de eliminar este bloque de estudio?')) {
      try {
        const updatedBlocks = blocks.filter(b => b.id !== blockId);
        await saveBlocks(updatedBlocks);
      } catch (err) {
        console.error('Error eliminando bloque:', err);
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  // Obtener bloques para un día específico
  const getBlocksForDay = (dayId) => {
    return blocks.filter(block => block.day === dayId);
  };

  // Calcular posición y altura del bloque
  const getBlockStyle = (startTime, endTime) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);

    const startOffset = (startHour - 8) * 60 + startMinute; // Minutos desde las 8 AM
    const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

    const top = (startOffset / 60) * 60; // 60px por hora
    const height = (duration / 60) * 60;

    return { top: `${top}px`, height: `${height}px` };
  };

  // Limpiar todos los bloques
  const handleClearCalendar = async () => {
    if (window.confirm('¿Estás seguro de borrar todos los bloques de estudio del calendario?')) {
      try {
        await saveBlocks([]);
      } catch (err) {
        console.error('Error limpiando calendario:', err);
        alert('Error al limpiar: ' + err.message);
      }
    }
  };

  // Obtener método por ID
  const getMethodById = (methodId) => {
    return methods.find(m => m.id === methodId);
  };

  // Calcular total de horas planificadas
  const getTotalPlannedHours = () => {
    return blocks.reduce((total, block) => {
      const startHour = parseInt(block.startTime.split(':')[0]);
      const startMinute = parseInt(block.startTime.split(':')[1]);
      const endHour = parseInt(block.endTime.split(':')[0]);
      const endMinute = parseInt(block.endTime.split(':')[1]);
      const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      return total + (duration / 60);
    }, 0).toFixed(1);
  };

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-block bg-gradient-to-br from-green-400 to-green-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform -rotate-2 mb-4">
            📅 Calendario
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Planifica tu Semana de Estudio
          </h1>
          <p className="text-xl text-gray-600">
            Organiza tus bloques de estudio y mantén una rutina efectiva
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-4xl mx-auto">
            ⚠️ {error}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-3xl font-bold text-gray-800">{blocks.length}</p>
            <p className="text-gray-600">Bloques planificados</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-3xl font-bold text-gray-800">{getTotalPlannedHours()}h</p>
            <p className="text-gray-600">Horas de estudio</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-lg"
            >
              + Agregar Bloque
            </button>
          </div>
        </div>

        {/* Calendario Semanal */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Header del Calendario */}
          <div className="grid grid-cols-8 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="p-4 text-center font-semibold border-r border-green-400">
              Hora
            </div>
            {weekDays.map((day) => (
              <div
                key={day.id}
                className={`p-4 text-center font-semibold border-r border-green-400 last:border-r-0 ${
                  day.isToday ? 'bg-green-400/30' : ''
                }`}
              >
                <div className="text-sm opacity-80">{day.name}</div>
                <div className={`text-xl ${day.isToday ? 'bg-white text-green-600 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                  {day.date}
                </div>
              </div>
            ))}
          </div>

          {/* Grid del Calendario */}
          <div className="grid grid-cols-8">
            {/* Columna de horas */}
            <div className="border-r border-gray-200">
              {hours.map((hour) => (
                <div key={hour} className="h-[60px] border-b border-gray-200 p-2 text-xs text-gray-500 text-right pr-3">
                  {hour}
                </div>
              ))}
            </div>

            {/* Columnas de días */}
            {weekDays.map((day) => (
              <div 
                key={day.id} 
                className={`border-r border-gray-200 last:border-r-0 relative ${day.isToday ? 'bg-green-50/50' : ''}`}
              >
                {/* Grid de horas */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-gray-200 hover:bg-green-50 cursor-pointer transition-colors"
                    onClick={() => {
                      const endHour = parseInt(hour.split(':')[0]) + 1;
                      setNewBlock({
                        ...newBlock,
                        day: day.id,
                        startTime: hour,
                        endTime: `${endHour.toString().padStart(2, '0')}:00`
                      });
                      setShowAddModal(true);
                    }}
                  />
                ))}

                {/* Bloques de estudio */}
                {getBlocksForDay(day.id).map((block) => {
                  const method = getMethodById(block.method);
                  const style = getBlockStyle(block.startTime, block.endTime);

                  return (
                    <div
                      key={block.id}
                      className={`absolute left-1 right-1 ${method.bgColor} ${method.borderColor} border-l-4 rounded-r-lg p-2 cursor-pointer hover:shadow-lg transition-all overflow-hidden`}
                      style={style}
                      onClick={() => handleEditBlock(block)}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm">{method.icon}</span>
                        <span className={`text-xs font-semibold ${method.textColor} truncate`}>
                          {block.subject}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {block.startTime} - {block.endTime}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Leyenda de Métodos */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📖 Leyenda de Métodos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {methods.map((method) => (
              <div key={method.id} className="flex items-center gap-2">
                <div className={`${method.bgColor} ${method.borderColor} border-2 w-8 h-8 rounded-lg flex items-center justify-center`}>
                  {method.icon}
                </div>
                <span className="text-sm font-semibold text-gray-700">{method.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => navigate('/metodos-estudio')}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            ← Volver a Métodos
          </button>
          <button
            onClick={() => navigate('/seguimiento')}
            className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg"
          >
            Ver Progreso 📊
          </button>
          <button
            onClick={handleClearCalendar}
            disabled={blocks.length === 0}
            className="flex-1 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all duration-300 border-2 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ Limpiar Calendario
          </button>
        </div>

        {/* Modal Agregar/Editar Bloque */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-slide-up my-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingBlock ? 'Editar Bloque' : 'Agregar Bloque de Estudio'}
              </h2>
              
              <div className="space-y-4">
                {/* Día */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Día *</label>
                  <select
                    value={newBlock.day}
                    onChange={(e) => setNewBlock({...newBlock, day: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  >
                    <option value="">Selecciona un día</option>
                    {weekDays.map(day => (
                      <option key={day.id} value={day.id}>
                        {day.fullName} ({day.date}/{day.month})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hora Inicio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de inicio *</label>
                  <input
                    type="time"
                    value={newBlock.startTime}
                    onChange={(e) => setNewBlock({...newBlock, startTime: e.target.value})}
                    min="08:00"
                    max="22:00"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  />
                </div>

                {/* Hora Fin */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de fin *</label>
                  <input
                    type="time"
                    value={newBlock.endTime}
                    onChange={(e) => setNewBlock({...newBlock, endTime: e.target.value})}
                    min="08:00"
                    max="23:00"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  />
                </div>

                {/* Método */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Método *</label>
                  <select
                    value={newBlock.method}
                    onChange={(e) => setNewBlock({...newBlock, method: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  >
                    {methods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.icon} {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Materia/Tema */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Materia/Tema *</label>
                  <input
                    type="text"
                    value={newBlock.subject}
                    onChange={(e) => setNewBlock({...newBlock, subject: e.target.value})}
                    placeholder="Ej: Matemáticas, Historia, etc."
                    maxLength={100}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notas (opcional)</label>
                  <textarea
                    value={newBlock.notes}
                    onChange={(e) => setNewBlock({...newBlock, notes: e.target.value})}
                    placeholder="Capítulos a estudiar, objetivos, etc."
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                {editingBlock && (
                  <button
                    onClick={() => {
                      handleDeleteBlock(editingBlock.id);
                      setShowAddModal(false);
                      setEditingBlock(null);
                      setNewBlock({
                        day: '',
                        startTime: '',
                        endTime: '',
                        method: 'pomodoro',
                        subject: '',
                        notes: ''
                      });
                    }}
                    className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all duration-300 border-2 border-red-200"
                  >
                    🗑️
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBlock(null);
                    setNewBlock({
                      day: '',
                      startTime: '',
                      endTime: '',
                      method: 'pomodoro',
                      subject: '',
                      notes: ''
                    });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveBlock}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-lg disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : (editingBlock ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de Éxito */}
        {showSuccessMessage && (
          <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3 z-50">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">
              {editingBlock ? 'Bloque actualizado' : 'Bloque agregado correctamente'}
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Calendario;