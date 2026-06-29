import { useState, useCallback } from 'react';
import { getShopQRValue } from '../utils/generateQRCode';
import { downloadPosterAsPDF, printPoster } from '../services/posterService';

export interface PosterData {
  shopName: string;
  shopId: string;
  qrValue: string;
}

export const usePoster = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posterData, setPosterData] = useState<PosterData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /**
   * Loads the poster data either from custom provided data, localStorage, or direct API fetch.
   */
  const loadPosterData = useCallback(async (customShopData?: { shopName: string; shopId: string }): Promise<PosterData | null> => {
    setLoading(true);
    setError(null);
    try {
      let name = '';
      let id = '';

      if (customShopData) {
        name = customShopData.shopName;
        id = customShopData.shopId;
      } else {
        // Try to load from localStorage Cache first
        const loggedIn = localStorage.getItem('loggedInShopkeeper') || localStorage.getItem('shopkeeper');
        if (loggedIn) {
          const shop = JSON.parse(loggedIn);
          name = shop.shopName || '';
          id = shop.shopkeeperIdCode || shop.shopSlug || shop.slug || '';
        }
      }

      // If data is still missing, fetch fresh data from API
      if (!name || !id) {
        const token = localStorage.getItem('authToken');
        if (token) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com';
          const response = await fetch(`${apiUrl}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const dbShopkeeper = await response.json();
            name = dbShopkeeper.shopName || '';
            id = dbShopkeeper.shopkeeperIdCode || dbShopkeeper.shopSlug || dbShopkeeper.slug || '';
          }
        }
      }

      if (!name || !id) {
        throw new Error('Incomplete shop profile. Shop Name and Shop ID are required to generate the poster.');
      }

      const qrValue = getShopQRValue(id);
      const data: PosterData = { shopName: name, shopId: id, qrValue };
      setPosterData(data);
      return data;
    } catch (err: any) {
      console.error('Failed to load poster details:', err);
      setError(err.message || 'Failed to load shop profile data.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Triggers the A4 PDF generation and download flow.
   */
  const downloadPDF = useCallback(async (targetId: string, shopId: string) => {
    setLoading(true);
    try {
      const success = await downloadPosterAsPDF(targetId, shopId);
      if (!success) {
        setError('Failed to generate and download PDF poster.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during PDF generation.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Triggers the print layout and opens print dialog.
   */
  const print = useCallback(async (targetId: string) => {
    setLoading(true);
    try {
      const success = await printPoster(targetId);
      if (!success) {
        setError('Failed to prepare poster for printing.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during print preparation.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load poster details and open the preview modal.
   */
  const openPreview = useCallback(async (customShopData?: { shopName: string; shopId: string }) => {
    const data = await loadPosterData(customShopData);
    if (data) {
      setIsPreviewOpen(true);
    }
  }, [loadPosterData]);

  /**
   * Close the preview modal.
   */
  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  return {
    loading,
    error,
    posterData,
    isPreviewOpen,
    loadPosterData,
    downloadPDF,
    print,
    openPreview,
    closePreview,
  };
};
