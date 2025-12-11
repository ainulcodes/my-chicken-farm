import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

/**
 * Workflow Action Card Component
 * Reusable card for workflow sections with consistent styling
 */

/**
 * WorkflowActionCard Component
 * @param {string} title - Section title
 * @param {string} subtitle - Section subtitle (optional)
 * @param {string} icon - Emoji icon for the section
 * @param {Array|number} items - Items to display or count
 * @param {string} emptyMessage - Message when no items (default: "Tidak ada data")
 * @param {string} colorScheme - Color scheme: 'yellow', 'green', 'blue', 'purple' (default: 'blue')
 * @param {React.ReactNode} children - Content to render
 * @param {string} className - Additional classes
 */
const WorkflowActionCard = ({
  title,
  subtitle,
  icon,
  items = [],
  emptyMessage = 'Tidak ada data',
  colorScheme = 'blue',
  children,
  className = ''
}) => {
  // Handle items as array or number
  const itemCount = Array.isArray(items) ? items.length : items;
  const hasItems = itemCount > 0;

  // Color scheme mapping
  const colorClasses = {
    yellow: {
      border: 'border-l-yellow-500',
      bg: 'bg-yellow-50',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    green: {
      border: 'border-l-green-500',
      bg: 'bg-green-50',
      badge: 'bg-green-100 text-green-800'
    },
    blue: {
      border: 'border-l-blue-500',
      bg: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-800'
    },
    purple: {
      border: 'border-l-purple-500',
      bg: 'bg-purple-50',
      badge: 'bg-purple-100 text-purple-800'
    },
    pink: {
      border: 'border-l-pink-500',
      bg: 'bg-pink-50',
      badge: 'bg-pink-100 text-pink-800'
    }
  };

  const colors = colorClasses[colorScheme] || colorClasses.blue;

  return (
    <Card className={`border-l-4 ${colors.border} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <div>
              <CardTitle className="text-lg font-bold">
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <Badge className={`${colors.badge} font-semibold`}>
            {itemCount} item
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {!hasItems ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowActionCard;

/**
 * WorkflowSection Component
 * A section with multiple workflow action cards
 * @param {string} title - Section title
 * @param {React.ReactNode} children - Workflow cards
 * @param {string} className - Additional classes
 */
export const WorkflowSection = ({ title, children, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

/**
 * StatCard Component
 * Small summary stat card for dashboard
 * @param {string} icon - Emoji icon
 * @param {string} label - Stat label
 * @param {number} value - Stat value
 * @param {string} colorScheme - Color scheme
 */
export const StatCard = ({ icon, label, value, colorScheme = 'blue' }) => {
  const colorClasses = {
    yellow: 'from-yellow-500 to-amber-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600'
  };

  const gradientClass = colorClasses[colorScheme] || colorClasses.blue;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${gradientClass} rounded-xl flex items-center justify-center text-3xl shadow-md`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
