import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Camera, 
  ChevronRight, 
  Heart, 
  History, 
  Home, 
  PieChart, 
  Plus, 
  Settings, 
  Trophy, 
  User as UserIcon,
  Zap,
  Flame,
  Target,
  Scale,
  Send,
  Sparkles,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { UserProfile, Meal, WeeklyInsight, Achievement } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const GlassCard = ({ children, className, hover = true, ...props }: { children: React.ReactNode; className?: string; hover?: boolean; [key: string]: any }) => (
  <div {...props} className={cn(
    "glass-card p-6 transition-all duration-300",
    hover && "hover:border-primary-neon/40 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)]",
    className
  )}>
    {children}
  </div>
);

const NeonButton = ({ children, onClick, variant = 'primary', className, disabled }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger'; className?: string; disabled?: boolean }) => {
  const variants = {
    primary: "bg-primary-neon text-black orbitron border-primary-neon hover:bg-primary-neon/80 shadow-[0_0_20px_rgba(0,255,136,0.2)]",
    secondary: "border-secondary-neon text-secondary-neon hover:bg-secondary-neon hover:text-black shadow-[0_0_15px_rgba(0,191,255,0.1)]",
    danger: "border-danger-neon text-danger-neon hover:bg-danger-neon hover:text-black shadow-[0_0_15px_rgba(255,71,87,0.1)]"
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-6 py-3 rounded-xl border font-display font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Toast = ({ message, visible }: { message: string, visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        initial={{ opacity: 0, y: 50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 50, x: '-50%' }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-primary-neon text-black px-6 py-3 rounded-full font-display font-bold shadow-[0_0_30px_rgba(0,255,136,0.5)] flex items-center gap-2"
      >
        <Zap size={18} fill="currentColor" />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

const MealDetailModal = ({ meal, onClose }: { meal: Meal, onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-bg-dark border border-white/10 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-display text-3xl font-black italic">{meal.name}</h2>
              <p className="text-white/40">{new Date(meal.timestamp).toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <Plus className="rotate-45" size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <p className="text-[10px] uppercase text-white/40 mb-1">Calories</p>
              <p className="font-display text-2xl">{meal.calories}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-[10px] uppercase text-white/40 mb-1">Health Score</p>
              <p className={cn(
                "font-display text-2xl",
                meal.score > 80 ? "text-primary-neon" : meal.score > 50 ? "text-warning-neon" : "text-danger-neon"
              )}>{meal.score}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-[10px] uppercase text-white/40 mb-1">Protein</p>
              <p className="font-display text-2xl text-secondary-neon">{meal.macros.protein}g</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-[10px] uppercase text-white/40 mb-1">Impact</p>
              <p className="font-display text-xl">{meal.verdict}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-lg tracking-tight flex items-center gap-2">
              <Zap className="text-primary-neon" size={18} /> Smart Swaps
            </h3>
            {meal.swaps.length > 0 ? (
              <div className="space-y-3">
                {meal.swaps.map((swap, i) => (
                  <div key={i} className="p-4 rounded-xl bg-primary-neon/5 border border-primary-neon/10 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold"><span className="text-white/40 line-through mr-2">{swap.original}</span> {swap.replacement}</p>
                      <p className="text-xs text-white/60">{swap.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-neon font-display text-sm">-{swap.caloriesSaved} kcal</p>
                      <p className="text-[10px] uppercase text-white/40">Efficiency Gain</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm">No alternative optimization required for this selection.</p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-sm uppercase tracking-widest text-white/40">AI Deep-Dive Insights</h3>
            <ul className="space-y-2">
              {meal.insights.map((insight, i) => (
                <li key={i} className="text-sm flex gap-3 text-white/80">
                  <span className="text-primary-neon font-black">•</span> {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AIAssistant = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'NutriMind Core is online. How can I optimize your nutritional trajectory today?' }
  ]);
  const [input, setInput] = useState('');

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Processing neural patterns... based on your goal, I recommend staying on course with high-density proteins. Your performance metrics are within normal range.' }]);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          className="fixed bottom-0 right-0 left-0 sm:right-6 sm:left-auto sm:bottom-6 w-full sm:w-96 z-[100] glass-card border-primary-neon/30 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-primary-neon/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-neon flex items-center justify-center text-black">
                <Zap size={16} fill="currentColor" />
              </div>
              <span className="font-display font-black italic">NUTRIBOT <span className="text-primary-neon">AI</span></span>
            </div>
            <button onClick={onClose} className="p-1 hover:text-primary-neon transition-colors"><Plus className="rotate-45" /></button>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 space-y-4 font-sans text-sm">
            {messages.map((m, i) => (
              <div key={i} className={cn(
                "max-w-[80%] p-3 rounded-2xl",
                m.role === 'user' ? "ml-auto bg-primary-neon text-black rounded-tr-none" : "mr-auto bg-white/5 border border-white/10 rounded-tl-none"
              )}>
                {m.content}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask Core..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 focus:border-primary-neon outline-none"
              />
              <button onClick={send} className="w-10 h-10 rounded-full bg-primary-neon text-black flex items-center justify-center"><ChevronRight size={18} /></button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- App Entry Point ---

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'scan' | 'insights' | 'journey' | 'wheel' | 'tips'>('home');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showAssistant, setShowAssistant] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };
  
  // Onboarding Form State
  const [form, setForm] = useState({
    name: '',
    goal: 'Weight Loss' as UserProfile['goal'],
    age: 25,
    weight: 70,
    height: 175,
    activityLevel: 'Moderately Active' as UserProfile['activityLevel']
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('nutrimind_user');
    const savedMeals = localStorage.getItem('nutrimind_meals');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setIsOnboarding(true);
    }
    
    if (savedMeals) {
      setMeals(JSON.parse(savedMeals));
    }
  }, []);

  const calculateTDEE = (weight: number, height: number, age: number, activity: UserProfile['activityLevel']) => {
    // Mifflin-St Jeor Equation
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5; // Assuming male for simplicity, can expand later
    const multipliers = {
      'Sedentary': 1.2,
      'Lightly Active': 1.375,
      'Moderately Active': 1.55,
      'Very Active': 1.725,
      'Extra Active': 1.9
    };
    return { bmr, tdee: Math.round(bmr * multipliers[activity]) };
  };

  const completeOnboarding = () => {
    const { bmr, tdee } = calculateTDEE(form.weight, form.height, form.age, form.activityLevel);
    const newUser: UserProfile = {
      ...form,
      bmr,
      tdee,
      xp: 0,
      level: 1,
      streak: 1,
      lastLoginDate: new Date().toISOString().split('T')[0]
    };
    
    localStorage.setItem('nutrimind_user', JSON.stringify(newUser));
    setUser(newUser);
    setIsOnboarding(false);
    showToast("Neural Profile Sync Complete");
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00ff88', '#00bfff'] });
  };

  const addXP = useCallback((amount: number) => {
    if (!user) return;
    const nextLevelXP = user.level * 100 * (user.level * 0.5 + 1);
    let newXP = user.xp + amount;
    let newLevel = user.level;
    
    if (newXP >= nextLevelXP) {
      newLevel += 1;
      newXP = newXP - nextLevelXP;
      showToast(`Level Up: reaching state ${newLevel}`);
      confetti({ particleCount: 100, spread: 50, origin: { y: 0.8 }, colors: ['#00ff88'] });
    }
    
    const updatedUser = { ...user, xp: newXP, level: newLevel };
    setUser(updatedUser);
    localStorage.setItem('nutrimind_user', JSON.stringify(updatedUser));
  }, [user]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("NUTRIMIND DAILY REPORT", 20, 20);
    doc.setFontSize(14);
    doc.text(`User: ${user?.name}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text(`Target: ${user?.tdee} kcal`, 20, 50);
    
    const todayMeals = meals.filter(m => m.timestamp.startsWith(new Date().toISOString().split('T')[0]));
    todayMeals.forEach((m, i) => {
      doc.text(`${i+1}. ${m.name} - ${m.calories}kcal [Score: ${m.score}]`, 20, 70 + (i * 10));
    });
    
    doc.save("nutrimind_report.pdf");
    showToast("Report Exported to PDF");
  };

  if (isOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-bg-dark relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-neon/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-neon/10 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg relative z-10"
        >
          <GlassCard className="border-primary-neon/20 p-8">
            <div className="mb-8 text-center">
              <h1 className="font-display text-4xl font-black mb-2 tracking-tighter italic">
                NUTRI<span className="text-primary-neon">MIND</span>
              </h1>
              <p className="text-white/60 text-sm">The 2035 Smart Nutrition Interface</p>
            </div>

            <AnimatePresence mode="wait">
              {onboardingStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-xl mb-4">Select Your Primary Directive</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {['Weight Loss', 'Muscle Gain', 'Heart Health', 'Diabetes Control'].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setForm(f => ({ ...f, goal: goal as UserProfile['goal'] }))}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all duration-300",
                          form.goal === goal 
                            ? "border-primary-neon bg-primary-neon/10 text-primary-neon" 
                            : "border-white/10 hover:border-white/30"
                        )}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                  <NeonButton onClick={() => setOnboardingStep(2)} className="w-full mt-4">
                    Next Sync Point <ChevronRight className="inline ml-2" size={18} />
                  </NeonButton>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-xl mb-4">Biometric Calibration</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-white/40 mb-1 block">Full Name</label>
                      <input 
                        type="text" 
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Commander Shepherd"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary-neon outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-widest text-white/40 mb-1 block text-center">Age</label>
                        <input 
                          type="number" 
                          value={form.age}
                          onChange={e => setForm(f => ({ ...f, age: parseInt(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center focus:border-primary-neon outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-widest text-white/40 mb-1 block text-center">Weight (kg)</label>
                        <input 
                          type="number" 
                          value={form.weight}
                          onChange={e => setForm(f => ({ ...f, weight: parseInt(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center focus:border-primary-neon outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-widest text-white/40 mb-1 block text-center">Height (cm)</label>
                        <input 
                          type="number" 
                          value={form.height}
                          onChange={e => setForm(f => ({ ...f, height: parseInt(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center focus:border-primary-neon outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-white/40 mb-1 block">Activity Protocol</label>
                      <select 
                        value={form.activityLevel}
                        onChange={e => setForm(f => ({ ...f, activityLevel: e.target.value as UserProfile['activityLevel'] }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary-neon outline-none"
                      >
                        {['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extra Active'].map(level => (
                          <option key={level} value={level} className="bg-bg-dark">{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setOnboardingStep(1)} className="text-white/40 hover:text-white transition-colors">Back</button>
                    <NeonButton onClick={completeOnboarding} className="flex-1">
                      Launch Nutrimind <Zap className="inline ml-2" size={18} />
                    </NeonButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-dark text-white pb-24">
      {/* Dynamic Header */}
      <header className="p-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-40 bg-bg-dark/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-display text-xl font-black italic tracking-tighter cursor-pointer" onClick={() => setActiveTab('home')}>
              NUTRI<span className="text-primary-neon">MIND</span>
            </h1>
            <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-medium">
              Good Morning, <span className="text-primary-neon">{user.name}</span> · {user.goal}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase text-white/40 tracking-widest">Level {user.level}</p>
              <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(user.xp / (user.level * 150)) * 100}%` }}
                  className="h-full bg-primary-neon shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                />
              </div>
            </div>
            <div 
              className="w-10 h-10 rounded-full border border-primary-neon/30 bg-primary-neon/10 flex items-center justify-center font-display text-primary-neon cursor-pointer hover:bg-primary-neon/20 transition-all"
              onClick={() => setActiveTab('journey')}
            >
              {user.name[0]}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeView 
              user={user} 
              meals={meals} 
              onMealClick={setSelectedMeal} 
              onExport={exportPDF} 
            />
          )}
          {activeTab === 'scan' && (
            <MealAnalysisView user={user} onMealLog={(meal) => {
              const updatedMeals = [meal, ...meals];
              setMeals(updatedMeals);
              localStorage.setItem('nutrimind_meals', JSON.stringify(updatedMeals));
              addXP(50);
              showToast("Bio-Fuel Intake Logged");
              setActiveTab('home');
            }} />
          )}
          {activeTab === 'insights' && <InsightsView meals={meals} user={user} />}
          {activeTab === 'journey' && <JourneyView user={user} meals={meals} />}
          {activeTab === 'wheel' && <WheelView />}
          {activeTab === 'tips' && <TipsView />}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card p-3 px-8 rounded-2xl flex gap-10 shadow-2xl items-center">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20} />} label="Daily" />
        <NavButton active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} icon={<Camera size={20} />} label="Scan" />
        <NavButton active={activeTab === 'wheel'} onClick={() => setActiveTab('wheel')} icon={<Activity size={20} />} label="Wheel" />
        <NavButton active={activeTab === 'tips'} onClick={() => setActiveTab('tips')} icon={<Lightbulb size={20} />} label="Tips" />
        <NavButton active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} icon={<PieChart size={20} />} label="Stats" />
        <NavButton active={activeTab === 'journey'} onClick={() => setActiveTab('journey')} icon={<Trophy size={20} />} label="Quest" />
      </nav>
      
      {/* Floating AI Assistant Trigger */}
      <button 
        onClick={() => setShowAssistant(!showAssistant)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary-neon text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:scale-110 active:scale-95 transition-all z-[60]"
      >
        <Zap size={24} fill="currentColor" />
      </button>

      <AIAssistant visible={showAssistant} onClose={() => setShowAssistant(false)} />
      <Toast visible={toast.visible} message={toast.message} />
      <AnimatePresence>
        {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
      </AnimatePresence>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center px-6 py-2 transition-all duration-300 relative group",
      active ? "text-primary-neon" : "text-white/40 hover:text-white"
    )}
  >
    <div className={cn(
      "mb-1 transition-transform group-hover:scale-110",
      active && "drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]"
    )}>
      {icon}
    </div>
    <span className="text-[10px] font-display font-bold uppercase tracking-widest">{label}</span>
    {active && (
      <motion.div 
        layoutId="nav-glow"
        className="absolute -bottom-1 w-1 h-1 bg-primary-neon rounded-full shadow-[0_0_8px_#00ff88]"
      />
    )}
  </button>
);

const HomeView = ({ user, meals, onMealClick, onExport }: { user: UserProfile; meals: Meal[]; onMealClick: (m: Meal) => void; onExport: () => void }) => {
  const todayMeals = meals.filter(m => m.timestamp.startsWith(new Date().toISOString().split('T')[0]));
  const caloriesConsumed = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const progress = Math.min((caloriesConsumed / user.tdee) * 100, 100);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="md:col-span-2 flex flex-col justify-center items-center py-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-neon/5 opacity-50" />
          <div className="relative z-10 text-center">
            <h3 className="font-display text-white/40 text-[10px] tracking-widest uppercase mb-4">Energy Intake Status</h3>
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" 
                  strokeDasharray="282.7"
                  initial={{ strokeDashoffset: 282.7 }}
                  animate={{ strokeDashoffset: 282.7 - (282.7 * progress) / 100 }}
                  className="text-primary-neon drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-black neon-glow-green">{caloriesConsumed}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest">/ {user.tdee} kcal</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-neon/10 flex items-center justify-center text-secondary-neon">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Active Burn</p>
              <p className="font-display text-xl">{user.tdee - user.bmr} <span className="text-xs opacity-50">kcal</span></p>
            </div>
          </GlassCard>
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning-neon/10 flex items-center justify-center text-warning-neon">
              <Target size={24} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Daily Goal</p>
              <p className="font-display text-xl leading-tight">{user.goal}</p>
            </div>
          </GlassCard>
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-danger-neon/10 flex items-center justify-center text-danger-neon">
              <History size={24} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Streak</p>
              <p className="font-display text-xl">{user.streak} <span className="text-xs opacity-50">Days</span></p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Timeline Section Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-display text-lg tracking-tight">System Logs – Today</h3>
        <button 
          onClick={onExport}
          className="text-[10px] font-display font-bold uppercase tracking-widest text-white/40 hover:text-primary-neon flex items-center gap-2 transition-colors"
        >
          <PieChart size={14} /> Export to PDF
        </button>
      </div>

      {todayMeals.length === 0 ? (
        <GlassCard className="py-12 text-center text-white/40 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <Activity className="opacity-20" size={32} />
          </div>
          <p>No meal data packets detected in local vicinity.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {todayMeals.map((meal) => (
            <GlassCard 
              key={meal.id} 
              onClick={() => onMealClick(meal)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-display text-lg shadow-[0_0_10px_rgba(255,255,255,0.05)]",
                  meal.score > 80 ? "bg-primary-neon/10 text-primary-neon shadow-primary-neon/10" : 
                  meal.score > 50 ? "bg-warning-neon/10 text-warning-neon shadow-warning-neon/10" : 
                  "bg-danger-neon/10 text-danger-neon shadow-danger-neon/10"
                )}>
                  {meal.score}
                </div>
                <div>
                  <h4 className="font-display text-lg leading-tight group-hover:text-primary-neon transition-colors">{meal.name}</h4>
                  <p className="text-xs text-white/40">{new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-display text-xl">{meal.calories} <span className="text-[10px] text-white/40 font-sans font-normal uppercase tracking-widest">kcal</span></p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">{meal.verdict} Choice</p>
                </div>
                <div className="p-2 rounded-lg group-hover:bg-primary-neon/10 transition-colors">
                  <ChevronRight size={20} className="text-white/20 group-hover:text-primary-neon" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// --- Mocking other views for now ---

const MealAnalysisView = ({ onMealLog, user }: { onMealLog: (meal: Meal) => void, user: UserProfile }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Partial<Meal> | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ name: string, description: string, kcal: number }> | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [recipe, setRecipe] = useState<{ ingredients: string[], steps: string[] } | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  
  const [recipeQuery, setRecipeQuery] = useState('');
  const [searchRecipeResult, setSearchRecipeResult] = useState<{ ingredients: string[], steps: string[] } | null>(null);
  const [loadingSearchRecipe, setLoadingSearchRecipe] = useState(false);
  
  const [showMicros, setShowMicros] = useState(false);

  const quickChips = ['Masala Dosa', 'Oats Bowl', 'Grilled Salmon', 'Greek Salad', 'Quinoa Stir-fry'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (customInput?: string) => {
    const finalInput = customInput || input;
    if (!finalInput && !image) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    setRecipe(null);
    
    try {
      const { analyzeMeal } = await import('./services/geminiService');
      let aiInput: string | { data: string, mimeType: string } = finalInput;
      
      if (image && !customInput) {
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];
        aiInput = { data: base64Data, mimeType };
      }

      const res = await analyzeMeal(aiInput);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError('Neural calibration failed. System reboot suggested.');
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const { getSuggestions } = await import('./services/geminiService');
      const res = await getSuggestions(user);
      setSuggestions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const fetchRecipe = async (mealName?: string, isSearch = false) => {
    const target = mealName || result?.name;
    if (!target) return;
    
    if (isSearch) setLoadingSearchRecipe(true);
    else setLoadingRecipe(true);
    
    try {
      const { getRecipe } = await import('./services/geminiService');
      const res = await getRecipe(target);
      if (isSearch) setSearchRecipeResult(res);
      else setRecipe(res);
    } catch (err) {
      console.error(err);
    } finally {
      if (isSearch) setLoadingSearchRecipe(false);
      else setLoadingRecipe(false);
    }
  };

  const handleLog = () => {
    if (!result) return;
    const newMeal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      name: result.name || 'Analyzed Meal',
      timestamp: new Date().toISOString(),
      calories: result.calories || 0,
      macros: result.macros || { protein: 0, carbs: 0, fat: 0 },
      score: result.score || 50,
      verdict: result.verdict as any || 'Moderate',
      insights: result.insights || [],
      swaps: result.swaps || [],
      micronutrients: result.micronutrients || []
    };
    onMealLog(newMeal);
    setResult(null);
    setInput('');
    setImage(null);
  };

  if (analyzing) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 space-y-8"
      >
        <div className="relative w-40 h-40">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-primary-neon/10 border-t-primary-neon rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <Zap className="text-primary-neon" size={48} />
            </motion.div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-full h-1 bg-primary-neon/30 absolute animate-scan-line"></div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl tracking-widest uppercase">Analyzing Molecular Signal...</h2>
          <p className="text-white/40 text-sm italic">Deconstructing organic matter into metabolic data points</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-32"
    >
      {/* Smart Input Area */}
      <section className="space-y-4">
        <GlassCard className="p-1 group relative">
          <div className="absolute inset-0 bg-primary-neon/5 opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
          <div className="flex flex-col">
            <div className="flex items-start p-4 gap-4">
              <textarea 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Describe your meal or paste nutritional data..."
                className="flex-1 bg-transparent border-none outline-none resize-none font-sans text-lg min-h-[120px] placeholder:text-white/20"
              />
              <div className="flex flex-col gap-2">
                <label className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-primary-neon cursor-pointer transition-all">
                  <Camera size={20} className="text-primary-neon" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <button 
                  onClick={() => startAnalysis()}
                  disabled={!input && !image}
                  className="p-3 bg-primary-neon text-black rounded-xl hover:bg-white transition-all disabled:opacity-30"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
            
            {image && (
              <div className="px-4 pb-4 relative">
                <img src={image} className="w-24 h-24 object-cover rounded-lg border border-white/20" referrerPolicy="no-referrer" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute -top-1 -left-1 bg-danger-neon p-1 rounded-full text-white"
                >
                  <Plus className="rotate-45" size={12} />
                </button>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Quick Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
          {quickChips.map(chip => (
            <button
              key={chip}
              onClick={() => { setInput(chip); startAnalysis(chip); }}
              className="whitespace-nowrap px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 hover:border-primary-neon hover:text-primary-neon transition-all"
            >
              + {chip}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="p-4 border border-danger-neon/30 bg-danger-neon/5 rounded-xl text-danger-neon text-center text-sm orbitron">
          {error}
        </div>
      )}

      <div className="h-px bg-white/10 w-full" />

      {/* Separate Recipe Hub */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="text-secondary-neon" size={24} />
          <h2 className="orbitron text-lg font-bold tracking-widest uppercase">Protocol Database</h2>
        </div>
        
        <GlassCard className="p-4">
          <div className="flex gap-3">
            <input 
              type="text"
              value={recipeQuery}
              onChange={e => setRecipeQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchRecipe(recipeQuery, true)}
              placeholder="Search dishes for molecular recipe access..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-secondary-neon transition-all"
            />
            <button 
              onClick={() => fetchRecipe(recipeQuery, true)}
              disabled={loadingSearchRecipe || !recipeQuery}
              className="p-3 bg-secondary-neon text-black rounded-xl hover:bg-white transition-all disabled:opacity-30"
            >
              {loadingSearchRecipe ? <Zap size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </GlassCard>

        <AnimatePresence>
          {searchRecipeResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard className="p-8 space-y-6 border-secondary-neon/30 relative">
                <button 
                  onClick={() => setSearchRecipeResult(null)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white"
                >
                  <Plus className="rotate-45" size={20} />
                </button>
                
                <h3 className="orbitron text-xl text-secondary-neon font-black">{recipeQuery.toUpperCase()}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h5 className="orbitron text-xs opacity-50 uppercase tracking-widest border-b border-white/10 pb-2">Molecular Components</h5>
                    <ul className="space-y-3">
                      {searchRecipeResult.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm opacity-80">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary-neon shadow-[0_0_8px_#00bfff]" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h5 className="orbitron text-xs opacity-50 uppercase tracking-widest border-b border-white/10 pb-2">Execution Pipeline</h5>
                    <div className="space-y-4">
                      {searchRecipeResult.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                          <span className="font-display font-black text-secondary-neon opacity-30 text-xl leading-none">{idx + 1}</span>
                          <p className="text-sm opacity-80 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {!result && !analyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4 hover:border-secondary-neon/30 transition-all cursor-pointer" onClick={fetchSuggestions}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-neon/10 flex items-center justify-center">
                <Sparkles size={24} className="text-secondary-neon" />
              </div>
              <div>
                <h4 className="orbitron text-sm">Fuel Suggestions</h4>
                <p className="text-[10px] text-white/40">Don't know what to eat? Let NutriBot decide.</p>
              </div>
            </div>
            {loadingSuggestions ? (
              <div className="flex justify-center py-4"><Zap className="animate-spin text-secondary-neon" /></div>
            ) : suggestions ? (
              <div className="space-y-3">
                {suggestions.map((s, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10"
                    onClick={(e) => { e.stopPropagation(); setInput(s.name); startAnalysis(s.name); }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{s.name}</span>
                      <span className="text-[10px] text-secondary-neon">{s.kcal} kcal</span>
                    </div>
                    <p className="text-[10px] text-white/40 line-clamp-1">{s.description}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-4 border border-dashed border-white/10 rounded-xl flex items-center justify-center">
                <span className="text-[10px] text-white/20 orbitron uppercase">Initialize Discovery</span>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 space-y-4 hover:border-primary-neon/30 transition-all cursor-pointer" onClick={() => {
            const random = quickChips[Math.floor(Math.random() * quickChips.length)];
            setRecipeQuery(random);
            fetchRecipe(random, true);
          }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-neon/10 flex items-center justify-center">
                <BookOpen size={24} className="text-primary-neon" />
              </div>
              <div>
                <h4 className="orbitron text-sm">Recipe Suggester</h4>
                <p className="text-[10px] text-white/40">Randomized high-performance protocol access.</p>
              </div>
            </div>
            <div className="py-4 border border-dashed border-white/10 rounded-xl flex items-center justify-center">
               <span className="text-[10px] text-white/20 orbitron uppercase">Simulate Random Recipe</span>
            </div>
          </GlassCard>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          {/* Health Score Gauge */}
          <section className="flex flex-col items-center justify-center py-4">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" fill="none" stroke="#111" strokeWidth="8" />
                <motion.circle 
                  cx="96" cy="96" r="88" fill="none" 
                  stroke={result.score && result.score > 70 ? "#00ff88" : result.score && result.score > 40 ? "#ff6b35" : "#ff4757"}
                  strokeWidth="8" 
                  strokeDasharray="552.92"
                  initial={{ strokeDashoffset: 552.92 }}
                  animate={{ strokeDashoffset: 552.92 - (552.92 * (result.score || 0)) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="orbitron text-5xl font-black neon-glow-green">{result.score}</span>
                <span className="text-[10px] orbitron text-white/40 uppercase tracking-widest">Health Score</span>
              </div>
            </div>
          </section>

          {/* Macronutrient Grid */}
          <section className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-white/5 border-l-4 border-white">
                <div className="text-[10px] orbitron text-white/40 mb-1">TOTAL CALORIES</div>
                <div className="text-2xl font-bold">{result.calories} <span className="text-xs font-normal opacity-50">kcal</span></div>
             </div>
             <div className="p-4 rounded-2xl bg-white/5 border-l-4 border-secondary-neon">
                <div className="text-[10px] orbitron text-secondary-neon mb-1">PROTEIN</div>
                <div className="text-2xl font-bold">{result.macros?.protein} <span className="text-xs font-normal opacity-50">g</span></div>
             </div>
             <div className="p-4 rounded-2xl bg-white/5 border-l-4 border-warning-neon">
                <div className="text-[10px] orbitron text-warning-neon mb-1">CARBS</div>
                <div className="text-2xl font-bold">{result.macros?.carbs} <span className="text-xs font-normal opacity-50">g</span></div>
             </div>
             <div className="p-4 rounded-2xl bg-white/5 border-l-4 border-yellow-400">
                <div className="text-[10px] orbitron text-yellow-400 mb-1">FATS</div>
                <div className="text-2xl font-bold">{result.macros?.fat} <span className="text-xs font-normal opacity-50">g</span></div>
             </div>
          </section>

          {/* Micronutrient Accordion */}
          <section className="glass-card overflow-hidden">
            <button 
              onClick={() => setShowMicros(!showMicros)}
              className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-all"
            >
              <span className="text-xs orbitron uppercase tracking-widest">Micronutrient RDA Analysis</span>
              <ChevronDown className={cn("transition-transform", showMicros && "rotate-180")} size={18} />
            </button>
            <AnimatePresence>
              {showMicros && (
                <motion.div 
                  initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  className="px-4 pb-4 space-y-4"
                >
                  {result.micronutrients?.map((m: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="opacity-60">{m.name}</span>
                        <span className="text-primary-neon">{m.percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${m.percent}%` }}
                          className="h-full bg-primary-neon rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Smart Swap Engine */}
          {result.swaps && result.swaps.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs orbitron opacity-50 px-1 uppercase tracking-widest">Smart Swap Engine</h3>
              {result.swaps.map((swap, idx) => (
                <GlassCard key={idx} className="p-0 overflow-hidden">
                  <div className="flex items-center">
                    <div className="flex-1 p-4 bg-danger-neon/10 flex flex-col items-center justify-center">
                      <span className="text-[10px] orbitron text-danger-neon mb-1 uppercase">Before</span>
                      <span className="text-xs line-through opacity-50 font-bold">{swap.original}</span>
                    </div>
                    <div className="p-2">
                       <ArrowRight size={20} className="text-white/20" />
                    </div>
                    <div className="flex-1 p-4 bg-primary-neon/10 flex flex-col items-center justify-center">
                      <span className="text-[10px] orbitron text-primary-neon mb-1 uppercase">After</span>
                      <span className="text-xs text-primary-neon font-bold">{swap.replacement}</span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="space-y-0.5">
                      <div className="text-[9px] text-white/40 orbitron uppercase">Reasoning</div>
                      <p className="text-[10px] opacity-70 italic">{swap.description}</p>
                    </div>
                    <div className="text-right">
                       <div className="text-[9px] text-white/40 orbitron uppercase">Savings</div>
                       <div className="text-sm font-bold text-secondary-neon">-{swap.caloriesSaved} kcal</div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </section>
          )}

          {/* Expert Insights */}
          <section className="p-5 border-2 border-dashed border-primary-neon/20 rounded-2xl bg-primary-neon/[0.02] space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary-neon animate-pulse shadow-[0_0_8px_#00ff88]" />
              <h3 className="text-sm orbitron uppercase tracking-widest text-primary-neon">NutriMind Expert Tips</h3>
            </div>
            <div className="space-y-3">
              {result.insights?.map((insight: string, idx: number) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <span className="text-primary-neon font-display">{idx + 1}.</span>
                  <p className="opacity-70 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Recipe Request Section (Embedded in Analysis) */}
          <section>
            {recipe ? (
              <GlassCard className="p-6 space-y-4 bg-secondary-neon/5 border-secondary-neon/20">
                <h4 className="orbitron text-xs text-secondary-neon tracking-widest uppercase">Neural Instruction Modules</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] orbitron opacity-40 mb-2 uppercase">Physical Components</h5>
                    <ul className="grid grid-cols-2 gap-2">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="text-[10px] opacity-70 flex items-center gap-2">
                          <div className="w-1 h-1 bg-secondary-neon rounded-full" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-[10px] orbitron opacity-40 mb-2 uppercase">Sequential Execution</h5>
                    {recipe.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start mb-3">
                        <div className="w-5 h-5 rounded-md bg-secondary-neon/20 flex-shrink-0 flex items-center justify-center text-[10px] font-display text-secondary-neon">
                          {idx + 1}
                        </div>
                        <p className="text-xs opacity-80">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <NeonButton variant="secondary" onClick={() => setRecipe(null)} className="w-full text-xs">Reset Instructions</NeonButton>
              </GlassCard>
            ) : (
              <button 
                onClick={() => fetchRecipe()}
                disabled={loadingRecipe}
                className="w-full py-4 border border-white/10 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs orbitron text-white/60 lowercase"
              >
                {loadingRecipe ? <Zap className="animate-spin" size={16} /> : <BookOpen size={16} />}
                request preparation recipe protocol
              </button>
            )}
          </section>

          <NeonButton onClick={handleLog} className="w-full h-16 text-lg shadow-[0_0_30px_rgba(0,255,136,0.3)]">
            Add to Daily Log
          </NeonButton>
        </div>
      )}
    </motion.div>
  );
};

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const InsightsView = ({ meals, user }: { meals: Meal[], user: UserProfile }) => {
  const [report, setReport] = useState<WeeklyInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const { generateWeeklyReport } = await import('./services/geminiService');
      const result = await generateWeeklyReport(meals, user);
      setReport(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const caloriesData = {
    labels: meals.slice(-7).reverse().map(m => new Date(m.timestamp).toLocaleDateString([], { weekday: 'short' })),
    datasets: [{
      label: 'Calories',
      data: meals.slice(-7).reverse().map(m => m.calories),
      borderColor: '#00ff88',
      backgroundColor: 'rgba(0, 255, 136, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00ff88',
      pointBorderColor: '#020409',
      pointBorderWidth: 2,
      pointRadius: 4,
    }]
  };

  const macroData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [{
      data: [
        meals.reduce((acc, m) => acc + m.macros.protein, 0),
        meals.reduce((acc, m) => acc + m.macros.carbs, 0),
        meals.reduce((acc, m) => acc + m.macros.fat, 0)
      ],
      backgroundColor: ['#00bfff', '#ff6b35', '#ff4757'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleFont: { family: 'Space Grotesk' },
        bodyFont: { family: 'Space Grotesk' },
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)' } }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="font-display text-sm uppercase tracking-widest text-white/40 mb-6">Calorie Velocity Trend</h3>
          <div className="h-64">
            <Line data={caloriesData} options={chartOptions} />
          </div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center">
          <h3 className="font-display text-sm uppercase tracking-widest text-white/40 mb-6 text-left w-full">Macro-Atomic Breakdown</h3>
          <div className="h-64 relative">
            <Doughnut data={macroData} options={{...chartOptions, cutout: '70%'}} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase text-white/40">Total Weight</span>
              <span className="font-display text-2xl">
                {Math.round(meals.reduce((acc, m) => acc + m.macros.protein + m.macros.carbs + m.macros.fat, 0))}g
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap size={120} className="text-primary-neon" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-2xl tracking-tighter italic">AI <span className="text-primary-neon">BIOMETRIC</span> REPORT</h3>
              <p className="text-sm text-white/40">Synthesizing data from the last 7 cycles</p>
            </div>
            {!report && (
              <NeonButton onClick={generateReport} disabled={loading} className="text-xs">
                {loading ? 'Synthesizing...' : 'Generate Insight'}
              </NeonButton>
            )}
          </div>

          {report ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <p className="text-lg leading-relaxed text-white/80">{report.summary}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="text-primary-neon text-xs uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={14} /> Tactical Wins
                  </h4>
                  <ul className="text-sm text-white/60 space-y-2">
                    {report.wins.map((w, i) => <li key={i}>— {w}</li>)}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-secondary-neon text-xs uppercase tracking-widest flex items-center gap-2">
                    <PieChart size={14} /> Patterns Detected
                  </h4>
                  <ul className="text-sm text-white/60 space-y-2">
                    {report.patterns.map((p, i) => <li key={i}>— {p}</li>)}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-warning-neon text-xs uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} /> Improvements
                  </h4>
                  <ul className="text-sm text-white/60 space-y-2">
                    {report.improvements.map((imp, i) => <li key={i}>— {imp}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ height: [10, 40, 10] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 bg-primary-neon/20 rounded-full"
                  />
                ))}
              </div>
              <p className="text-white/20 text-sm">Waiting for heuristic command...</p>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

const TipsView = () => {
  const tips = [
    {
      category: 'Nutrition',
      icon: <Flame size={20} className="text-warning-neon" />,
      items: [
        { title: 'The 30g Rule', description: 'Consume 30g of protein within 30 minutes of waking up to stabilize blood sugar and optimize dopamine production.' },
        { title: 'Caffeine Timing', description: 'Delay caffeine intake by 90-120 minutes after waking to avoid the afternoon crash by allowing adenosine levels to regulate.' },
        { title: 'Fiber First', description: 'Eat non-starchy vegetables first in a meal to flatten the glucose curve and reduce insulin spikes.' }
      ]
    },
    {
      category: 'Biohacking',
      icon: <Brain size={20} className="text-secondary-neon" />,
      items: [
        { title: 'Light Syncing', description: 'Expose eyes to direct sunlight for 10-15 minutes upon waking to set your circadian clock and optimize melatonin release at night.' },
        { title: 'Cold Exposure', description: '2 minutes of cold exposure increases norepinephrine by up to 200%, boosting metabolism and cognitive clarity.' },
        { title: 'Deep Work Fuel', description: 'Use MCT oil and electrolytes for sustained cognitive focus without the insulin load of glucose.' }
      ]
    },
    {
      category: 'Habit Logic',
      icon: <Target size={20} className="text-primary-neon" />,
      items: [
        { title: 'Habit Stacking', description: 'Identify a current habit you already do each day and then stack your new behavior on top of it.' },
        { title: 'Variable Reward', description: 'Make healthy eating fun by gamifying your log. High streaks release actual dopamine, reinforcing the loop.' },
        { title: 'Environment Design', description: 'Make good choices the path of least resistance. Keep the "Danger" foods out of sight or out of the house.' }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8 pb-12"
    >
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl tracking-widest uppercase italic">Operational <span className="text-primary-neon">Intelligence</span></h2>
        <p className="text-white/40 text-sm">Advanced protocols for human optimization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tips.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              {section.icon}
              <h3 className="orbitron text-xs tracking-widest uppercase opacity-60 font-bold">{section.category}</h3>
            </div>
            <div className="space-y-4">
              {section.items.map((tip, i) => (
                <GlassCard key={i} className="p-5 group hover:border-primary-neon/30 transition-all cursor-default">
                  <div className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-neon mt-1.5 shrink-0 group-hover:shadow-[0_0_8px_#00ff88]" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white/90">{tip.title}</h4>
                      <p className="text-[11px] text-white/40 leading-relaxed italic">{tip.description}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>

      <GlassCard className="p-8 border-dashed border-2 border-primary-neon/20 bg-primary-neon/[0.02]">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-primary-neon/10 flex items-center justify-center p-4">
            <Zap size={48} className="text-primary-neon animate-pulse" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="orbitron text-sm font-bold tracking-widest uppercase">The NutriMind Philosophy</h3>
            <p className="text-xs text-white/40 leading-relaxed italic">
              Health is not a destination, but a real-time calibration of biological signals. 
              Use this dashboard to internalize the logic of nutrition, not just the data of calories. 
              Your body is a high-performance machine; fuel it with intent.
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

const JourneyView = ({ user, meals }: { user: UserProfile, meals: Meal[] }) => {
  const achievements: Achievement[] = [
    { id: '1', title: 'First Fuel', description: 'Log your first meal data packet.', icon: '⚡', unlocked: meals.length > 0 },
    { id: '2', title: 'Perfect Sync', description: 'Log a meal with a score of 100.', icon: '🎯', unlocked: meals.some(m => m.score === 100) },
    { id: '3', title: 'Data Stream', description: 'Maintain a 7-day logging streak.', icon: '🔥', unlocked: user.streak >= 7 },
    { id: '4', title: 'Green Protocol', description: 'Log 5 "Great" choice meals.', icon: '🥗', unlocked: meals.filter(m => m.verdict === 'Great').length >= 5 },
    { id: '5', title: 'Hydration Link', description: 'Complete a hydration objective.', icon: '💧', unlocked: false },
    { id: '6', title: 'Night Owl', description: 'Log a meal after 22:00.', icon: '🌙', unlocked: meals.some(m => new Date(m.timestamp).getHours() >= 22) },
  ];

  const nextLevelXP = user.level * 100 * (user.level * 0.5 + 1);
  const xpPercentage = (user.xp / nextLevelXP) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      {/* Profile Header */}
      <GlassCard className="flex flex-col md:flex-row items-center gap-8 py-10">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-primary-neon/20 p-1">
            <div className="w-full h-full rounded-full bg-primary-neon/10 flex items-center justify-center font-display text-5xl text-primary-neon shadow-[0_0_30px_rgba(0,255,136,0.2)]">
              {user.name[0]}
            </div>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-primary-neon/30 rounded-full"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary-neon text-black px-4 py-1 rounded-full font-display text-xs font-bold whitespace-nowrap">
            LEV {user.level}
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h2 className="font-display text-3xl font-black italic">{user.name}</h2>
            <p className="text-white/40 uppercase tracking-widest text-xs">Biometric Signature: #{Math.random().toString(16).slice(2, 10).toUpperCase()}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs uppercase tracking-widest">
              <span className="text-white/40">XP Progress</span>
              <span className="text-primary-neon">{Math.round(user.xp)} / {Math.round(nextLevelXP)}</span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                className="h-full bg-primary-neon rounded-full shadow-[0_0_15px_rgba(0,255,136,0.5)]"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Meals', value: meals.length, icon: <Activity size={18} /> },
          { label: 'Avg Score', value: meals.length > 0 ? Math.round(meals.reduce((a,b) => a+b.score, 0)/meals.length) : 0, icon: <Heart size={18} /> },
          { label: 'Streak', value: `${user.streak}d`, icon: <History size={18} /> },
          { label: 'Directive', value: user.goal.split(' ')[0], icon: <Target size={18} /> },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-4 text-center space-y-1">
            <div className="flex justify-center text-primary-neon/60 mb-2">{stat.icon}</div>
            <p className="font-display text-2xl">{stat.value}</p>
            <p className="text-[10px] uppercase text-white/40 tracking-widest">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h3 className="font-display text-lg tracking-tight px-2">Achievement Unlocks</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {achievements.map((ach) => (
            <div key={ach.id} className={cn(
              "p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center gap-2",
              ach.unlocked 
                ? "bg-primary-neon/5 border-primary-neon/40 shadow-[0_0_20px_rgba(0,255,136,0.1)]" 
                : "bg-white/5 border-white/5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all"
            )}>
              <span className="text-4xl mb-2">{ach.icon}</span>
              <p className="text-[10px] font-display font-bold uppercase leading-tight">{ach.title}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const WheelView = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const options = [
    "Keto Bowl", "Protein Shake", "Quinoa Salad", "Avocado Toast", 
    "Grilled Salmon", "Smoothie Bowl", "Steak & Veggies", "Lentil Soup"
  ];

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    
    // Play sound logic would go here
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}

    const newRotation = rotation + 1800 + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      const actualRotation = newRotation % 360;
      const index = Math.floor((360 - (actualRotation % 360)) / (360 / options.length)) % options.length;
      setResult(options[index]);
    }, 4000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center space-y-12 py-10"
    >
      <div className="text-center space-y-2">
        <h2 className="font-display text-4xl font-black italic">MEAL <span className="text-primary-neon">WHEEL</span></h2>
        <p className="text-white/40 text-sm">Decentralized food selection protocol</p>
      </div>

      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-primary-neon filter drop-shadow-[0_0_10px_rgba(0,255,136,0.8)]">
          <ChevronRight className="rotate-90" size={40} fill="currentColor" />
        </div>
        
        {/* Wheel */}
        <motion.div 
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "circOut" }}
          className="w-80 h-80 rounded-full border-8 border-white/5 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          style={{ background: 'conic-gradient(from 0deg, #020409, #1a1a1a, #020409, #1a1a1a, #020409, #1a1a1a, #020409, #1a1a1a)' }}
        >
          {options.map((opt, i) => (
            <div 
              key={i}
              className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 origin-bottom flex flex-col items-center pt-4"
              style={{ transform: `translateX(-50%) rotate(${i * (360 / options.length)}deg)` }}
            >
              <span className="text-[10px] font-display font-bold uppercase tracking-tighter text-white/40" style={{ transform: 'rotate(180deg)', writingMode: 'vertical-rl' }}>
                {opt}
              </span>
              <div className="w-1 h-32 bg-primary-neon/5 absolute top-0" />
            </div>
          ))}
          <div className="absolute inset-0 border border-primary-neon/20 rounded-full pointer-events-none" />
        </motion.div>

        {/* Center Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-bg-dark border-2 border-primary-neon flex items-center justify-center z-10 shadow-[0_0_20px_rgba(0,255,136,0.5)]">
          <div className="w-2 h-2 rounded-full bg-primary-neon animate-ping" />
        </div>
      </div>

      <div className="h-24 flex flex-col items-center justify-center">
        {result ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <p className="text-[10px] uppercase text-primary-neon tracking-[0.3em] font-black">Result Stabilized</p>
            <h3 className="font-display text-4xl">{result}</h3>
            <p className="text-white/40 text-sm italic">Estimated impact: ~450 kcal · High Satiety</p>
          </motion.div>
        ) : (
          <NeonButton onClick={spin} disabled={spinning} className="px-12 py-5 text-xl">
            {spinning ? 'Calibrating...' : 'Initiate Spin'}
          </NeonButton>
        )}
      </div>
    </motion.div>
  );
};

