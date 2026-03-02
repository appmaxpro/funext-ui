import React from 'react'

import {Icons, type IconComponent} from '~/components/other/icons';

const {
  AccessAlarm,
  AccountCircle,
  Person,
  AutoStories,
  CameraAlt,
  CloudQueue,
  Favorite,
  GpsFixed,
  Home,
  Lightbulb,
  Mail,
  People,
  Settings,
  ShoppingCart,
  Star,
  ThumbUpAlt,
} = Icons

const allIcons = [
  AccessAlarm,
  AccountCircle,
  Person,
  AutoStories,
  CameraAlt,
  CloudQueue,
  Favorite,
  GpsFixed,
  Home,
  Lightbulb,
  Mail,
  People,
  Settings,
  ShoppingCart,
  Star,
  ThumbUpAlt,
]

/**
 * Helper function to shuffle an array.
 * @param array The array to shuffle.
 * @returns A new shuffled array.
 */
const shuffleArray = <T extends unknown>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

/**
 * Generates the three required lists of 10 randomly selected icons.
 */
export {
  allIcons
}

// Export the IconComponent type for use in other files
export type { IconComponent }