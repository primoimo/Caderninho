import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Plus, Search, Clock, Users, BookOpen, ChevronDown, Target, Zap, LayoutList, Filter, Edit2, Check, X, Trash2 } from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore';

// --- Types ---
type Step = {
  id: string;
  title: string;
  details: string;
};

type MeetingData = {
  id: string;
  title: string;
  description: string;
  faithLevel: string;
  duration: string;
  theme: string;
  peopleCount: number;
  steps: Step[];
  createdAt?: string;
};

// --- Default Data ---
const defaultMeeting: MeetingData = {
  id: '1',
  title: 'A Tempestade Acalmada: Confiança no Caos',
  description: 'Uma reunião para debater a fé durante os momentos difíceis da vida dos jovens, mostrando que Jesus está no barco.',
  faithLevel: 'Iniciante',
  duration: "90",
  theme: 'Espiritualidade',
  peopleCount: 15,
  steps: [
    { id: '1', title: "1. Acolhida e Oração Inicial", details: "Receba os jovens com música animada. Faça uma oração pedindo a presença do Espírito Santo para acalmar os corações." },
    { id: '2', title: "2. Dinâmica: O Barco", details: "Divida os jovens em grupos. Cada grupo deve desenhar um barco em uma cartolina e escrever seus maiores medos nas ondas ao redor." },
    { id: '3', title: "3. Leitura da Palavra", details: "Leitura do Evangelho de Marcos 4, 35-41. Reflexão guiada sobre como Jesus acalma as tempestades das nossas vidas quando confiamos Nele." },
    { id: '4', title: "4. Oração Final e Envio", details: "Oração de compromisso. Cada jovem leva um barquinho de papel como lembrança de que não estão sozinhos nas tempestades." }
  ],
  createdAt: new Date().toISOString()
};

// --- Components ---

const getThemeColor = (theme: string) => {
  const colors = [
    'bg-[#FFD1DC]', // Pastel Pink
    'bg-[#FFDFBA]', // Pastel Orange
    'bg-[#FFFFBA]', // Pastel Yellow
    'bg-[#BAFFC9]', // Pastel Green
    'bg-[#BAE1FF]', // Pastel Blue
    'bg-[#E2CBF7]', // Pastel Purple
    'bg-[#F5E6CC]', // Pastel Peach
    'bg-[#D0F4DE]', // Pastel Mint
  ];
  let hash = 0;
  for (let i = 0; i < theme.length; i++) {
    hash = theme.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Home = ({ 
  onSelectMeeting, 
  onAddMeeting,
  onEditMeeting,
  meetings
}: { 
  onSelectMeeting: (m: MeetingData) => void, 
  onAddMeeting: () => void,
  onEditMeeting: (m: MeetingData) => void,
  meetings: MeetingData[],
  key?: string
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [tempTheme, setTempTheme] = useState('');
  const [tempFaith, setTempFaith] = useState('');
  const [activeTheme, setActiveTheme] = useState('');
  const [activeFaith, setActiveFaith] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const uniqueThemes = useMemo(() => {
    return Array.from(new Set(meetings.map(m => m.theme))).sort();
  }, [meetings]);

  const handleApplyFilters = () => {
    setActiveTheme(tempTheme);
    setActiveFaith(tempFaith);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setTempTheme('');
    setTempFaith('');
    setActiveTheme('');
    setActiveFaith('');
    setShowFilters(false);
  };

  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const matchSearch = searchQuery ? m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      const matchTheme = activeTheme ? m.theme === activeTheme : true;
      const matchFaith = activeFaith ? m.faithLevel === activeFaith : true;
      return matchSearch && matchTheme && matchFaith;
    });
  }, [meetings, searchQuery, activeTheme, activeFaith]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col min-h-screen bg-[var(--color-bg)]"
    >
      {/* Header Section */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-b-[60px] md:rounded-b-[80px] relative shrink-0 shadow-xl border-b-8 border-[var(--color-dark)] z-50"
      >
        <div className="max-w-6xl mx-auto p-6 md:p-12 pt-8 md:pt-12 relative z-20">
          <div className="flex justify-between items-center mb-8 md:mb-12 relative z-20">
            <motion.span 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="font-black text-xl md:text-2xl tracking-widest text-[var(--color-primary-text)] drop-shadow-md"
            >
              REUNIÕES
            </motion.span>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 md:pb-8">
            <div className="max-w-xl w-full">
              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight drop-shadow-md text-[var(--color-primary-text)] flex flex-wrap">
                {"olá animadores".split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.05, delay: index * 0.05 }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-base md:text-lg text-[var(--color-primary-text)]/90 mb-8 leading-relaxed font-bold"
              >
                sejam bem-vindos ao nosso caderninho compartilhado
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 relative"
              >
                <button 
                  onClick={onAddMeeting}
                  className="bg-[var(--color-bg)] text-[var(--color-dark)] font-black py-3.5 px-6 rounded-[20px] text-[16px] shadow-[4px_4px_0px_var(--color-dark)] hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--color-dark)] transition-all flex items-center justify-center gap-2 whitespace-nowrap border-2 border-[var(--color-dark)]"
                >
                  <Plus className="w-6 h-6" strokeWidth={3} /> Adicionar
                </button>
                
                <div className="relative flex-1 group flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-dark)]/50 group-focus-within:text-[var(--color-dark)] transition-colors" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquisar Reunião..." 
                      className="w-full bg-[var(--color-bg)] border-2 border-[var(--color-dark)] text-[var(--color-dark)] placeholder:text-[var(--color-dark)]/50 rounded-[20px] py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-[var(--color-dark)]/20 transition-all text-[16px] font-bold shadow-[4px_4px_0px_var(--color-dark)]"
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3.5 rounded-[20px] border-2 transition-all flex items-center justify-center shadow-[4px_4px_0px_var(--color-dark)] hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--color-dark)] ${
                      showFilters || activeTheme || activeFaith 
                        ? 'bg-[var(--color-dark)] text-[var(--color-primary-text)] border-[var(--color-dark)]' 
                        : 'bg-[var(--color-bg)] text-[var(--color-dark)] border-[var(--color-dark)]'
                    }`}
                  >
                    <Filter className="w-5 h-5" strokeWidth={3} />
                  </button>
                </div>

                {/* Filters Dropdown */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-4 bg-[var(--color-bg)] rounded-[24px] p-6 shadow-2xl z-50 text-[var(--color-dark)] border-4 border-[var(--color-dark)]"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-xl">Filtros</h3>
                        <button onClick={() => setShowFilters(false)} className="text-[var(--color-dark)]/60 hover:text-[var(--color-dark)]">
                          <X className="w-6 h-6" strokeWidth={3} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-black text-[var(--color-dark)] ml-1">Tema</label>
                          <div className="relative">
                            <select 
                              value={tempTheme}
                              onChange={(e) => setTempTheme(e.target.value)}
                              className="w-full bg-[var(--color-card)] border-2 border-[var(--color-dark)] rounded-[16px] p-3 text-[var(--color-dark)] font-bold focus:ring-4 focus:ring-[var(--color-dark)]/20 outline-none transition-all appearance-none shadow-[2px_2px_0px_var(--color-dark)]"
                            >
                              <option value="">Todos os Temas</option>
                              {uniqueThemes.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-dark)] pointer-events-none" strokeWidth={3} />
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-black text-[var(--color-dark)] ml-1">Nível na Fé</label>
                          <div className="relative">
                            <select 
                              value={tempFaith}
                              onChange={(e) => setTempFaith(e.target.value)}
                              className="w-full bg-[var(--color-card)] border-2 border-[var(--color-dark)] rounded-[16px] p-3 text-[var(--color-dark)] font-bold focus:ring-4 focus:ring-[var(--color-dark)]/20 outline-none transition-all appearance-none shadow-[2px_2px_0px_var(--color-dark)]"
                            >
                              <option value="">Todos os Níveis</option>
                              <option value="Iniciante">Iniciante</option>
                              <option value="Intermediário">Intermediário</option>
                              <option value="Profundo">Profundo</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-dark)] pointer-events-none" strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={handleClearFilters}
                          className="flex-1 py-3 rounded-[16px] font-black text-[var(--color-dark)] bg-[var(--color-card)] border-2 border-[var(--color-dark)] shadow-[2px_2px_0px_var(--color-dark)] hover:translate-y-1 hover:shadow-[0px_0px_0px_var(--color-dark)] transition-all"
                        >
                          Limpar
                        </button>
                        <button 
                          onClick={handleApplyFilters}
                          className="flex-1 py-3 rounded-[16px] font-black text-[var(--color-primary-text)] bg-[var(--color-primary)] border-2 border-[var(--color-dark)] shadow-[2px_2px_0px_var(--color-dark)] hover:translate-y-1 hover:shadow-[0px_0px_0px_var(--color-dark)] transition-all"
                        >
                          Aplicar Filtros
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative grow flex flex-col">
        {/* Animated Background Pattern for Main Content */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.08]"
          animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          style={{
            backgroundImage: 'radial-gradient(var(--color-dark) 2px, transparent 2px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="max-w-6xl mx-auto w-full p-6 md:p-12 pt-8 md:pt-12 grow flex flex-col gap-10 relative z-10">
        
        {/* Nossas Reuniões Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-[var(--color-dark)]">
              {activeTheme || activeFaith || searchQuery ? 'Resultados da Busca' : 'Nossas Reuniões'}
            </h2>
            {(activeTheme || activeFaith || searchQuery) && (
              <span className="text-sm md:text-base font-black text-[var(--color-primary-text)] bg-[var(--color-primary)] px-4 py-1.5 rounded-full border-2 border-[var(--color-dark)] shadow-[2px_2px_0px_var(--color-dark)]">
                {filteredMeetings.length} encontradas
              </span>
            )}
          </div>
          
          {filteredMeetings.length === 0 ? (
            <div className="bg-[var(--color-card)] rounded-[32px] p-10 text-center border-4 border-[var(--color-dark)] shadow-[8px_8px_0px_var(--color-dark)]">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-black text-[var(--color-dark)] mb-2">Nenhuma reunião encontrada</h3>
              <p className="text-[var(--color-dark)]/70 font-bold">Tente ajustar seus filtros ou termo de busca.</p>
              <button 
                onClick={handleClearFilters}
                className="mt-6 text-[var(--color-primary)] font-black hover:underline text-lg"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <AnimatePresence>
                {filteredMeetings.map((meeting, idx) => (
                  <motion.div 
                    key={meeting.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.05 * idx }}
                    onClick={() => onSelectMeeting(meeting)}
                    className="bg-[var(--color-card)] rounded-[32px] p-6 cursor-pointer border-4 border-[var(--color-dark)] shadow-[6px_6px_0px_var(--color-dark)] hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--color-dark)] transition-all flex flex-col h-full relative overflow-hidden group"
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className={`${getThemeColor(meeting.theme)} text-[#3A2317] border-2 border-[#3A2317] text-xs font-black px-3 py-1.5 rounded-full shadow-[2px_2px_0px_#3A2317]`}>{meeting.theme}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-dark)]/60 text-sm font-black">{meeting.duration}'</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEditMeeting(meeting); }}
                          className="p-1.5 text-[var(--color-dark)]/60 hover:text-[var(--color-dark)] hover:bg-[var(--color-bg)] rounded-full transition-colors"
                        >
                          <Edit2 className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-black text-xl text-[var(--color-dark)] mb-3 line-clamp-2 relative z-10">{meeting.title}</h3>
                    <p className="text-sm text-[var(--color-dark)]/70 font-bold line-clamp-2 mb-6 grow relative z-10">{meeting.description}</p>
                    <div className="flex items-center gap-4 text-xs font-black text-[var(--color-dark)]/60 mt-auto relative z-10">
                      <div className="flex items-center gap-1.5"><Target className="w-4 h-4" strokeWidth={3} /> {meeting.faithLevel}</div>
                      <div className="flex items-center gap-1.5"><Users className="w-4 h-4" strokeWidth={3} /> {meeting.peopleCount}</div>
                      {meeting.authorName && <div className="flex items-center gap-1.5 ml-auto"><Edit2 className="w-3 h-3" strokeWidth={3} /> {meeting.authorName}</div>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const AddMeeting = ({ 
  onBack, 
  onSave,
  initialData,
  onDelete
}: { 
  onBack: () => void, 
  onSave: (m: MeetingData) => void,
  initialData?: MeetingData | null,
  onDelete?: (id: string) => void,
  key?: string
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    faithLevel: initialData?.faithLevel || 'Iniciante',
    duration: initialData?.duration || '',
    theme: initialData?.theme || '',
    peopleCount: initialData?.peopleCount || 10
  });
  const [steps, setSteps] = useState<Step[]>(
    initialData?.steps?.length ? initialData.steps : [{ id: Date.now().toString(), title: '', details: '' }]
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddStep = () => {
    setSteps([...steps, { id: Date.now().toString(), title: '', details: '' }]);
  };

  const handleStepChange = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      setSteps(newSteps);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    const validSteps = steps.filter(s => s.title.trim() !== '' || s.details.trim() !== '');
    
    const newMeeting: MeetingData = {
      id: initialData ? initialData.id : Date.now().toString(),
      ...formData,
      peopleCount: Number(formData.peopleCount),
      theme: formData.theme || 'Geral',
      steps: validSteps.length > 0 ? validSteps : [
        { id: '1', title: "1. Acolhida", details: "Momento inicial de recepção." },
        { id: '2', title: "2. Desenvolvimento", details: "Conteúdo principal da reunião." },
        { id: '3', title: "3. Encerramento", details: "Oração e avisos finais." }
      ]
    };
    onSave(newMeeting);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col min-h-screen bg-[var(--color-bg)]"
    >
      <div className="bg-[var(--color-primary)] text-[var(--color-primary-text)] p-6 md:p-10 pb-20 md:pb-24 rounded-b-[60px] md:rounded-b-[80px] shrink-0 border-b-8 border-[var(--color-dark)]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button onClick={onBack} className="p-2 -ml-2 hover:bg-[var(--color-bg)]/20 rounded-full transition-colors">
                <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} />
              </button>
              <span className="font-black text-xl md:text-2xl ml-4">{initialData ? 'Editar Reunião' : 'Nova Reunião'}</span>
            </div>
            {initialData && (
              <button 
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-[var(--color-primary-text)] hover:bg-red-500 rounded-full transition-colors"
              >
                <Trash2 className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
              </button>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-md">{initialData ? 'Editar Detalhes' : 'Criar Reunião'}</h1>
          <p className="text-[var(--color-primary-text)]/90 font-bold text-lg">{initialData ? 'Atualize as informações do seu encontro.' : 'Preencha os detalhes para planejar seu próximo encontro.'}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-6 md:px-12 -mt-12 md:-mt-16 relative z-10 pb-12">
        <form onSubmit={handleSubmit} className="bg-[var(--color-card)] rounded-[32px] p-6 md:p-10 border-4 border-[var(--color-dark)] shadow-[8px_8px_0px_var(--color-dark)] flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-[var(--color-dark)] ml-2">Título da Reunião</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: O Amor de Deus" 
              className="bg-[var(--color-bg)] border-2 border-[var(--color-dark)] rounded-[20px] p-4 text-[var(--color-dark)] font-bold focus:ring-4 focus:ring-[var(--color-dark)]/20 outline-none transition-all shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)] hover:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-[var(--color-dark)] ml-2">Descrição</label>
            <textarea 
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Sobre o que será esta reunião?" 
              className="bg-[var(--color-bg)] border-2 border-[var(--color-dark)] rounded-[20px] p-4 text-[var(--color-dark)] font-bold focus:ring-4 focus:ring-[var(--color-dark)]/20 outline-none transition-all min-h-[120px] resize-none shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)] hover:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-[var(--color-dark)] ml-2">Nível na Fé</label>
              <div className="relative">
                <select 
                  value={formData.faithLevel}
                  onChange={e => setFormData({...formData, faithLevel: e.target.value})}
                  className="w-full bg-[var(--color-bg)] border-2 border-[var(--color-dark)] rounded-[20px] p-4 text-[var(--color-dark)] font-bold focus:ring-4 focus:ring-[var(--color-dark)]/20 outline-none transition-all appearance-none shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)] hover:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
                >
                  <option>Iniciante</option>
                  <option>Intermediário</option>
                  <option>Profundo</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--color-dark)] pointer-events-none" strokeWidth={3} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-[var(--color-dark)] ml-2">Tema (Livre)</label>
              <input 
                required
                type="text" 
                value={formData.theme}
                onChange={e => setFormData({...formData, theme: e.target.value})}
                placeholder="Ex: Namoro, Vocação, etc." 
                className="w-full bg-[var(--color-bg)] border-2 border-[var(--color-dark)] rounded-[20px] p-4 text-[var(--color-dark)] font-bold focus:ring-4 focus:ring-[var(--color-dark)]/20 outline-none transition-all shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)] hover:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-[var(--color-dark)] ml-2">Duração (minutos)</label>
              <input 
                required
                type="number" 
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
                placeholder="Ex: 90" 
                className="bg-[var(--color-bg)] border-2 border-[var(--color-dark)] rounded-[20px] p-4 text-[var(--color-dark)] font-bold focus:ring-4 focus:ring-[var(--color-dark)]/20 outline-none transition-all shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)] hover:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-[var(--color-dark)] ml-2">Número de Pessoas</label>
              <input 
                required
                type="number" 
                value={formData.peopleCount}
                onChange={e => setFormData({...formData, peopleCount: e.target.value})}
                placeholder="Ex: 15" 
                className="bg-[var(--color-bg)] border-2 border-[var(--color-dark)] rounded-[20px] p-4 text-[var(--color-dark)] font-bold focus:ring-4 focus:ring-[var(--color-dark)]/20 outline-none transition-all shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)] hover:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
              />
            </div>
          </div>

          {/* Roadmap Steps */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-6">
              <label className="text-lg font-black text-[var(--color-dark)] ml-2">Roteiro da Reunião</label>
              <button 
                type="button"
                onClick={handleAddStep}
                className="text-sm font-black text-[var(--color-dark)] bg-[var(--color-bg)] border-2 border-[var(--color-dark)] hover:translate-y-1 shadow-[2px_2px_0px_var(--color-dark)] hover:shadow-[0px_0px_0px_var(--color-dark)] px-4 py-2 rounded-[16px] transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" strokeWidth={3} /> Adicionar Passo
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              <AnimatePresence>
                {steps.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[var(--color-bg)] rounded-[24px] p-5 relative group border-2 border-[var(--color-dark)] shadow-[4px_4px_0px_var(--color-dark)]"
                  >
                    <div className="flex flex-col gap-4">
                      <input 
                        required
                        type="text" 
                        value={step.title}
                        onChange={e => handleStepChange(idx, 'title', e.target.value)}
                        placeholder={`Ex: ${idx + 1}. Dinâmica do Barco`} 
                        className="bg-[var(--color-card)] border-2 border-[var(--color-dark)] rounded-[16px] p-4 text-[var(--color-dark)] font-black focus:ring-4 focus:ring-[var(--color-dark)]/20 outline-none transition-all w-full"
                      />
                      <textarea 
                        required
                        value={step.details}
                        onChange={e => handleStepChange(idx, 'details', e.target.value)}
                        placeholder="Descreva o que vai acontecer neste momento..." 
                        className="bg-[var(--color-card)] border-2 border-[var(--color-dark)] rounded-[16px] p-4 text-[var(--color-dark)] font-bold focus:ring-4 focus:ring-[var(--color-dark)]/20 outline-none transition-all min-h-[100px] resize-none w-full"
                      />
                    </div>
                    {steps.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="absolute -top-3 -right-3 bg-[var(--color-card)] text-red-500 border-2 border-[var(--color-dark)] p-2 rounded-full shadow-[2px_2px_0px_var(--color-dark)] hover:translate-y-1 hover:shadow-[0px_0px_0px_var(--color-dark)] transition-all"
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] font-black text-[18px] md:text-[20px] py-5 rounded-[24px] border-4 border-[var(--color-dark)] shadow-[6px_6px_0px_var(--color-dark)] hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--color-dark)] transition-all mt-6 flex justify-center items-center gap-3"
          >
            {initialData ? <Check className="w-6 h-6" strokeWidth={3} /> : <Plus className="w-6 h-6" strokeWidth={3} />} 
            {initialData ? 'Salvar Alterações' : 'Salvar Nova Reunião'}
          </button>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[var(--color-dark)]/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-[32px] p-8 max-w-sm w-full border-4 border-[var(--color-dark)] shadow-[12px_12px_0px_var(--color-dark)]"
            >
              <h3 className="text-2xl font-black text-[var(--color-dark)] mb-3">Excluir Reunião?</h3>
              <p className="text-[var(--color-dark)]/80 font-bold mb-8">Tem certeza que deseja excluir esta reunião? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-4 rounded-[20px] font-black text-[var(--color-dark)] bg-[var(--color-card)] border-2 border-[var(--color-dark)] shadow-[4px_4px_0px_var(--color-dark)] hover:translate-y-1 hover:shadow-[0px_0px_0px_var(--color-dark)] transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (initialData && onDelete) {
                      onDelete(initialData.id);
                    }
                  }}
                  className="flex-1 py-4 rounded-[20px] font-black text-white bg-red-500 border-2 border-[var(--color-dark)] shadow-[4px_4px_0px_var(--color-dark)] hover:translate-y-1 hover:shadow-[0px_0px_0px_var(--color-dark)] transition-all"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MeetingDetails = ({ meeting, onBack, onEdit }: { meeting: MeetingData, onBack: () => void, onEdit: (m: MeetingData) => void, key?: string }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = (idx: number) => {
    setExpandedStep(expandedStep === idx ? null : idx);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col min-h-screen bg-[var(--color-bg)]"
    >
      <div className="max-w-3xl mx-auto w-full p-6 md:p-12 pt-8 flex flex-col grow">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8 md:mb-12">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-[var(--color-dark)]/10 rounded-full transition-colors">
            <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 text-[var(--color-dark)]" strokeWidth={3} />
          </button>
          <span className="font-black text-xl md:text-2xl text-[var(--color-dark)]">Detalhes da Reunião</span>
          <button 
            onClick={() => onEdit(meeting)}
            className="p-2 hover:bg-[var(--color-dark)]/10 rounded-full transition-colors"
          >
            <Edit2 className="w-6 h-6 md:w-7 md:h-7 text-[var(--color-dark)]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-3 mb-8">
          <span className="bg-[var(--color-card)] px-5 py-2.5 rounded-full text-sm font-black text-[var(--color-dark)] border-2 border-[var(--color-dark)] shadow-[2px_2px_0px_var(--color-dark)] flex items-center gap-2">
            <Clock className="w-5 h-5" strokeWidth={2.5} /> {meeting.duration}'
          </span>
          <span className="bg-[var(--color-card)] px-5 py-2.5 rounded-full text-sm font-black text-[var(--color-dark)] border-2 border-[var(--color-dark)] shadow-[2px_2px_0px_var(--color-dark)] flex items-center gap-2">
            <Target className="w-5 h-5" strokeWidth={2.5} /> {meeting.faithLevel}
          </span>
          <span className="bg-[var(--color-card)] px-5 py-2.5 rounded-full text-sm font-black text-[var(--color-dark)] border-2 border-[var(--color-dark)] shadow-[2px_2px_0px_var(--color-dark)] flex items-center gap-2">
            <Users className="w-5 h-5" strokeWidth={2.5} /> {meeting.peopleCount}
          </span>
        </div>

        <motion.h2 layoutId={`title-${meeting.id}`} className="text-[32px] md:text-[42px] font-black text-[var(--color-dark)] mb-6 leading-[1.1]">
          {meeting.title}
        </motion.h2>
        
        <p className="text-[var(--color-dark)]/80 text-lg md:text-xl font-bold mb-12 leading-relaxed">
          {meeting.description}
        </p>

        <div className="flex items-center gap-3 mb-8">
          <LayoutList className="w-7 h-7 text-[var(--color-primary)]" strokeWidth={3} />
          <h3 className="text-2xl font-black text-[var(--color-dark)]">Roteiro</h3>
        </div>

        <div className="flex flex-col gap-5 mb-16">
          <AnimatePresence>
            {meeting.steps.map((step, idx) => {
              const isExpanded = expandedStep === idx;
              return (
                <motion.div 
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                  onClick={() => toggleStep(idx)}
                  className={`rounded-[24px] cursor-pointer transition-all overflow-hidden border-4 border-[var(--color-dark)] ${
                    isExpanded 
                      ? 'bg-[var(--color-card)] shadow-[6px_6px_0px_var(--color-dark)]' 
                      : 'bg-[var(--color-bg)] shadow-[4px_4px_0px_var(--color-dark)] hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--color-dark)]'
                  }`}
                >
                  <motion.div layout className="p-6 md:p-8 flex justify-between items-center">
                    <span className="font-black text-[18px] md:text-[20px] text-[var(--color-dark)]">{step.title}</span>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                      <ChevronDown className="w-6 h-6 text-[var(--color-dark)]" strokeWidth={3} />
                    </motion.div>
                  </motion.div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="px-6 md:px-8 pb-6 md:pb-8"
                      >
                        <div className="pt-6 border-t-2 border-[var(--color-dark)]/10">
                          <p className="text-[var(--color-dark)]/80 font-bold leading-relaxed text-[16px] md:text-[18px]">
                            {step.details}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

type ViewState = 'home' | 'add-meeting' | 'meeting';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingData | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<MeetingData | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meetingsData: MeetingData[] = [];
      snapshot.forEach((doc) => {
        meetingsData.push({ id: doc.id, ...doc.data() } as MeetingData);
      });
      setMeetings(meetingsData);
    }, (error) => {
      console.error('Firestore Error: ', error);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveMeeting = async (meetingData: MeetingData) => {
    try {
      if (editingMeeting) {
        const meetingRef = doc(db, 'meetings', meetingData.id);
        const { id, ...dataToUpdate } = meetingData;
        await updateDoc(meetingRef, dataToUpdate);
      } else {
        const { id, ...dataToSave } = meetingData;
        await addDoc(collection(db, 'meetings'), {
          ...dataToSave,
          createdAt: new Date().toISOString()
        });
      }
      setSelectedMeeting(meetingData);
      setEditingMeeting(null);
      setView('home');
    } catch (error) {
      console.error("Error saving meeting: ", error);
      alert("Erro ao salvar a reunião.");
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'meetings', id));
      setEditingMeeting(null);
      setView('home');
    } catch (error) {
      console.error("Error deleting meeting: ", error);
      alert("Erro ao excluir a reunião.");
    }
  };

  const handleSelectMeeting = (meeting: MeetingData) => {
    setSelectedMeeting(meeting);
    setView('meeting');
  };

  const handleEditMeeting = (meeting: MeetingData) => {
    setEditingMeeting(meeting);
    setView('add-meeting');
  };

  const handleAddMeetingClick = () => {
    setEditingMeeting(null);
    setView('add-meeting');
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-bg)] text-[var(--color-dark)] font-sans overflow-x-hidden pb-16 md:pb-24 selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-text)]">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <Home 
            key="home" 
            meetings={meetings}
            onSelectMeeting={handleSelectMeeting} 
            onAddMeeting={handleAddMeetingClick} 
            onEditMeeting={handleEditMeeting}
          />
        )}
        {view === 'add-meeting' && (
          <AddMeeting 
            key="add-meeting" 
            initialData={editingMeeting}
            onBack={() => setView('home')} 
            onSave={handleSaveMeeting} 
            onDelete={handleDeleteMeeting}
          />
        )}
        {view === 'meeting' && selectedMeeting && (
          <MeetingDetails 
            key="meeting" 
            meeting={selectedMeeting}
            onBack={() => setView('home')} 
            onEdit={handleEditMeeting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
