'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Copy, FileText, Download, Printer, RotateCcw, AlertTriangle } from 'lucide-react'
import { getProfile, getContact, getLoggedInShopkeeper } from '../../onboarding/_components/onboardingStorage'

interface ProductItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  discount: number
  taxPercent: number
}

interface BillFormState {
  shopName: string
  address: string
  gstNumber: string
  phone: string
  email: string
  logo: string
  customerName: string
  customerPhone: string
  customerAddress: string
  invoiceNumber: string
  date: string
  time: string
  products: ProductItem[]
  paymentMethod: string
  notes: string
  showShopkeeperSignature: boolean
  showCustomerSignature: boolean
  template: 'classic' | 'modern' | 'thermal'
}

const DEFAULT_STATE: BillFormState = {
  shopName: '',
  address: '',
  gstNumber: '',
  phone: '',
  email: '',
  logo: '',
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  invoiceNumber: '',
  date: '',
  time: '',
  products: [{ id: '1', name: '', quantity: 1, unitPrice: 0, discount: 0, taxPercent: 0 }],
  paymentMethod: 'Cash',
  notes: 'Thank you for visiting. Goods once sold cannot be returned.',
  showShopkeeperSignature: true,
  showCustomerSignature: false,
  template: 'classic'
}

interface CustomBillModalProps {
  isOpen: boolean
  onClose: () => void
}

// Indian Rupee number to words conversion helper
function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only'

  const parts = num.toFixed(2).split('.')
  const rupees = parseInt(parts[0], 10)
  const paise = parseInt(parts[1], 10)

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function convertHelper(n: number): string {
    if (n < 20) return units[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '')
    if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertHelper(n % 100) : '')
    return ''
  }

  function convertRupees(val: number): string {
    let words = ''
    if (val >= 10000000) {
      words += convertRupees(Math.floor(val / 10000000)) + ' Crore '
      val %= 10000000;
    }
    if (val >= 100000) {
      words += convertHelper(Math.floor(val / 100000)) + ' Lakh '
      val %= 100000;
    }
    if (val >= 1000) {
      words += convertHelper(Math.floor(val / 1000)) + ' Thousand '
      val %= 1000;
    }
    if (val > 0) {
      words += convertHelper(val)
    }
    return words.trim()
  }

  let result = convertRupees(rupees) + ' Rupees'
  if (paise > 0) {
    result += ' and ' + convertHelper(paise) + ' Paise'
  }
  result += ' Only'
  return result.replace(/\s+/g, ' ')
}

export default function CustomBillModal({ isOpen, onClose }: CustomBillModalProps) {
  const [form, setForm] = useState<BillFormState>(DEFAULT_STATE)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Generate unique invoice number
  const generateInvoiceNumber = () => {
    return 'INV-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900)
  }

  // Load profile settings & local storage draft on mount
  useEffect(() => {
    if (!isOpen) return

    const draft = localStorage.getItem('printsmart_walkin_bill_draft')
    const savedTemplate = localStorage.getItem('printsmart_walkin_bill_template') as BillFormState['template'] | null

    const profile = getProfile()
    const contact = getContact()
    const shop = getLoggedInShopkeeper()

    const now = new Date()
    const defaultDate = now.toISOString().split('T')[0]
    const defaultTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

    if (draft) {
      try {
        const parsed = JSON.parse(draft) as BillFormState
        setForm({
          ...parsed,
          template: savedTemplate || parsed.template || 'classic',
          // Always ensure valid Date/Time and Invoice Number
          date: parsed.date || defaultDate,
          time: parsed.time || defaultTime,
          invoiceNumber: parsed.invoiceNumber || generateInvoiceNumber()
        })
      } catch (e) {
        initializePrefill(profile, contact, shop, defaultDate, defaultTime, savedTemplate)
      }
    } else {
      initializePrefill(profile, contact, shop, defaultDate, defaultTime, savedTemplate)
    }
  }, [isOpen])

  const initializePrefill = (
    profile: any,
    contact: any,
    shop: any,
    defaultDate: string,
    defaultTime: string,
    savedTemplate: BillFormState['template'] | null
  ) => {
    setForm({
      ...DEFAULT_STATE,
      shopName: profile.shopName || shop?.shopName || '',
      address: contact.shopAddress || '',
      gstNumber: profile.gstNumber || '',
      phone: contact.phoneNumber || shop?.phone || '',
      email: contact.emailAddress || shop?.email || '',
      logo: profile.logoDataUrl || '',
      invoiceNumber: generateInvoiceNumber(),
      date: defaultDate,
      time: defaultTime,
      template: savedTemplate || 'classic'
    })
  }

  // Auto-save changes to localStorage
  useEffect(() => {
    if (!isOpen) return
    localStorage.setItem('printsmart_walkin_bill_draft', JSON.stringify(form))
    localStorage.setItem('printsmart_walkin_bill_template', form.template)
  }, [form, isOpen])

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      // Ctrl + P -> Print
      if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        handlePrint()
      }
      // Ctrl + S -> Download PDF
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        handleDownload()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, form])

  // Form value updater
  const updateField = (key: keyof BillFormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[key]
        return copy
      })
    }
  }

  // Logo file handling
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateField('logo', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Product manipulation
  const addProduct = () => {
    const newProduct: ProductItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxPercent: 0
    }
    setForm((prev) => ({
      ...prev,
      products: [...prev.products, newProduct]
    }))
  }

  const updateProduct = (index: number, key: keyof ProductItem, value: any) => {
    setForm((prev) => {
      const list = [...prev.products]
      list[index] = { ...list[index], [key]: value }
      return { ...prev, products: list }
    })
    if (errors.products) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy.products
        return copy
      })
    }
  }

  const removeProduct = (index: number) => {
    if (form.products.length <= 1) return
    setForm((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }))
  }

  const duplicateProduct = (index: number) => {
    const source = form.products[index]
    const duplicated: ProductItem = {
      ...source,
      id: Date.now().toString() + '-' + Math.random().toString().slice(2, 5)
    }
    setForm((prev) => {
      const list = [...prev.products]
      list.splice(index + 1, 0, duplicated)
      return { ...prev, products: list }
    })
  }

  // Calculation summaries
  const calculateRowTotal = (item: ProductItem) => {
    const gross = item.quantity * item.unitPrice
    const afterDiscount = gross - item.discount
    const tax = afterDiscount * (item.taxPercent / 100)
    return Math.max(0, afterDiscount + tax)
  }

  const subtotal = form.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0)
  const totalDiscount = form.products.reduce((acc, p) => acc + p.discount, 0)
  const totalTax = form.products.reduce((acc, p) => {
    const gross = p.quantity * p.unitPrice
    const afterDiscount = gross - p.discount
    return acc + (afterDiscount * (p.taxPercent / 100))
  }, 0)

  const rawGrandTotal = Math.max(0, subtotal - totalDiscount + totalTax)
  const grandTotal = Math.round(rawGrandTotal)
  const roundOff = grandTotal - rawGrandTotal

  // Form Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!form.shopName.trim()) newErrors.shopName = 'Shop Name is required.'
    if (!form.customerName.trim()) newErrors.customerName = 'Customer Name is required.'

    const hasItems = form.products.some(p => p.name.trim() !== '')
    if (!hasItems) newErrors.products = 'At least one product with a name is required.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Reset form
  const handleReset = () => {
    const profile = getProfile()
    const contact = getContact()
    const shop = getLoggedInShopkeeper()
    const now = new Date()
    const defaultDate = now.toISOString().split('T')[0]
    const defaultTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

    localStorage.removeItem('printsmart_walkin_bill_draft')
    initializePrefill(profile, contact, shop, defaultDate, defaultTime, form.template)
    setErrors({})
    setShowResetConfirm(false)
  }

  // Shared print compiler
  const compilePrintHtml = () => {
    const currencyStr = 'Rs.'
    const totalInWords = numberToWords(grandTotal)

    let templateStyles = ''
    if (form.template === 'classic') {
      templateStyles = `
        .standee {
          border: 4px double #000000;
          padding: 24px;
          color: #000000;
        }
        .header-title {
          font-size: 28px;
          font-weight: 800;
          text-transform: uppercase;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          border-bottom: 1px solid #000;
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      `
    } else if (form.template === 'modern') {
      templateStyles = `
        .standee {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          color: #1e293b;
        }
        .header-title {
          font-size: 32px;
          font-weight: 900;
          color: #3b82f6;
          margin-bottom: 20px;
        }
        .details-grid {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border-bottom: 1px solid #e2e8f0;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f1f5f9;
          font-weight: 700;
          color: #475569;
        }
      `
    } else {
      // Thermal 80mm
      templateStyles = `
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          width: 76mm;
          margin: 2mm auto;
          font-size: 11px;
          font-family: 'Courier New', Courier, monospace;
        }
        .standee {
          border: 1px dashed #000;
          padding: 10px;
        }
        .header-title {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 8px;
        }
        .details-grid {
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 4px 2px;
          font-size: 10px;
          border-bottom: 1px dashed #ccc;
        }
        th {
          border-bottom: 1px solid #000;
          font-weight: bold;
        }
      `
    }

    return `
      <html>
        <head>
          <title>${form.invoiceNumber}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
              background-color: #ffffff;
            }
            ${templateStyles}
            .shop-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .logo-preview {
              max-width: 80px;
              max-height: 80px;
              object-fit: contain;
            }
            .summary-box {
              margin-left: auto;
              width: 300px;
              margin-top: 20px;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              font-size: 14px;
            }
            .summary-total {
              font-size: 16px;
              font-weight: bold;
              border-top: 1px solid #000;
              padding-top: 8px;
              margin-top: 8px;
            }
            .words {
              font-style: italic;
              font-size: 12px;
              margin-top: 12px;
              color: #4b5563;
              border-bottom: 1px solid #eee;
              padding-bottom: 8px;
            }
            .notes {
              margin-top: 20px;
              font-size: 12px;
              color: #4b5563;
              white-space: pre-wrap;
            }
            .signature-block {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 150px;
              text-align: center;
              font-size: 12px;
              padding-top: 4px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="standee">
            <div class="shop-header">
              <div>
                <div class="header-title">${form.shopName}</div>
                <div style="font-size: 13px;">${form.address}</div>
                <div style="font-size: 13px;">Phone: ${form.phone} | Email: ${form.email}</div>
                ${form.gstNumber ? `<div style="font-size: 13px; font-weight: bold; margin-top: 4px;">GST: ${form.gstNumber}</div>` : ''}
              </div>
              ${form.logo ? `<img src="${form.logo}" class="logo-preview" />` : ''}
            </div>

            <div class="details-grid">
              <div>
                <strong>Customer Info:</strong>
                <div>Name: ${form.customerName}</div>
                <div>Phone: ${form.customerPhone}</div>
                ${form.customerAddress ? `<div>Address: ${form.customerAddress}</div>` : ''}
              </div>
              <div style="text-align: right;">
                <strong>Invoice Info:</strong>
                <div>Invoice No: ${form.invoiceNumber}</div>
                <div>Date: ${form.date}</div>
                <div>Time: ${form.time}</div>
                <div>Payment: <strong>${form.paymentMethod}</strong></div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Disc</th>
                  <th style="text-align: right;">Tax %</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${form.products.map(p => `
                  <tr>
                    <td>${p.name || 'Untitled Item'}</td>
                    <td style="text-align: center;">${p.quantity}</td>
                    <td style="text-align: right;">${currencyStr} ${p.unitPrice.toFixed(2)}</td>
                    <td style="text-align: right;">${currencyStr} ${p.discount.toFixed(2)}</td>
                    <td style="text-align: right;">${p.taxPercent}%</td>
                    <td style="text-align: right;">${currencyStr} ${calculateRowTotal(p).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="summary-box">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${currencyStr} ${subtotal.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Discount:</span>
                <span>${currencyStr} ${totalDiscount.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Tax/GST:</span>
                <span>${currencyStr} ${totalTax.toFixed(2)}</span>
              </div>
              ${roundOff !== 0 ? `
                <div class="summary-row">
                  <span>Round Off:</span>
                  <span>${currencyStr} ${roundOff.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="summary-row summary-total">
                <span>Grand Total:</span>
                <span>${currencyStr} ${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div class="words">Amount in words: <strong>${totalInWords}</strong></div>

            ${form.notes ? `<div class="notes">Notes:\n${form.notes}</div>` : ''}

            <div class="signature-block">
              ${form.showCustomerSignature ? '<div class="signature-line">Customer Signature</div>' : '<div></div>'}
              ${form.showShopkeeperSignature ? '<div class="signature-line">Authorized Signatory</div>' : '<div></div>'}
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 1000);
              }, 500);
            };
          </script>
        </body>
      </html>
    `
  }

  // Trigger print logic
  const handlePrint = () => {
    if (!validateForm()) return
    const html = compilePrintHtml()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
    }
  }

  // Trigger download PDF logic
  const handleDownload = () => {
    if (!validateForm()) return
    handlePrint() // Reuses browser's save-to-pdf printing system
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-violet-600" size={20} />
              Custom Bill Generator
            </h3>
            <p className="text-xs text-slate-400 font-medium">Create and print walk-in customer invoices</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-650 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

          {/* Left Panel: Inputs */}
          <div className="lg:col-span-7 space-y-6">

            {/* Shop Details */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Business Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Shop Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={form.shopName}
                    onChange={(e) => updateField('shopName', e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${errors.shopName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-violet-400 bg-white'}`}
                  />
                  {errors.shopName && <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.shopName}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    value={form.gstNumber}
                    onChange={(e) => updateField('gstNumber', e.target.value)}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 bg-white px-3 py-2 text-sm outline-none resize-none"
                    rows={2}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Logo Upload (Optional)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-750 hover:file:bg-violet-100 file:cursor-pointer"
                    />
                    {form.logo && (
                      <button
                        onClick={() => updateField('logo', '')}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Customer Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Customer Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => updateField('customerName', e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${errors.customerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-violet-400 bg-white'}`}
                  />
                  {errors.customerName && <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={form.customerPhone}
                    onChange={(e) => updateField('customerPhone', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Address (Optional)</label>
                  <input
                    type="text"
                    value={form.customerAddress}
                    onChange={(e) => updateField('customerAddress', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bill Details */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Bill Metadata</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={form.invoiceNumber}
                    onChange={(e) => updateField('invoiceNumber', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Time</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) => updateField('time', e.target.value)}
                    placeholder="HH:MM"
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Products / Items</h4>
                <button
                  type="button"
                  onClick={addProduct}
                  className="inline-flex items-center gap-1 text-xs font-bold text-violet-750 bg-violet-50 hover:bg-violet-100 border border-violet-200/50 px-2.5 py-1.5 rounded-xl transition"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>

              {errors.products && <p className="text-xs text-rose-500 font-semibold">{errors.products}</p>}

              <div className="space-y-3">
                {form.products.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3 rounded-xl border border-slate-150 relative">
                    <div className="sm:col-span-4 col-span-12">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Item Name</label>
                      <input
                        type="text"
                        value={item.name}
                        placeholder="e.g. Color Xerox Printout"
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        className="w-full border-b border-slate-200 focus:border-violet-400 pb-1 text-xs outline-none font-semibold text-slate-700"
                      />
                    </div>
                    <div className="sm:col-span-1 col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 0))}
                        className="w-full border-b border-slate-200 focus:border-violet-400 pb-1 text-xs outline-none font-bold text-slate-700 text-center"
                      />
                    </div>
                    <div className="sm:col-span-2 col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Unit Price</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice || ''}
                        onChange={(e) => updateProduct(index, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full border-b border-slate-200 focus:border-violet-400 pb-1 text-xs outline-none font-bold text-slate-700 text-right"
                      />
                    </div>
                    <div className="sm:col-span-2 col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Disc</label>
                      <input
                        type="number"
                        min="0"
                        value={item.discount || ''}
                        onChange={(e) => updateProduct(index, 'discount', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full border-b border-slate-200 focus:border-violet-400 pb-1 text-xs outline-none font-bold text-slate-700 text-right"
                      />
                    </div>
                    <div className="sm:col-span-1 col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Tax %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.taxPercent || ''}
                        onChange={(e) => updateProduct(index, 'taxPercent', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-full border-b border-slate-200 focus:border-violet-400 pb-1 text-xs outline-none font-bold text-slate-700 text-right"
                      />
                    </div>
                    <div className="sm:col-span-2 col-span-12 text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Total</span>
                      <span className="text-xs font-bold text-slate-900 block pt-1">₹{calculateRowTotal(item).toFixed(2)}</span>
                    </div>

                    {/* Row operations */}
                    <div className="col-span-12 flex justify-end gap-2 pt-1 border-t border-slate-50 mt-1">
                      <button
                        type="button"
                        onClick={() => duplicateProduct(index)}
                        className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-violet-600 transition"
                        title="Duplicate Row"
                      >
                        <Copy size={12} /> Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        disabled={form.products.length <= 1}
                        className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-600 disabled:opacity-30 transition"
                        title="Delete Row"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Payment & Summaries</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => updateField('paymentMethod', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 bg-white px-3 py-2 text-sm outline-none font-semibold text-slate-700"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Terms / Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 bg-white px-3 py-2 text-sm outline-none resize-none"
                    rows={2}
                  />
                </div>
                <div className="sm:col-span-2 border-t border-slate-100 pt-3 grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.showShopkeeperSignature}
                      onChange={(e) => updateField('showShopkeeperSignature', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-400"
                    />
                    <span className="text-xs font-semibold text-slate-600">Show Shopkeeper Signature</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.showCustomerSignature}
                      onChange={(e) => updateField('showCustomerSignature', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-400"
                    />
                    <span className="text-xs font-semibold text-slate-600">Show Customer Signature</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Diagnostic / Danger Zone Reset */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 px-4 py-2.5 rounded-2xl transition"
              >
                <RotateCcw size={14} /> Reset Form
              </button>
            </div>

          </div>

          {/* Right Panel: Live Preview */}
          <div className="lg:col-span-5 flex flex-col h-full lg:sticky lg:top-0">
            <div className="bg-slate-100 rounded-3xl p-4 border border-slate-200/60 flex-1 flex flex-col min-h-[480px]">

              {/* Template Picker */}
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 block uppercase mb-2 text-center">Receipt Templates</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['classic', 'modern', 'thermal'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateField('template', t)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition capitalize ${form.template === t
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Live Preview Box */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 pb-12 overflow-y-auto max-h-[580px] shadow-inner relative select-none">

                {/* Logo or Placeholder */}
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="font-bold text-slate-900 text-base leading-snug">{form.shopName || 'Shop Name'}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] truncate">{form.address || 'Address Line'}</p>
                    <p className="text-[10px] text-slate-400">Phone: {form.phone || '—'}</p>
                    {form.gstNumber && <p className="text-[10px] font-bold text-violet-700 mt-0.5">GST: {form.gstNumber}</p>}
                  </div>
                  {form.logo ? (
                    <img src={form.logo} className="w-12 h-12 object-contain rounded-lg border border-slate-100" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-300 font-bold">Logo</div>
                  )}
                </div>

                {/* Customer and Date Row */}
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 mb-4">
                  <div>
                    <span className="text-slate-400 font-bold block">Bill To:</span>
                    <span className="text-slate-800 font-extrabold block">{form.customerName || 'Customer Name'}</span>
                    <span className="text-slate-500 block">{form.customerPhone || '—'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-bold block">Invoice No:</span>
                    <span className="text-slate-800 font-mono font-extrabold block">{form.invoiceNumber || 'INV-XXXXXX'}</span>
                    <span className="text-slate-500 block">{form.date} {form.time}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="border-b border-slate-100 pb-3">
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-1 text-left">Item</th>
                        <th className="pb-1 text-center w-12">Qty</th>
                        <th className="pb-1 text-right w-16">Price</th>
                        <th className="pb-1 text-right w-16">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {form.products.map((p) => (
                        <tr key={p.id} className="text-slate-700 font-semibold">
                          <td className="py-2 truncate max-w-[120px]" title={p.name || 'Untitled Product'}>
                            {p.name || 'Untitled Product'}
                          </td>
                          <td className="py-2 text-center font-bold">{p.quantity}</td>
                          <td className="py-2 text-right">₹{p.unitPrice.toFixed(2)}</td>
                          <td className="py-2 text-right font-bold">₹{calculateRowTotal(p).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Math Summary Box */}
                <div className="w-[180px] ml-auto mt-4 space-y-1.5 text-[10px] text-slate-600 font-semibold border-b border-slate-100 pb-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="text-rose-600">-₹{totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST/Tax:</span>
                    <span>₹{totalTax.toFixed(2)}</span>
                  </div>
                  {roundOff !== 0 && (
                    <div className="flex justify-between">
                      <span>Round Off:</span>
                      <span>₹{roundOff.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold text-slate-900 border-t border-slate-100 pt-1.5 mt-1.5">
                    <span>Grand Total:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Amount in words */}
                <div className="mt-3 text-[9px] text-slate-400 italic font-semibold leading-relaxed border-b border-slate-100 pb-2">
                  Amount in words: <span className="text-slate-600 font-bold block mt-0.5">{numberToWords(grandTotal)}</span>
                </div>

                {/* Terms and notes */}
                {form.notes && (
                  <div className="mt-3 text-[9px] text-slate-400 font-medium">
                    <span className="font-bold text-slate-500 block uppercase mb-0.5">Notes</span>
                    <span className="block whitespace-pre-wrap">{form.notes}</span>
                  </div>
                )}

                {/* Signature box */}
                <div className="mt-6 flex justify-between text-[9px] font-bold text-slate-400">
                  {form.showCustomerSignature ? (
                    <div className="border-t border-dashed border-slate-200 pt-1 w-24 text-center mt-4">Customer Sig</div>
                  ) : (
                    <div />
                  )}
                  {form.showShopkeeperSignature ? (
                    <div className="border-t border-dashed border-slate-200 pt-1 w-28 text-center mt-4">Authorized Sig</div>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Live Badge */}
                <span className="absolute bottom-2 right-2 bg-emerald-50 text-emerald-700 text-[8px] font-black border border-emerald-200 px-1.5 py-0.5 rounded-full tracking-wider uppercase">✨ LIVE PREVIEW</span>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-3 px-4 rounded-2xl bg-violet-650 hover:bg-violet-750 text-black font-bold text-sm shadow-md transition flex items-center justify-center gap-2 hover:scale-[1.01]"

                >
                  <Printer size={16} /> Print (Ctrl+P)
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <Download size={16} /> Save PDF (Ctrl+S)
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Dialogs */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600 mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Confirm Reset</h3>
            <p className="text-xs text-slate-500 mt-2">Are you sure you want to clear all walk-in bill inputs? This will reset all current product items and customer details.</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
              >
                Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-750 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
