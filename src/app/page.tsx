"use client";

import { Store, LogIn, UserPlus, Printer, ChevronDown, Globe } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoText}>PrintSmaart.in</span>
        </div>
        <div className={styles.navActions}>
          <button className={`${styles.langSelector} glass-card`}>
            <Globe size={16} />
            <span>₹ English</span>
            <ChevronDown size={14} />
          </button>
          <button className={`${styles.signInButton} primary-button`}>
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Smart Printing.<br />
            <span>Simplified.</span>
          </h1>
          <p className={styles.subtitle}>Scan. Upload. Print. Done.</p>
        </div>

        {/* Central Take a Print Card */}
        <div className={`${styles.centralCard} glass-card`}>
          <div className={styles.iconWrapper}>
            <Store className={styles.centralIcon} size={40} />
          </div>
          <h2 className={styles.cardTitle}>Take a Print</h2>
          <p className={styles.cardSubtitle}>
            Scan Shop QR Code<br />
            to get started
          </p>
        </div>

        {/* Shopkeeper Section */}
        <div className={styles.shopkeeperSection}>
          <div className={styles.divider}>
            <span>Are you a Shopkeeper?</span>
          </div>
          
          <div className={styles.shopkeeperCards}>
            <div className={`${styles.actionCard} glass-card`}>
              <div className={styles.actionIconBg}>
                <UserPlus size={24} color="#5d5dff" />
              </div>
              <div className={styles.actionText}>
                <h3>Register as Shopkeeper</h3>
                <p>Create your shop account</p>
              </div>
            </div>

            <div className={`${styles.actionCard} glass-card`}>
              <div className={styles.actionIconBg}>
                <LogIn size={24} color="#5d5dff" />
              </div>
              <div className={styles.actionText}>
                <h3>Login as Shopkeeper</h3>
                <p>Access your dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
