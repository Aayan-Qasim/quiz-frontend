import { UserProfile, Question, QuizResult, AnalyticsSummary, CategoryStats, QuestionStats } from '../types.js';

const SEED_USERS: UserProfile[] = [
  {
    id: 'user_admin',
    name: 'Quiz Master Admin',
    email: 'admin@quizmaster.com',
    password: 'adminpassword',
    score: 0,
    level: 1,
    totalPoints: 0,
    streak: 0,
    lastQuizTime: 0,
    profileImageUri: null,
    isAdmin: true,
    role: 'admin',
    createdAt: Date.now()
  },
  {
    id: 'user_scholar',
    name: 'Quiz Master Scholar',
    email: 'user@quizmaster.com',
    score: 12,
    level: 2,
    totalPoints: 120,
    streak: 3,
    lastQuizTime: Date.now() - 43200000,
    profileImageUri: null,
    isAdmin: false,
    role: 'user',
    createdAt: Date.now() - 864500000
  }
];

const SEED_QUESTIONS: Question[] = [
  {
    id: 'q1',
    category: 'Computer Science',
    questionText: 'Which programming language is known as the "mother of all languages", serving as the developer basis for C++, Java, and Python?',
    optionA: 'Assembly Language',
    optionB: 'C programming language',
    optionC: 'COBOL',
    optionD: 'Fortran',
    correctAnswer: 'B',
    explanation: 'C was developed in 1972 and serves as the syntactical foundation for C++, Objective-C, Java, Python, and JavaScript.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q2',
    category: 'Computer Science',
    questionText: 'What does the abbreviation HTTP stand for in web network communications?',
    optionA: 'HyperText Transmission Protocol',
    optionB: 'HyperText Transfer Protocol',
    optionC: 'High Transfer Tech Protocol',
    optionD: 'Hyperlink Transfer Tech Protocol',
    correctAnswer: 'B',
    explanation: 'HTTP is the standard abbreviation for HyperText Transfer Protocol, the protocol used to exchange hypermedia documents.',
    isFavorite: true,
    isCustom: false
  },
  {
    id: 'q3',
    category: 'Computer Science',
    questionText: 'In Jetpack Compose (Android), which state holder is utilized to survive configuration changes like screen rotations?',
    optionA: 'remember',
    optionB: 'rememberSaveable',
    optionC: 'mutableStateOf',
    optionD: 'LiveData',
    correctAnswer: 'B',
    explanation: 'While remember stores values across recombinations, rememberSaveable preserves the saved states across Activity rebuilds and configuration changes.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q4',
    category: 'General Knowledge',
    questionText: 'Which planet in our solar system is widely recognized as the Red Planet due to iron oxide particles on its surface?',
    optionA: 'Venus',
    optionB: 'Mars',
    optionC: 'Jupiter',
    optionD: 'Saturn',
    correctAnswer: 'B',
    explanation: 'Mars features iron oxide (rust) covering its outer crust, giving it a distinctive reddish glint visible from Earth.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q5',
    category: 'General Knowledge',
    questionText: 'Which famous painting features the mysterious gaze of Mona Lisa, crafted by Leonardo da Vinci?',
    optionA: 'The Starry Night',
    optionB: 'La Gioconda (Mona Lisa)',
    optionC: 'The Last Supper',
    optionD: 'The Scream',
    correctAnswer: 'B',
    explanation: 'Mona Lisa (popularly known in Italian as La Gioconda) was painted by Leonardo da Vinci during the Italian Renaissance.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q6',
    category: 'Science',
    questionText: 'What is the chemical symbol representing Gold on the scientific periodic table of chemical elements?',
    optionA: 'Gd',
    optionB: 'Au',
    optionC: 'Ag',
    optionD: 'Go',
    correctAnswer: 'B',
    explanation: 'The chemical gold symbol Au originates from the Latin term "Aurum", signifying "shining dawn".',
    isFavorite: true,
    isCustom: false
  },
  {
    id: 'q7',
    category: 'Science',
    questionText: 'Which biological structural organelle is termed the "powerhouse of the eukaryotic cell"?',
    optionA: 'Nucleus',
    optionB: 'Mitochondrion',
    optionC: 'Ribosome',
    optionD: 'Golgi Apparatus',
    correctAnswer: 'B',
    explanation: 'Mitochondria produce adenosine triphosphate (ATP), the primary cellular energy currency.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q8',
    category: 'Mathematics',
    questionText: 'What is the mathematical mathematical value representing the sum of inner angles of equilateral triangles?',
    optionA: '90 degrees',
    optionB: '180 degrees',
    optionC: '360 degrees',
    optionD: '270 degrees',
    correctAnswer: 'B',
    explanation: 'The interior angles of any planar triangle sum to exactly 180 degrees (pi radians).',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q9',
    category: 'Mathematics',
    questionText: 'If a die is tossed, what is the exact probability of landing on a prime number?',
    optionA: '1/3',
    optionB: '1/2',
    optionC: '2/3',
    optionD: '1/6',
    correctAnswer: 'B',
    explanation: 'A standard standard six-sided die has numbers 1, 2, 3, 4, 5, 6. The prime numbers are 2, 3, and 5 (three total outcomes). 3/6 simplifies to 1/2.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q10',
    category: 'English',
    questionText: 'Choose the appropriate antonym for the vocabulary descriptor "Benevolent" (desiring to perform goodness/help others).',
    optionA: 'Generous',
    optionB: 'Malevolent',
    optionC: 'Altruistic',
    optionD: 'Kindhearted',
    correctAnswer: 'B',
    explanation: 'Benevolent denotes well-wishing and kind, while Malevolent describes seeking to cause malicious harm or damage.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q11',
    category: 'English',
    questionText: 'Identify the figure of speech used in the comparison sentence: "The courtroom was as cold as solid winter ice".',
    optionA: 'Metaphor',
    optionB: 'Simile',
    optionC: 'Personification',
    optionD: 'Hyperbole',
    correctAnswer: 'B',
    explanation: 'Similes explicitly compare objects using linking terms such as "like" or "as".',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q12',
    category: 'Islamiat',
    questionText: 'What is the precise total number of absolute Surahs contained within the Holy Quran?',
    optionA: '110',
    optionB: '114',
    optionC: '120',
    optionD: '115',
    correctAnswer: 'B',
    explanation: 'The Quran contains exactly 114 Surahs (chapters) spanning 30 unified chapters.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q13',
    category: 'Islamiat',
    questionText: 'In Islamic history, which city did the Holy Prophet (PBUH) migrate to during the historical event called Hijra?',
    optionA: 'Taif',
    optionB: 'Medina',
    optionC: 'Jerusalem',
    optionD: 'Riyadh',
    correctAnswer: 'B',
    explanation: 'The Hijra marked the pivotal migration of Muslims from Makkah to Yasrib, subsequently renamed Medina (the City of the Prophet).',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q14',
    category: 'Current Affairs',
    questionText: 'Which digital technology concept relates directly to decentralized ledgers that secure operations via cryptographically connected blocks?',
    optionA: 'Machine Learning',
    optionB: 'Blockchain Technology',
    optionC: 'Cloud Virtualization',
    optionD: 'Quantum Entanglement',
    correctAnswer: 'B',
    explanation: 'Blockchain stores a continuous sequence of records (blocks) that are cryptographically signed to form secure records.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q15',
    category: 'Science',
    questionText: 'Which physical layer protects the Earth from harmful ultraviolet solar radiation emitted by outer solar systems?',
    optionA: 'Mesosphere',
    optionB: 'Ozone Layer',
    optionC: 'Troposphere',
    optionD: 'Ionosphere',
    correctAnswer: 'B',
    explanation: 'The ozone layer acts as a safety shield absorbing standard proportions of damaging ultraviolet light.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q16',
    category: 'Mathematics',
    questionText: 'Solve the coordinate variable equation: If 3x + 9 = 27, calculate the numerical value of x.',
    optionA: '4',
    optionB: '6',
    optionC: '8',
    optionD: '9',
    correctAnswer: 'B',
    explanation: 'Subtracting 9 yields 3x = 18. Dividing by 3 solves x to exactly 6.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q17',
    category: 'Entry Tests',
    questionText: 'In logical intelligence testing, complete the logical progress: 2, 4, 8, 16, 32, __.',
    optionA: '48',
    optionB: '64',
    optionC: '50',
    optionD: '128',
    correctAnswer: 'B',
    explanation: 'The terms increase doubling values dynamically. Multiplying 32 by 2 solves for 64.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q18',
    category: 'Entry Tests',
    questionText: 'Which geometric ratio denotes the constant relationship between circle perimeter circles and linear diameters?',
    optionA: 'Golden Ratio',
    optionB: 'Pi (π)',
    optionC: 'Euler\'s Constant',
    optionD: 'Square root of 2',
    correctAnswer: 'B',
    explanation: 'Pi represents the mathematical ratio of a circle\'s circumference divided by its diameter, universally approximating 3.14159.',
    isFavorite: true,
    isCustom: false
  },
  {
    id: 'q19',
    category: 'General Knowledge',
    questionText: 'Which is the deepest and largest open ocean basin present on the planet Earth?',
    optionA: 'Atlantic Ocean',
    optionB: 'Pacific Ocean',
    optionC: 'Indian Ocean',
    optionD: 'Arctic Ocean',
    correctAnswer: 'B',
    explanation: 'The Pacific Ocean hosts the Mariana Trench and is widely cataloged as the largest water body globally.',
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'q20',
    category: 'English',
    questionText: 'Which word serves as an accurate synonym representing the adjective "Meticulous" (extremely thorough, detail-oriented)?',
    optionA: 'Careless',
    optionB: 'Scrupulous',
    optionC: 'Hasty',
    optionD: 'Lethargic',
    correctAnswer: 'B',
    explanation: 'Meticulous and scrupulous describe extreme attentiveness to precision, details, and exact standard adherence.',
    isFavorite: false,
    isCustom: false
  }
];

const SEED_RESULTS: QuizResult[] = [
  {
    id: 'r1',
    userId: 'user_scholar',
    quizDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    score: 8,
    totalQuestions: 10,
    category: 'Computer Science',
    note: 'Good attempt, need to practice RememberSaveable.'
  },
  {
    id: 'r2',
    userId: 'user_scholar',
    quizDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    score: 4,
    totalQuestions: 5,
    category: 'General Knowledge',
    note: 'Quick quiz!'
  }
];

// Helper to calculate user's level based on points
function calculateLevel(p: number): number {
  if (p >= 500) return 5;
  if (p >= 300) return 4;
  if (p >= 150) return 3;
  if (p >= 50) return 2;
  return 1;
}

// A resilient fallback validation and memory store
let isLocalStorageOk: boolean | null = null;
function checkStorageOk(): boolean {
  if (isLocalStorageOk !== null) return isLocalStorageOk;
  try {
    const testKey = '__storage_test_key__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    isLocalStorageOk = true;
  } catch (err) {
    console.warn('LocalStorage is not accessible or restricted:', err);
    isLocalStorageOk = false;
  }
  return isLocalStorageOk;
}

const customMemoryStore: Record<string, string> = {};

// Ensure the storage is seeded
function getStored<T>(key: string, seed: T): T {
  const fullKey = `qm_${key}`;
  try {
    const val = checkStorageOk() ? localStorage.getItem(fullKey) : customMemoryStore[fullKey];
    if (val) {
      return JSON.parse(val);
    }
  } catch (err) {
    console.error('Error reading Storage for key', key, err);
  }
  
  // Set and return defaults safely
  try {
    const serialized = JSON.stringify(seed);
    if (checkStorageOk()) {
      localStorage.setItem(fullKey, serialized);
    } else {
      customMemoryStore[fullKey] = serialized;
    }
  } catch (err) {
    console.error('Error updating default Storage for key', key, err);
  }
  return seed;
}

function saveStored<T>(key: string, data: T): void {
  const fullKey = `qm_${key}`;
  try {
    const serialized = JSON.stringify(data);
    if (checkStorageOk()) {
      localStorage.setItem(fullKey, serialized);
    } else {
      customMemoryStore[fullKey] = serialized;
    }
  } catch (err) {
    console.error('Error writing Storage for key', key, err);
  }
}

export const clientDb = {
  getUsers(): UserProfile[] {
    return getStored<UserProfile[]>('users', SEED_USERS);
  },

  getQuestions(): Question[] {
    return getStored<Question[]>('questions', SEED_QUESTIONS);
  },

  getResults(): QuizResult[] {
    return getStored<QuizResult[]>('results', SEED_RESULTS);
  },

  saveUsers(users: UserProfile[]) {
    saveStored('users', users);
  },

  saveQuestions(questions: Question[]) {
    saveStored('questions', questions);
  },

  saveResults(results: QuizResult[]) {
    saveStored('results', results);
  },

  // Auth helper
  login(email: string, pass: string): { token: string; user: UserProfile } {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (!foundUser) {
      throw new Error('User associated with this email address does not exist.');
    }
    if (!foundUser.password || foundUser.password !== pass) {
      throw new Error('Invalid credentials. Check password spelling.');
    }
    if (!foundUser.isAdmin) {
      throw new Error('Access denied. This portal is restricted to administrators.');
    }
    // Generate simple token representation containing email and random chars
    const genToken = `sess_${foundUser.id}_${Math.random().toString(36).substring(2, 6)}`;
    return { token: genToken, user: foundUser };
  },

  // Questions APIs
  queryQuestions(category?: string, isCustom?: boolean): Question[] {
    let list = this.getQuestions();
    if (category) {
      list = list.filter(q => q.category.toLowerCase() === category.toLowerCase());
    }
    if (isCustom !== undefined) {
      list = list.filter(q => q.isCustom === isCustom);
    }
    return list;
  },

  saveQuestion(payload: Partial<Question>): Question {
    const questions = this.getQuestions();
    
    if (payload.id) {
      // Edit
      const idx = questions.findIndex(q => q.id === payload.id);
      if (idx === -1) throw new Error('Target question model not found to update.');
      const updated = {
        ...questions[idx],
        ...payload,
        isCustom: questions[idx].isCustom // Preserve
      } as Question;
      questions[idx] = updated;
      this.saveQuestions(questions);
      return updated;
    } else {
      // Create
      const newQuestion: Question = {
        id: 'q_' + Math.random().toString(36).substring(2, 9),
        category: payload.category || 'General Knowledge',
        questionText: payload.questionText || '',
        optionA: payload.optionA || '',
        optionB: payload.optionB || '',
        optionC: payload.optionC || '-',
        optionD: payload.optionD || '-',
        correctAnswer: payload.correctAnswer || 'A',
        explanation: payload.explanation || '',
        isFavorite: false,
        isCustom: true
      };
      questions.push(newQuestion);
      this.saveQuestions(questions);
      return newQuestion;
    }
  },

  deleteQuestion(id: string): void {
    const questions = this.getQuestions();
    const remains = questions.filter(q => q.id !== id);
    this.saveQuestions(remains);
  },

  toggleFavorite(id: string): Question {
    const questions = this.getQuestions();
    const idx = questions.findIndex(q => q.id === id);
    if (idx === -1) throw new Error('Question model not found');
    questions[idx].isFavorite = !questions[idx].isFavorite;
    this.saveQuestions(questions);
    return questions[idx];
  },

  bulkImport(rawList: any[]): number {
    const questions = this.getQuestions();
    let imported = 0;
    rawList.forEach(item => {
      const qText = item.questionText || item.question || '';
      if (item.category && qText && item.optionA && item.optionB) {
        questions.push({
          id: 'q_' + Math.random().toString(36).substring(2, 9),
          category: String(item.category).trim(),
          questionText: String(qText).trim(),
          optionA: String(item.optionA).trim(),
          optionB: String(item.optionB).trim(),
          optionC: String(item.optionC || '-').trim(),
          optionD: String(item.optionD || '-').trim(),
          correctAnswer: (item.correctAnswer || 'A').toUpperCase() as any,
          explanation: String(item.explanation || '').trim(),
          isFavorite: false,
          isCustom: true
        });
        imported++;
      }
    });
    this.saveQuestions(questions);
    return imported;
  },

  // Categories APIs
  getCategories(): string[] {
    const questions = this.getQuestions();
    return Array.from(new Set(questions.map(q => q.category)));
  },

  saveCategoryOperation(oldName: string, newName: string, mode: 'rename' | 'duplicate' | 'delete'): void {
    const questions = this.getQuestions();
    const targetOld = oldName.trim();
    const targetNew = newName.trim();

    if (mode === 'delete') {
      const remains = questions.filter(q => q.category.toLowerCase() !== targetOld.toLowerCase());
      this.saveQuestions(remains);
    } else if (mode === 'rename') {
      if (!targetNew) throw new Error('New category segment target name required.');
      const updated = questions.map(q => {
        if (q.category.toLowerCase() === targetOld.toLowerCase()) {
          return { ...q, category: targetNew };
        }
        return q;
      });
      this.saveQuestions(updated);
    } else if (mode === 'duplicate') {
      if (!targetNew) throw new Error('New duplicated category name required.');
      const duped: Question[] = [];
      questions.forEach(q => {
        if (q.category.toLowerCase() === targetOld.toLowerCase()) {
          duped.push({
            ...q,
            id: 'q_' + Math.random().toString(36).substring(2, 9),
            category: targetNew,
            isCustom: true
          });
        }
      });
      this.saveQuestions([...questions, ...duped]);
    }
  },

  // Students/Users APIs
  getUserResults(userId: string): QuizResult[] {
    const results = this.getResults();
    return results.filter(r => r.userId === userId);
  },

  adjustUserStats(userId: string, totalPoints: number, streak: number, level?: number): UserProfile {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('Student user profile not found.');

    const computedLevel = level !== undefined && level > 0 ? level : calculateLevel(totalPoints);
    users[idx] = {
      ...users[idx],
      totalPoints,
      streak,
      level: computedLevel,
      score: Math.floor(totalPoints / 10) // estimate score
    };
    this.saveUsers(users);
    return users[idx];
  },

  // Submit actual practice quiz result
  submitQuizResult(userId: string, category: string, score: number, totalQuestions: number, note: string): QuizResult {
    const results = this.getResults();
    const newResult: QuizResult = {
      id: 'r_' + Math.random().toString(36).substring(2, 9),
      userId,
      quizDate: Date.now(),
      score,
      totalQuestions,
      category,
      note: note || ''
    };
    results.push(newResult);
    this.saveResults(results);

    // Update user stats
    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      const pointsEarned = score * 10;
      const currentPoints = users[userIdx].totalPoints || 0;
      const newPoints = currentPoints + pointsEarned;
      
      // Streak adjustment
      const now = Date.now();
      const lastQuizTime = users[userIdx].lastQuizTime || 0;
      let streak = users[userIdx].streak || 0;
      if (lastQuizTime > 0) {
        const diffHours = (now - lastQuizTime) / (1000 * 60 * 60);
        if (diffHours < 36) {
          streak = streak === 0 ? 1 : streak + 1;
        } else {
          streak = 1; // broken streak
        }
      } else {
        streak = 1;
      }

      users[userIdx] = {
        ...users[userIdx],
        score: (users[userIdx].score || 0) + score,
        totalPoints: newPoints,
        streak,
        lastQuizTime: now,
        level: calculateLevel(newPoints)
      };
      this.saveUsers(users);
    }

    return newResult;
  },

  // Leaderboards
  getLeaderboardWeekly(): any[] {
    const users = this.getUsers().filter(u => u.role !== 'admin');
    // For simplicity, weekly points is slightly randomized/proportional score or subset of totalPoints
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      level: u.level,
      streak: u.streak,
      weeklyPoints: Math.floor(u.totalPoints * 0.75),
      totalPoints: u.totalPoints
    })).sort((a, b) => b.weeklyPoints - a.weeklyPoints);
  },

  getLeaderboardAllTime(): any[] {
    const users = this.getUsers().filter(u => u.role !== 'admin');
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      level: u.level,
      streak: u.streak,
      totalPoints: u.totalPoints
    })).sort((a, b) => b.totalPoints - a.totalPoints);
  },

  // Analytics Dashboard Stats
  getDashboardStats(): AnalyticsSummary {
    const questions = this.getQuestions();
    const users = this.getUsers().filter(u => u.role !== 'admin');
    const results = this.getResults();

    const totalQuestions = questions.length;
    const totalCategories = Array.from(new Set(questions.map(q => q.category))).length;
    const totalUsers = users.length;
    const totalAttempts = results.length;

    // Categorized breakdown lists
    const catAttempts: Record<string, { total: number; correct: number; questions: number }> = {};
    questions.forEach(q => {
      if (!catAttempts[q.category]) {
        catAttempts[q.category] = { total: 0, correct: 0, questions: 0 };
      }
      catAttempts[q.category].questions++;
    });

    results.forEach(r => {
      if (!catAttempts[r.category]) {
        catAttempts[r.category] = { total: 0, correct: 0, questions: 0 };
      }
      catAttempts[r.category].total += r.totalQuestions;
      catAttempts[r.category].correct += r.score;
    });

    const categoryStats: CategoryStats[] = Object.keys(catAttempts).map(catName => {
      const info = catAttempts[catName];
      const avgScore = info.total > 0 ? parseFloat((info.correct / (info.total / 10)).toFixed(1)) : 0;
      const correctRate = info.total > 0 ? Math.round((info.correct / info.total) * 105) : 100; // soft cap
      return {
        category: catName,
        questionCount: info.questions,
        totalAttempts: info.total > 0 ? Math.ceil(info.total / 5) : 0,
        avgScore: avgScore,
        correctRate: Math.min(100, Math.max(0, correctRate))
      };
    });

    // Difficulty breakdown items
    const questionAttempts: Record<string, { wrong: number; total: number }> = {};
    results.forEach(r => {
      // Simulate question-level wrong answers proportionally
      const wrongCount = Math.max(0, r.totalQuestions - r.score);
      // distribute them
      const categoryQs = questions.filter(q => q.category === r.category);
      categoryQs.forEach(q => {
        if (!questionAttempts[q.id]) {
          questionAttempts[q.id] = { wrong: 0, total: 0 };
        }
        questionAttempts[q.id].total++;
        if (Math.random() < (wrongCount / r.totalQuestions)) {
          questionAttempts[q.id].wrong++;
        }
      });
    });

    const difficultyStats: QuestionStats[] = questions.map(q => {
      const attempts = questionAttempts[q.id] || { wrong: 0, total: 0 };
      const wrongAttempts = attempts.wrong;
      const totalAttemptsNum = attempts.total || Math.floor(Math.random() * 3);
      const difficultyRate = totalAttemptsNum > 0 ? Math.round((wrongAttempts / totalAttemptsNum) * 100) : Math.floor(Math.random() * 40);
      return {
        questionId: q.id,
        questionText: q.questionText,
        category: q.category,
        totalAttempts: Math.max(1, totalAttemptsNum),
        wrongAttempts: wrongAttempts,
        difficultyRate: difficultyRate
      };
    }).sort((a, b) => b.difficultyRate - a.difficultyRate).slice(0, 5);

    // Mock Active timelines
    const dailyActiveUsers = [
      { date: 'Mon', count: Math.ceil(totalUsers * 0.4) },
      { date: 'Tue', count: Math.ceil(totalUsers * 0.6) },
      { date: 'Wed', count: Math.ceil(totalUsers * 0.5) },
      { date: 'Thu', count: Math.ceil(totalUsers * 0.7) },
      { date: 'Fri', count: Math.ceil(totalUsers * 0.8) },
      { date: 'Sat', count: Math.ceil(totalUsers * 0.3) },
      { date: 'Sun', count: Math.ceil(totalUsers * 0.5) }
    ];

    return {
      totalQuestions,
      totalCategories,
      totalUsers,
      totalAttempts,
      categoryStats,
      difficultyStats,
      dailyActiveUsers
    };
  }
};
