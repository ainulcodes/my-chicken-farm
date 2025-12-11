import React from 'react';
import { Badge } from '../ui/badge';

/**
 * Status Badge Component
 * Standardized status badges with icons and colors
 */

// Configuration for different status types
const STATUS_CONFIG = {
  age: {
    young: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-400',
      icon: '🐣'
    },
    ready: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-400',
      icon: '✅'
    },
    mature: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-400',
      icon: '🔥'
    }
  },
  health: {
    'Sehat': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-400',
      icon: '✅'
    },
    'Sakit': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-400',
      icon: '🤒'
    },
    'Dijual': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-400',
      icon: '💰'
    },
    'Mati': {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-400',
      icon: '💀'
    }
  },
  breeding: {
    active: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-400',
      icon: '🥚'
    },
    ready: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-400',
      icon: '✅'
    }
  },
  gender: {
    'Jantan': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-400',
      icon: '♂'
    },
    'Betina': {
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      border: 'border-pink-400',
      icon: '♀'
    }
  }
};

/**
 * StatusBadge Component
 * @param {string} type - Type of status: 'age', 'health', 'breeding', 'gender'
 * @param {string} value - Status value (e.g., 'young', 'Sehat', 'active', 'Jantan')
 * @param {string} label - Custom label to display (optional, defaults to value)
 * @param {boolean} showIcon - Whether to show icon (default: true)
 * @param {string} size - Size: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} className - Additional classes
 */
const StatusBadge = ({
  type,
  value,
  label,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  // Get configuration
  const config = STATUS_CONFIG[type]?.[value];

  // Fallback if config not found
  if (!config) {
    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        {label || value}
      </Badge>
    );
  }

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge
      className={`
        ${config.bg}
        ${config.text}
        ${sizeClasses[size]}
        font-medium
        ${className}
      `}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {label || value}
    </Badge>
  );
};

export default StatusBadge;

/**
 * Specialized Age Badge
 * @param {string|Date} birthDate - Birth date to calculate age from
 * @param {string} ageText - Formatted age text (e.g., "3 bulan")
 */
export const AgeBadge = ({ birthDate, ageText, maturityStatus }) => {
  return (
    <StatusBadge
      type="age"
      value={maturityStatus.status}
      label={`${ageText} • ${maturityStatus.label}`}
      size="sm"
    />
  );
};

/**
 * Specialized Health Badge
 * @param {string} status - Health status
 */
export const HealthBadge = ({ status }) => {
  return (
    <StatusBadge
      type="health"
      value={status}
      size="sm"
    />
  );
};

/**
 * Specialized Gender Badge
 * @param {string} gender - Gender ('Jantan' or 'Betina')
 */
export const GenderBadge = ({ gender }) => {
  return (
    <StatusBadge
      type="gender"
      value={gender}
      size="sm"
    />
  );
};

/**
 * Specialized Breeding Status Badge
 * @param {boolean} isActive - Whether currently breeding
 */
export const BreedingStatusBadge = ({ isActive }) => {
  return (
    <StatusBadge
      type="breeding"
      value={isActive ? 'active' : 'ready'}
      label={isActive ? 'Sedang Breeding' : 'Siap Kawin'}
      size="sm"
    />
  );
};
