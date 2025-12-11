/**
 * Workflow Helper Functions
 * Utility functions for age calculation, maturity status, and workflow filtering
 */

/**
 * Calculate age in days from birth date
 * @param {string|Date} birthDate - Birth date
 * @returns {number} Age in days
 */
export const getAgeInDays = (birthDate) => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  const diffTime = Math.abs(today - birth);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get maturity status based on age
 * @param {string|Date} birthDate - Birth date
 * @returns {Object} { status: string, label: string, color: string }
 */
export const getMaturityStatus = (birthDate) => {
  const days = getAgeInDays(birthDate);

  if (days < 90) {
    return { status: 'young', label: 'Terlalu Muda', color: 'yellow' };
  }

  if (days < 180) {
    return { status: 'ready', label: 'Siap Dicatat', color: 'green' };
  }

  return { status: 'mature', label: 'Dewasa', color: 'blue' };
};

/**
 * Calculate anakan recording progress
 * @param {Object} breeding - Breeding object
 * @param {Array} anakanList - List of all anakan
 * @returns {Object} { recorded: number, total: number, percentage: number, isComplete: boolean }
 */
export const getAnakanProgress = (breeding, anakanList) => {
  const recorded = anakanList.filter(a => a.breeding_id === breeding.id).length;
  const total = breeding.jumlah_anakan || 0;
  const percentage = total > 0 ? Math.round((recorded / total) * 100) : 0;

  return {
    recorded,
    total,
    percentage,
    isComplete: recorded >= total
  };
};

/**
 * Filter breeding by workflow stage
 * @param {Array} breedingList - List of all breeding
 * @param {Array} anakanList - List of all anakan
 * @param {string} stage - Workflow stage: 'new', 'ready-to-record'
 * @returns {Array} Filtered breeding list (sorted by oldest tanggal_menetas first)
 */
export const filterBreedingByWorkflow = (breedingList, anakanList, stage) => {
  let filtered = [];

  switch(stage) {
    case 'new': // < 3 months (90 days)
      filtered = breedingList.filter(b => getAgeInDays(b.tanggal_menetas) < 90);
      break;

    case 'ready-to-record': // 3+ months, incomplete recording
      filtered = breedingList.filter(b => {
        const age = getAgeInDays(b.tanggal_menetas);
        const progress = getAnakanProgress(b, anakanList);
        return age >= 90 && !progress.isComplete;
      });
      break;

    default:
      filtered = breedingList;
  }

  // Sort by tanggal_menetas (oldest first)
  return filtered.sort((a, b) => {
    const dateA = a.tanggal_menetas ? new Date(a.tanggal_menetas) : new Date(0);
    const dateB = b.tanggal_menetas ? new Date(b.tanggal_menetas) : new Date(0);
    return dateA - dateB;
  });
};

/**
 * Filter anakan by maturity for promotion
 * @param {Array} anakanList - List of all anakan
 * @param {Array} breedingList - List of all breeding (to get tanggal_menetas)
 * @returns {Array} Mature anakan ready for promotion (sorted by oldest tanggal_menetas first)
 */
export const filterMatureAnakan = (anakanList, breedingList) => {
  const filtered = anakanList.filter(anakan => {
    // Only healthy anakan
    if (anakan.status !== 'Sehat') return false;

    // Find breeding to get tanggal_menetas
    const breeding = breedingList.find(b => b.id === anakan.breeding_id);
    if (!breeding || !breeding.tanggal_menetas) return false;

    // Check if mature (>= 180 days)
    const age = getAgeInDays(breeding.tanggal_menetas);
    return age >= 180;
  });

  // Sort by breeding's tanggal_menetas (oldest first)
  return filtered.sort((anakanA, anakanB) => {
    const breedingA = breedingList.find(br => br.id === anakanA.breeding_id);
    const breedingB = breedingList.find(br => br.id === anakanB.breeding_id);
    const dateA = breedingA?.tanggal_menetas ? new Date(breedingA.tanggal_menetas) : new Date(0);
    const dateB = breedingB?.tanggal_menetas ? new Date(breedingB.tanggal_menetas) : new Date(0);
    return dateA - dateB;
  });
};

/**
 * Format age for display
 * Consistent with existing module logic
 * @param {string|Date} birthDate - Birth date
 * @returns {string} Formatted age string
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return '-';

  const days = getAgeInDays(birthDate);

  if (days < 30) {
    return `${days} hari`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    return remainingDays > 0 ? `${months}bln ${remainingDays}hr` : `${months} bulan`;
  }

  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);

  if (months > 0) {
    return `${years}th ${months}bln`;
  }

  return `${years} tahun`;
};

/**
 * Format date for display
 * @param {string|Date} dateString - Date string
 * @returns {string} Formatted date (e.g., "15 Jan 2024")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Check if indukan is currently breeding
 * @param {string} ayamId - Indukan ID
 * @param {Array} breedingList - List of all breeding
 * @param {number} recentDays - Consider breeding recent if within this many days (default: 60)
 * @returns {boolean} True if currently breeding
 */
export const isCurrentlyBreeding = (ayamId, breedingList, recentDays = 60) => {
  return breedingList.some(breeding => {
    const isPejantan = breeding.pejantan_id === ayamId;
    const isBetina = breeding.betina_id === ayamId;

    if (!isPejantan && !isBetina) return false;

    const age = getAgeInDays(breeding.tanggal_menetas);
    return age < recentDays;
  });
};

/**
 * Get breeding count for an indukan
 * @param {string} ayamId - Indukan ID
 * @param {Array} breedingList - List of all breeding
 * @returns {number} Count of breeding
 */
export const getBreedingCount = (ayamId, breedingList) => {
  return breedingList.filter(breeding =>
    breeding.pejantan_id === ayamId || breeding.betina_id === ayamId
  ).length;
};

/**
 * Get anakan by breeding ID
 * @param {string} breedingId - Breeding ID
 * @param {Array} anakanList - List of all anakan
 * @returns {Array} Anakan for this breeding
 */
export const getAnakanByBreedingId = (breedingId, anakanList) => {
  return anakanList.filter(a => a.breeding_id === breedingId);
};

/**
 * Group anakan by breeding
 * @param {Array} anakanList - List of all anakan
 * @returns {Object} Grouped anakan { breedingId: [anakan] }
 */
export const groupAnakanByBreeding = (anakanList) => {
  return anakanList.reduce((acc, anakan) => {
    const breedingId = anakan.breeding_id;
    if (!acc[breedingId]) {
      acc[breedingId] = [];
    }
    acc[breedingId].push(anakan);
    return acc;
  }, {});
};
