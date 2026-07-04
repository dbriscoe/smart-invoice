/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const DEFAULT_LOGO_URL = `${import.meta.env.BASE_URL}truffle-scent-logo.png`;

interface InvoiceItem {
    name: string;
    qty: number;
    price: number;
    image?: string;
}

interface Invoice {
    logo: string;
    signature: string;
    invoiceNumber: string;
    date: string;
    from: string;
    to: string;
    items: InvoiceItem[];
    notes: string;
    paymentMethod: string;
    currency: string;
    discount: number;
}

const defaultInvoice: Invoice = {
    logo: DEFAULT_LOGO_URL,
    signature: '',
    invoiceNumber: 'INV-T&SBLEE000',
    date: new Date().toISOString().split('T')[0],
    from: 'Truffle & Scent By Lee\nDTI BN No. 8301368\nTIN: 807-789-743-000\nPembo Taguig\nManila, Philippines\n+63956 533 1521',
    to: '',
    items: [{ name: 'Mazza Deluxe Black Truffle', qty: 1, price: 649, image: '' }],
    notes: 'Thank you for your business. Please pay within the day.',
    paymentMethod: 'BDO: 008010348061\nGCash: 0954 984 8144\nAileen Alvarez',
    currency: 'PHP',
    discount: 0
};


const ensureInvoiceDefaults = (input: Invoice): Invoice => {
    let updatedFrom = input.from || defaultInvoice.from;

    if (
        updatedFrom.includes('Truffle & Scent By Lee') &&
        !updatedFrom.includes('DTI BN No. 8301368')
    ) {
        updatedFrom = updatedFrom.replace(
            'Truffle & Scent By Lee',
            'Truffle & Scent By Lee\nDTI BN No. 8301368'
        );
    }

    if (
        updatedFrom.includes('DTI BN No. 8301368') &&
        !updatedFrom.includes('TIN: 807-789-743-000')
    ) {
        updatedFrom = updatedFrom.replace(
            'DTI BN No. 8301368',
            'DTI BN No. 8301368\nTIN: 807-789-743-000'
        );
    }

    return {
        ...defaultInvoice,
        ...input,
        logo: input.logo || defaultInvoice.logo,
        from: updatedFrom,
    };
};

const App = () => {
    const [invoice, setInvoice] = useState<Invoice>(() => {
        const savedInvoice = localStorage.getItem('currentInvoice');
        return savedInvoice ? ensureInvoiceDefaults(JSON.parse(savedInvoice)) : defaultInvoice;
    });
    const [savedInvoices, setSavedInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('savedInvoices');
        if (saved) {
            setSavedInvoices(JSON.parse(saved));
        }
    }, []);

    const saveCurrentInvoice = useCallback(() => {
        localStorage.setItem('currentInvoice', JSON.stringify(invoice));
    }, [invoice]);

    useEffect(() => {
        const timer = setTimeout(() => {
            saveCurrentInvoice();
        }, 1000);
        return () => clearTimeout(timer);
    }, [invoice, saveCurrentInvoice]);


    const handleInvoiceChange = (field: keyof Invoice, value: any) => {
        setInvoice(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...invoice.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setInvoice(prev => ({ ...prev, items: newItems }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'signature' | `item-${number}`, index?: number) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                if (field === 'logo' || field === 'signature') {
                    handleInvoiceChange(field, result);
                } else if (typeof index === 'number') {
                    const newItems = [...invoice.items];
                    newItems[index].image = result;
                    setInvoice(prev => ({ ...prev, items: newItems }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const addItem = () => {
        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, { name: '', qty: 1, price: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        const newItems = invoice.items.filter((_, i) => i !== index);
        setInvoice(prev => ({ ...prev, items: newItems }));
    };

    const calculateSubtotal = () => {
        return invoice.items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discountAmount = subtotal * (invoice.discount / 100);
        return subtotal - discountAmount;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: invoice.currency,
        }).format(amount);
    };

    const handleSaveInvoice = () => {
        const newSavedInvoices = [...savedInvoices, invoice];
        setSavedInvoices(newSavedInvoices);
        localStorage.setItem('savedInvoices', JSON.stringify(newSavedInvoices));
        alert('Invoice saved!');
    };

    const handleLoadInvoice = (invToLoad: Invoice) => {
        setInvoice(ensureInvoiceDefaults(invToLoad));
    };

    const handleDeleteInvoice = (invNumber: string) => {
        const newSaved = savedInvoices.filter(inv => inv.invoiceNumber !== invNumber);
        setSavedInvoices(newSaved);
        localStorage.setItem('savedInvoices', JSON.stringify(newSaved));
    }

    const downloadAsPdf = () => {
        const element = document.getElementById('invoice-box');
        if (!element) return;

        const elementToPrint = element.cloneNode(true) as HTMLElement;

        elementToPrint.querySelectorAll('textarea').forEach(textarea => {
            const div = document.createElement('div');
            div.textContent = textarea.value;

            const style = window.getComputedStyle(textarea);
            div.style.whiteSpace = 'pre-wrap';
            div.style.wordBreak = 'break-word';
            div.style.font = style.font;
            div.style.color = style.color;
            div.style.padding = style.padding;
            div.style.border = '1px solid transparent';
            div.style.minHeight = style.minHeight;
            div.style.lineHeight = style.lineHeight;

            textarea.parentNode!.replaceChild(div, textarea);
        });

        elementToPrint.style.position = 'absolute';
        elementToPrint.style.left = '-9999px';
        elementToPrint.style.width = '900px';
        elementToPrint.style.boxSizing = 'border-box';
        document.body.appendChild(elementToPrint);

        const filename = `invoice-${invoice.invoiceNumber}.pdf`;

        html2canvas(elementToPrint, {
            useCORS: true,
            scale: 2,
            scrollY: -window.scrollY,
            windowWidth: 900,
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 0.25;

            const contentWidth = pdfWidth - margin * 2;
            const contentHeight = pdfHeight - margin * 2;

            const imgAspectRatio = imgWidth / imgHeight;
            const contentAspectRatio = contentWidth / contentHeight;
            let finalImgWidth, finalImgHeight;

            if (imgAspectRatio > contentAspectRatio) {
                finalImgWidth = contentWidth;
                finalImgHeight = finalImgWidth / imgAspectRatio;
            } else {
                finalImgHeight = contentHeight;
                finalImgWidth = finalImgHeight * imgAspectRatio;
            }

            const x = margin + (contentWidth - finalImgWidth) / 2;
            const y = margin + (contentHeight - finalImgHeight) / 2;

            pdf.addImage(imgData, 'JPEG', x, y, finalImgWidth, finalImgHeight);
            pdf.save(filename);
        }).finally(() => {
            document.body.removeChild(elementToPrint);
        });
    };
    
    return (
        <div className="app-container">
            <h1>Smart Invoice Builder</h1>
            <div className="controls">
                <button onClick={handleSaveInvoice} className="button btn-primary">Save Invoice</button>
                <button onClick={downloadAsPdf} className="button btn-secondary">Download PDF</button>
                 <div className="currency-selector">
                    <label htmlFor="currency">Currency:</label>
                    <select id="currency" value={invoice.currency} onChange={(e) => handleInvoiceChange('currency', e.target.value)}>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="PHP">PHP</option>
                        <option value="JPY">JPY</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                    </select>
                </div>
            </div>

            <div id="invoice-box" className="invoice-box">
                <div className="invoice-header">
                    <div className="logo-container">
                        <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                            style={{ display: 'none' }}
                            aria-hidden="true"
                        />
                        {invoice.logo ? (
                            <img
                                src={invoice.logo}
                                alt="Company Logo"
                                onClick={() => document.getElementById('logo-upload')?.click()}
                                style={{ cursor: 'pointer' }}
                                role="button"
                                aria-label="Change company logo"
                            />
                        ) : (
                            <div
                                className="logo-uploader"
                                onClick={() => document.getElementById('logo-upload')?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('logo-upload')?.click() }}
                                aria-label="Upload company logo"
                            >
                                <span>Upload Logo</span>
                            </div>
                        )}
                    </div>
                    <div className="invoice-details">
                        <div className="invoice-title-block">
                            <h2>Official Invoice</h2>
                            <div className="tax-status">NON-VAT</div>
                        </div>
                        <div className="detail-item">
                            <label>Invoice #</label>
                            <input className="invoice-number-input" type="text" value={invoice.invoiceNumber} onChange={e => handleInvoiceChange('invoiceNumber', e.target.value)} style={{ width: `${Math.max(180, invoice.invoiceNumber.length * 9 + 28)}px` }} />
                        </div>
                        <div className="detail-item">
                            <label>Date</label>
                            <input className="invoice-date-input" type="date" value={invoice.date} onChange={e => handleInvoiceChange('date', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="address-section">
                    <div className="address-box">
                        <h3>From</h3>
                        <textarea value={invoice.from} onChange={e => handleInvoiceChange('from', e.target.value)} placeholder="Who is this invoice from?" />
                    </div>
                    <div className="address-box">
                        <h3>To</h3>
                        <textarea value={invoice.to} onChange={e => handleInvoiceChange('to', e.target.value)} placeholder="Who is this invoice to?" />
                    </div>
                </div>

                <table className="items-table">
                    <thead>
                        <tr>
                            <th className="item-image"></th>
                            <th className="item-name">Item</th>
                            <th className="item-qty">Qty</th>
                            <th className="item-price">Price</th>
                            <th className="item-total">Total</th>
                            <th className="item-action"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <input 
                                        type="file" 
                                        id={`item-image-upload-${index}`}
                                        style={{display: 'none'}}
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, `item-${index}`, index)}
                                    />
                                    <div className="item-image-uploader" onClick={() => document.getElementById(`item-image-upload-${index}`)?.click()}>
                                        {item.image && <img src={item.image} alt={item.name} className="item-image-thumb"/>}
                                    </div>
                                </td>
                                <td><input type="text" placeholder="Item name" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} /></td>
                                <td><input type="number" value={item.qty} min="1" onChange={e => handleItemChange(index, 'qty', parseInt(e.target.value, 10))} /></td>
                                <td><input type="number" placeholder="Price" value={item.price} onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))} /></td>
                                <td>{formatCurrency(item.qty * item.price)}</td>
                                <td>
                                    <button className="button btn-icon btn-danger" onClick={() => removeItem(index)} aria-label="Remove item">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={addItem} className="button btn-secondary" style={{marginBottom: '1rem'}}>Add Item</button>

                <div className="totals-and-notes">
                    <div className="notes-payment">
                        <div>
                            <h3>Notes</h3>
                            <textarea value={invoice.notes} onChange={e => handleInvoiceChange('notes', e.target.value)} placeholder="Any notes - terms, delivery info, etc." />
                        </div>
                        <div>
                            <h3>Payment Method</h3>
                            <textarea value={invoice.paymentMethod} onChange={e => handleInvoiceChange('paymentMethod', e.target.value)} placeholder="Payment details (e.g., bank account)" />
                        </div>
                    </div>
                    <div className="totals-section">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <strong>{formatCurrency(calculateSubtotal())}</strong>
                        </div>
                        <div className="total-row">
                            <span>Discount (%)</span>
                            <input type="number" value={invoice.discount} onChange={e => handleInvoiceChange('discount', parseFloat(e.target.value))} />
                        </div>
                        <div className="total-row grand-total">
                            <span>Total</span>
                            <strong>{formatCurrency(calculateTotal())}</strong>
                        </div>
                    </div>
                </div>
                
                <div className="signature-section">
                    <h3>Signature</h3>
                     <input 
                        id="signature-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'signature')}
                        style={{display: 'none'}}
                     />
                    {invoice.signature ? (
                        <div className="signature-container" onClick={() => document.getElementById('signature-upload')?.click()}>
                            <img src={invoice.signature} alt="Signature" style={{cursor: 'pointer'}} />
                        </div>
                    ) : (
                        <div className="signature-uploader" onClick={() => document.getElementById('signature-upload')?.click()}>
                            <span>Add Signature</span>
                        </div>
                    )}
                </div>
            </div>

            {savedInvoices.length > 0 && (
                <div className="saved-invoices-container">
                    <h2>Saved Invoices</h2>
                    <ul className="saved-invoices-list">
                        {savedInvoices.map((inv, index) => (
                            <li key={index} className="saved-invoice-item">
                                <span>{inv.invoiceNumber} - {inv.to}</span>
                                <div>
                                    <button onClick={() => handleLoadInvoice(inv)} className="button btn-secondary">Load</button>
                                    <button onClick={() => handleDeleteInvoice(inv.invoiceNumber)} className="button btn-danger">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);