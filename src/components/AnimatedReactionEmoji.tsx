import React from 'react';
import { ConfusedFaceEmoji } from './ConfusedFaceEmoji';

interface AnimatedReactionEmojiProps {
  category?: string | null;
  isMatch?: boolean;
  isWelcome?: boolean;
  error?: string | null;
  className?: string;
}

/**
 * AnimatedReactionEmoji - Multi-Signal Category & Intent Emoji Reaction
 * Features individual physical micro-interactions customized for each intent:
 * - 🔐 Security / Password: Pop-in, upward movement, bounce, rotation, settle
 * - 👤 Profile: Gentle pop-in, head bounce, subtle side shift, settle
 * - 💳 Payment / Subscription: Slide-in, bounce, slight tilt, settle
 * - 📦 Order: Delivery upward float, landing bounce, subtle tilt, settle
 * - 🔔 Notification: Realistic pendulum bell ring (Left -> Right -> Left -> Center)
 * - 🛠️ Technical Support: Tool rotation, tiny bounce, return to rest
 * - 🛡️ Privacy: Gentle scale-up, protective pulse, downward settle
 * - ⚙️ Settings / Account: Smooth 360° gear rotation with natural deceleration
 * - 💡 General Support / Info: Fade-in, scale-up, upward float with idea glow
 * - ✨ Welcome / Positive: Sparkle burst, rotation, pulse, settle
 * - 🎉 Success / Default Match: Joyful pop-in, overshoot bounce, rotation, settle
 * - 🚨 Error: Controlled scale pulse with rapid left/right shake
 * - 😕 No Match: Custom multi-layer SVG with visible independent eye tracking (Left -> Right -> Center)
 */
export const AnimatedReactionEmoji: React.FC<AnimatedReactionEmojiProps> = ({
  category,
  isMatch,
  isWelcome,
  error,
  className = ''
}) => {
  // 1. System Error state
  if (error) {
    return (
      <span
        className={`emoji-reaction-error inline-block select-none ${className}`}
        role="img"
        aria-label="System Alert"
      >
        🚨
      </span>
    );
  }

  // 2. Welcome message state
  if (isWelcome) {
    return (
      <span
        className={`emoji-reaction-sparkle inline-block select-none ${className}`}
        role="img"
        aria-label="Welcome Sparkle"
      >
        ✨
      </span>
    );
  }

  // 3. No reliable match state - uses custom multi-layer SVG with real eye movement
  if (isMatch === false) {
    return <ConfusedFaceEmoji className={className} />;
  }

  // 4. Categorized match reactions
  const cat = (category || '').toLowerCase();

  // Login & Security / Passwords / 2FA
  if (cat.includes('login') || cat.includes('security') || cat.includes('password') || cat.includes('auth')) {
    return (
      <span
        className={`emoji-reaction-lock inline-block select-none ${className}`}
        role="img"
        aria-label="Security & Authentication"
      >
        🔐
      </span>
    );
  }

  // Profile / Avatar / Identity
  if (cat.includes('profile')) {
    return (
      <span
        className={`emoji-reaction-profile inline-block select-none ${className}`}
        role="img"
        aria-label="User Profile"
      >
        👤
      </span>
    );
  }

  // Billing & Payments / Subscription / Invoices
  if (cat.includes('billing') || cat.includes('payment') || cat.includes('subscription')) {
    return (
      <span
        className={`emoji-reaction-payment inline-block select-none ${className}`}
        role="img"
        aria-label="Billing & Payments"
      >
        💳
      </span>
    );
  }

  // Orders / Shipping / Fulfillment
  if (cat.includes('order') || cat.includes('shipping') || cat.includes('delivery')) {
    return (
      <span
        className={`emoji-reaction-order inline-block select-none ${className}`}
        role="img"
        aria-label="Orders & Shipping"
      >
        📦
      </span>
    );
  }

  // Notifications / Alerts
  if (cat.includes('notification') || cat.includes('alert')) {
    return (
      <span
        className={`emoji-reaction-bell inline-block select-none ${className}`}
        role="img"
        aria-label="Notifications"
      >
        🔔
      </span>
    );
  }

  // Technical Support / Bug Report / Developer API
  if (cat.includes('technical') || (cat.includes('support') && !cat.includes('general'))) {
    return (
      <span
        className={`emoji-reaction-tools inline-block select-none ${className}`}
        role="img"
        aria-label="Technical Support"
      >
        🛠️
      </span>
    );
  }

  // Privacy / GDPR / Data Protection
  if (cat.includes('privacy') || cat.includes('data')) {
    return (
      <span
        className={`emoji-reaction-shield inline-block select-none ${className}`}
        role="img"
        aria-label="Privacy & Security"
      >
        🛡️
      </span>
    );
  }

  // Account Settings / Organization Management
  if (cat.includes('account')) {
    return (
      <span
        className={`emoji-reaction-gear inline-block select-none ${className}`}
        role="img"
        aria-label="Account Settings"
      >
        ⚙️
      </span>
    );
  }

  // General Support / Product Knowledge / Idea
  if (cat.includes('general') || cat.includes('info')) {
    return (
      <span
        className={`emoji-reaction-bulb inline-block select-none ${className}`}
        role="img"
        aria-label="General Information"
      >
        💡
      </span>
    );
  }

  // Default fallback for matched answers
  return (
    <span
      className={`emoji-reaction-success inline-block select-none ${className}`}
      role="img"
      aria-label="Verified Match"
    >
      🎉
    </span>
  );
};
