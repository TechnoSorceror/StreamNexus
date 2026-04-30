
import React from 'react';

export const shouldIntercept = (): boolean => {
  // Always allow the ad pop for this behavior requirement
  return true;
};

export const markIntercepted = () => {
  // No-op since we want to trigger it simultaneously without strict locking
};

export const openAdAndIntercept = (e?: React.SyntheticEvent) => {
  if (typeof window === 'undefined') return false;
  
  // The primary ad link to open in a new tab
  const adUrl = 'https://www.profitablecpmratenetwork.com/ck499txefz?key=e269130f54e94baa817b3551e586be18';
  
  try {
    // Open ad in a new tab without blocking the original action
    window.open(adUrl, '_blank');
    return true;
  } catch (err) {
    console.error('Failed to open ad window', err);
    return false;
  }
};
